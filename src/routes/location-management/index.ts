import express from 'express';
import {BASE_URL, DEFAULT_SKIP, DEFAULT_LIMIT} from '../../constants';
import {body, validationResult} from 'express-validator';
import {formatErr} from '../../errors';
import {fetchApi, createHeader} from '../../utils/index';
import {checkJwt} from '../../middleware/jwt';
import * as parseData from '../../utils/parseResponse';
import {DeviceModel} from '../../db/device-model/device.model';


// eslint-disable-next-line new-cap
const router = express.Router();

/**
 * View locations Wrapper API For NetObjex Platform
 * Supports limit and skip (skip is page num, not num of data to skip)
 * Supports filter by group
 */
router.get('/locations/list', checkJwt,
    async function(req:any, res:any) {
      const header = createHeader('auth', res.locals.jwtPayload.token);

      const limit = req.query.limit || DEFAULT_LIMIT;
      // req.query.skip is the page number,
      // need to convert it to number of data before invoking platform
      const page = req.query.skip;
      const skip = (req.query.skip)?(limit*(req.query.skip-1)):DEFAULT_SKIP;

      // Query to filter location by group if groupId exists
      const filterLocation = (req.query.groupId)?
            'filter[where][customerid]='+req.query.groupId+'&':'';
      const filterCount = (req.query.groupId)?
            '[where][customerid]='+req.query.groupId:'';

      // Query to filter location fields
      // eslint-disable-next-line max-len
      const filterFields = 'filter[fields][name]=true&filter[fields][id]=true&filter[fields][customerid]=true';
      const filterPage = (limit)?
                      '&filter[limit]='+limit+'&filter[skip]='+skip:'/';

      // Call platform api
      const response=await fetchApi(
          // eslint-disable-next-line
          BASE_URL+'/api/locations?'+filterLocation+filterFields+filterPage,
          'GET',
          header,
          '');
      if (response.status === 200) {
        const resp = response.data;
        const data = resp.map((location : any) => {
          return parseData.location(location);
        });
        // Get the total count for pagination
        const count =await fetchApi(
            BASE_URL+'/api/locations/count?'+filterCount,
            'GET',
            header,
            '',
        );
        if (count.status === 200) {
          const totalPages = Math.ceil(count.data.count/limit);
          res.status(response.status).send({
            data: data,
            page: page,
            perPage: limit,
            count: count.data.count,
            totalPages: totalPages,
          });
        } else {
          res.status(count.status).send(count.data);
        }
      } else {
        res.status(response.status).send(response.data);
      }
    });

/**
 * Add new location Wrapper API For NetObjex Platform
 * @param {string} name
 * @param {string} locationId
 * @param {string} groupId
 * @param {[string]} parentList
 */
router.post('/locations', [checkJwt], [
  body('name').exists({
    checkFalsy: true,
    checkNull: true,
  })
      .withMessage('NAME IS REQUIRED')
      .escape(),
  body('groupId').exists({
    checkFalsy: true,
    checkNull: true,
  })
      .withMessage('Group Id IS REQUIRED')
      .escape(),
], async function(req:any, res:any) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const customErr = {
      error: formatErr(400, errors.array()[0].msg, errors.array()[0].param),
    };
    return res.status(400).json(customErr);
  }
  const header = createHeader('auth', res.locals.jwtPayload.token);
  // Call platform api to fetch the parentList of parent location
  const locationId = req.body.locationId || null;
  const response1 = (locationId)?
    await fetchApi(
        // eslint-disable-next-line max-len
        BASE_URL+'/api/locations/'+locationId+'?filter[fields][additional]=true',
        'GET',
        header,
        '',
    ):
    null;

  // Append the parent location to parentList
  const list = (response1)?
    [response1.data.additional, locationId].filter(Boolean).join(','):
    locationId;
  const response=await fetchApi(
      BASE_URL+'/api/locations',
      'POST',
      header,
      JSON.stringify({
        name: req.body.name,
        parentid: locationId,
        customerid: req.body.groupId,
        additional: list,
      }));
  if (response.status === 200) {
    const data = parseData.location(response.data);
    res.status(response.status).send(data);
  } else {
    res.status(response.status).send(response.data);
  }
});

/**
 * List locations (in tree-struct) Wrapper API For NetObjex Platform
 */
router.get('/locations/tree', checkJwt,
    async function(req:any, res:any) {
      const header = createHeader('auth', res.locals.jwtPayload.token);
      const query = (req.query.groupId)?
            ('?customerId='+req.query.groupId):'/';
      // Call platform api
      const response=await fetchApi(
          // eslint-disable-next-line
          BASE_URL+'/api/locations/get-tree'+query,
          'GET',
          header,
          '');
      res.status(response.status).send(response.data);
    });

/**
 * Update location Wrapper API For NetObjex Platform
 * @param {string} name
 */
router.patch('/locations/:id', [checkJwt], [
  body('name').exists({
    checkFalsy: true,
    checkNull: true,
  })
      .withMessage('NAME IS REQUIRED')
      .escape(),
], async function(req:any, res:any) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const customErr = {
      error: formatErr(400, errors.array()[0].msg, errors.array()[0].param),
    };
    return res.status(400).json(customErr);
  }
  const header = createHeader('auth', res.locals.jwtPayload.token);
  // Call platform api
  const response=await fetchApi(
      BASE_URL+'/api/locations/'+req.params.id,
      'PATCH',
      header,
      JSON.stringify({
        name: req.body.name,
      }));
  if (response.status === 200) {
    const data = parseData.location(response.data);
    // Update the location name for all device mapped under the location
    const deviceResponse=await fetchApi(
        BASE_URL+'/api/devices/update?where[locationid]='+req.params.id,
        'POST',
        header,
        JSON.stringify({
          description: data.name,
        }));
    if (deviceResponse.status ===200) {
      try {
        await DeviceModel.updateMany(
            {'location_id': req.params.id},
            {$set: {
              'location_name': data.name,
            },
            },
        );
      } catch (e) {
        const customErr = {
          error: formatErr(
              500,
              'Failed To Update',
              'in Updating Database'),
        };
        return res.status(500).json(customErr);
      }
      res.status(response.status).send(data);
    } else {
      const customErr = {
        error: formatErr(
            500,
            'Failed To Update',
            'in Updating Data'),
      };
      return res.status(500).json(customErr);
    }
  } else {
    res.status(response.status).send(response.data);
  }
});

/**
 * Delete locations Wrapper API For NetObjex Platform
 * If mapped device exists, return error
 */
router.delete('/locations/:id', checkJwt,
    async function(req:any, res:any) {
      const header = createHeader('auth', res.locals.jwtPayload.token);
      // Call platform api
      const devices =await fetchApi(
          BASE_URL+'/api/devices/count?[where][locationid]='+req.params.id,
          'GET',
          header,
          '',
      );
      if (devices.data.count) {
        const customErr = {
          error: formatErr(
              400,
              'Cannot Delete Location : Devices are mapped to this location',
              'deleting location',
          ),
        };
        return res.status(400).json(customErr);
      } else {
        const response=await fetchApi(
            BASE_URL+'/api/locations/'+req.params.id,
            'DELETE',
            header,
            '',
        );
        res.status(response.status).send(response.data);
      }
    });

/**
 * Get a location Wrapper API For NetObjex Platform
 */
router.get('/locations/:id', checkJwt,
    async function(req:any, res:any) {
      const header = createHeader('auth', res.locals.jwtPayload.token);
      // Call platform api
      const response=await fetchApi(
          BASE_URL+'/api/locations/'+req.params.id,
          'GET',
          header,
          '',
      );
      if (response.status === 200) {
        const data = parseData.location(response.data);
        res.status(response.status).send(data);
      } else {
        res.status(response.status).send(response.data);
      }
    });

export default router;
