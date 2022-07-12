// Export analytics data to csv
import express from 'express';
import {formatErr} from '../../errors';
import * as XLSX from 'xlsx';
import {query, validationResult} from 'express-validator';
import {fetchApi} from '../../utils/index';
import {SIMPLE_HEADER} from '../../constants';
import * as Excel from '../../utils/excel';


// eslint-disable-next-line new-cap
const router = express.Router();

router.get('/locations/export', [
  query('locationParents')
      .exists({
        checkFalsy: true,
        checkNull: true,
      })
      .withMessage('LOCATION PARENTS IS REQUIRED'),
  query('from')
      .optional()
      .escape(),
],
async function(req:any, res:any) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const customErr = {
      error: formatErr(400, errors.array()[0].msg, errors.array()[0].param),
    };
    return res.status(400).json(customErr);
  }
  /**
   * TODO
   * Currently calling api to get data.
   * Change to function call or local api call
   */
  const baseUrl = 'https://api-airquality.dev.netobjex.com/api/v1/';
  const location = 'locationParents='+req.query.locationParents;
  const from = req.query.from?'&from='+req.query.from:'';
  const fileName = 'Air Quality Report';
  const response=await fetchApi(
      baseUrl+'location-analytics?'+location+from,
      'GET',
      SIMPLE_HEADER,
      '',
  );
  if (response.status === 200) {
    if (response.data.status === false) {
      const customErr = {
        error: formatErr(500, 'Failed to fetch data', 'Fetching Data'),
      };
      return res.status(500).json(customErr);
    }
    // Convert the response to csv supported json structure
    const list:any = await Excel.parseAnalytics(response.data.data);
    // Order the coloumns as in the table
    const parsedList = JSON.parse(JSON.stringify(list, response.data.columns));

    // Convert json object to excel sheet
    const sheet = XLSX.utils.json_to_sheet(parsedList);

    // Convert the excel sheet to csv
    const csv = XLSX.utils.sheet_to_csv(sheet);

    /**
     * To convert to xlsx, add the sheet to a workbook.
     * Write the workbook to a file and send
     */
    // const wb = XLSX.utils.book_new();
    // XLSX.utils.book_append_sheet(wb, sheet, req.body.location);
    res.attachment(fileName+'.csv');
    res.status(200).send(csv);
  } else {
    const customErr = {
      error: formatErr(500, 'Failed to fetch data', 'Parsing Data'),
    };
    return res.status(400).json(customErr);
  }
});

export default router;
