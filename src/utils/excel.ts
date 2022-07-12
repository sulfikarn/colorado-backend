import {formatErr} from '../errors';
import * as XLSX from 'xlsx';
const CSVFileValidator = require('csv-file-validator');

/**
 * Validates the given sheet/csv file data format
 * @param {file} file
 */
export const validate = async (file:any) => {
  /**
   * Required File Structure
   * 2 coloumns
   * name,deviceid (required and unique)
   */
  try {
    const testbook = XLSX.read(file.data);
    const testSheet = testbook.Sheets[testbook.SheetNames[0]];
    const csv =await XLSX.utils.sheet_to_csv(testSheet);
    const headersList = csv.split(/\r?\n/);
    const headers = headersList[0].split(',');
    const parsedHeader = headers.filter(Boolean);
    // Check if header has more than 2 coloumns
    if (parsedHeader.length > 2) {
      const customErr = {
        error: formatErr(
            400,
            'Invalid Structure : Too Many Columns',
            'File'),
      };
      return {
        status: '400',
        data: customErr,
      };
    }

    // Set the validation rules
    const config = {
      headers: [
        {
          name: 'name',
          inputName: 'name',
          required: true,
          // eslint-disable-next-line max-len
          requiredError: function(headerName:string, rowNumber:number, columnNumber:number) {
            // eslint-disable-next-line max-len
            return `${headerName} is required in the ${rowNumber} row / ${columnNumber} column`;
          },
          unique: true,
          uniqueError: function(headerName:string) {
            return `${headerName} is not unique`;
          },
        },
        {
          name: 'deviceid',
          inputName: 'deviceid',
          required: true,
          // eslint-disable-next-line max-len
          requiredError: function(headerName:string, rowNumber:number, columnNumber:number) {
            // eslint-disable-next-line max-len
            return `${headerName} is required in the ${rowNumber} row / ${columnNumber} column`;
          },
          unique: true,
          uniqueError: function(headerName:string) {
            return `${headerName} should be unique`;
          },
        },
      ],
    };

    // Validate the file with the defined rules
    // eslint-disable-next-line new-cap
    const csvData = await CSVFileValidator(csv, config);
    if (csvData.inValidMessages.length) {
      return {
        status: '400',
        data: csvData.inValidMessages,
      };
    } else {
      return {
        status: '200',
        data: csvData.data,
      };
    }
  } catch (err) {
    // console.log(err)
    const customErr = {
      error: formatErr(500, 'Server Error', 'parsing data'),
    };
    return {
      status: '500',
      data: customErr,
    };
  }
};

/**
 * Parse the analytics response to csv supported json structure
 * @param {[Object]} data
 */
export const parseAnalytics = async (data:any) => {
  const parsedData = data.map((itm:any)=>{
    const filteredArgs = Object.keys(itm).reduce((acc, key) => {
      const _acc:any = acc;
      // eslint-disable-next-line max-len
      if (itm[key] !== undefined && itm[key] !== 'undefined' && itm[key] !== null && itm[key] !== '') {
        if (typeof itm[key] === 'object') {
          _acc[key] = `${itm[key].value} ${itm[key].unit}`;
        } else {
          _acc[key] = itm[key];
        }
      }
      return _acc;
    }, {});
    return filteredArgs;
  });
  return parsedData;
};
