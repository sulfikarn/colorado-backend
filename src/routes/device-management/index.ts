import express from 'express';
import {BASE_URL, DEFAULT_LIMIT, DEFAULT_SKIP} from '../../constants';
import {FILE_TYPE} from '../../constants';
import {body, validationResult} from 'express-validator';
import {formatErr, formatBulkErr} from '../../errors';
import {fetchApi, createHeader, cleanObj} from '../../utils/index';
import * as parseData from '../../utils/parseResponse';
import {checkJwt} from '../../middleware/jwt';
// MongoDB collection
import {DeviceModel} from '../../db/device-model/device.model';
import fileUpload from 'express-fileupload';
import FormData from 'form-data';
import * as Excel from '../../utils/excel';


// eslint-disable-next-line new-cap
const router = express.Router();

/**
 * List devices Wrapper API For NetObjex Platform
 * Supports limit and skip (skip is page num, not num of data to skip)
 * Supports filter by location and/or group
 */
router.get('/devices/list', checkJwt,
    async function(req:any, res:any) {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const customErr = {
          error: formatErr(400, errors.array()[0].msg, errors.array()[0].param),
        };
        return res.status(400).json(customErr);
      }
      // Set Header
      const header = createHeader('auth', res.locals.jwtPayload.token);

      const limit = req.query.limit || DEFAULT_LIMIT;
      // req.query.skip is the page number,
      // need to convert it to number of data before invoking platform
      const page = req.query.skip;
      const skip = (req.query.skip)?(limit*(req.query.skip-1)):DEFAULT_SKIP;

      // Query to filter devices by location if locationId exists
      const filterLocation = (req.query.locationId)?
        '[where][and][0][tags][regexp]=/'+req.query.locationId+'/':null;

      // Query to filter devices by group if groupId exists
      const filterGroup = (req.query.groupId)?
        '[where][and][1][customerid]='+req.query.groupId:'';

      // Append group and device filter query
      const filterList = (filterLocation)?
        ((filterGroup)?'filter'+filterLocation+'&filter'+filterGroup:
         'filter'+filterLocation):
        ((filterGroup)?'filter'+filterGroup:'');

      // Query to include device type data
      const filterDevice = 'filter[include][deviceType]';

      const filterLimit = 'filter[limit]='+limit;
      const filterSkip = 'filter[skip]='+skip;

      // Call platform Api
      const response=await fetchApi(
      // eslint-disable-next-line max-len
          BASE_URL+'/api/devices?'+filterList+'&'+filterDevice+'&'+filterLimit+'&'+filterSkip,
          'GET',
          header,
          '',
      );
      if (response.status === 200) {
        const resp = response.data;
        const data = resp.map((device : any) => {
          return parseData.device(device);
        });
        // Get the total count for pagination
        const count =await fetchApi(
            BASE_URL+'/api/devices/count?'+filterLocation+'&'+filterGroup,
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
 * List device types Wrapper API For NetObjex Platform
 */
router.get('/devices/types/list', checkJwt,
    async function(req:any, res:any) {
      const header = createHeader('auth', res.locals.jwtPayload.token);
      // Call platform api
      const response=await fetchApi(
          BASE_URL+'/api/device-types',
          'GET',
          header,
          '',
      );
      res.status(response.status).send(response.data);
    });

/**
 * Add new device Wrapper API For NetObjex Platform
 * @param {string} name
 * @param {string} groupId
 * @param {string} deviceId
 * @param {string} deviceType
 */
router.post('/devices', [checkJwt], [
  body('name').exists({
    checkFalsy: true,
    checkNull: true,
  })
      .withMessage('NAME IS REQUIRED')
      .escape(),
  body('deviceId').exists({
    checkFalsy: true,
    checkNull: true,
  })
      .withMessage('Device Id IS REQUIRED')
      .escape(),
  body('deviceType').exists({
    checkFalsy: true,
    checkNull: true,
  })
      .withMessage('Device Type IS REQUIRED')
      .escape(),
  body('groupId').exists({
    checkFalsy: true,
    checkNull: true,
  })
      .withMessage('Group ID IS REQUIRED')
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
      BASE_URL+'/api/devices',
      'POST',
      header,
      JSON.stringify({
        type: req.body.deviceType,
        deviceid: req.body.deviceId,
        name: req.body.name,
        parentid: null,
        customerid: req.body.groupId,
        // tag field is used to store list of location parents (for analytics)
        tags: 'nil',
      }));
  if (response.status === 200) {
    const data = parseData.device(response.data);
    res.status(response.status).send(data);
  } else {
    res.status(response.status).send(response.data);
  }
});

/**
 * Update device Wrapper API For NetObjex Platform
 * @param {string} name
 * @param {string} groupId
 * @param {string} deviceId
 * @param {string} deviceType
 */
router.patch('/devices/:id', [checkJwt], [
  body('name').optional()
      .escape(),
  body('deviceId').optional()
      .escape(),
  body('deviceType').optional()
      .escape(),
  body('groupId').optional()
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
      BASE_URL+'/api/devices/'+req.params.id,
      'PATCH',
      header,
      JSON.stringify(cleanObj({
        type: req.body.deviceType || '',
        deviceid: req.body.deviceId || '',
        name: req.body.name || '',
        customerid: req.body.groupId || '',
      })));
  if (response.status === 200) {
    const data = parseData.device(response.data);
    res.status(response.status).send(data);
  } else {
    res.status(response.status).send(response.data);
  }
});

/**
 * Map/un-Map a device-location Wrapper API For NetObjex Platform
 * Set location as null to un-map a device
 * @param {string} name
 * @param {string} location
 */
router.patch('/devices/:id/map', [checkJwt], [
  body('location').exists({
    checkNull: false,
  })
      .withMessage('Location IS REQUIRED')
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
  const locationId = req.body.location || null;
  // Filter location response
  // eslint-disable-next-line max-len
  const filterLoc = '?filter[fields][additional]=true&filter[fields][name]=true';
  const response1 = (locationId)?
  // Fetch the parentList of location
    await fetchApi(
        BASE_URL+'/api/locations/'+locationId+filterLoc,
        'GET',
        header,
        '',
    ):
    null;
  const locationName = (response1)?response1.data.name:null;
  // If un-mapping, set the parentList to 'nil'
  // If not set to nil, cannot filter the un-mapped devices
  const list = (response1)?
    [response1.data.additional, locationId].filter(Boolean).join(','):
    'nil';

  const response=await fetchApi(
      BASE_URL+'/api/devices/'+req.params.id,
      'PATCH',
      header,
      JSON.stringify({
        name: req.body.name,
        locationid: locationId,
        description: locationName,
        tags: list,
      }));
  if (response.status === 200) {
    const data = parseData.device(response.data);
    // Updated the data in mongodb
    try {
      await DeviceModel.updateOne(
          {'device_id': data.deviceId},
          {$set: {
            'device_id': data.deviceId,
            'device_type': data.typeId,
            'uuid': data.id,
            'device_name': data.name,
            'location_id': data.locationId,
            'location_name': data.location,
            'location_parents': data.locationList,
            'group_id': data.customerId,
            'org_id': data.orgId,
          },
          },
          {upsert: true},
      );
    } catch (e) {
      // If error in updating mongo, un-map the device and send error.
      const unMap=await fetchApi(
          BASE_URL+'/api/devices/'+req.params.id,
          'PATCH',
          header,
          JSON.stringify({
            name: req.body.name,
            locationid: null,
            description: locationName,
            tags: 'nil',
          }));
      if (unMap.status === 200) {
        // const data = parseData.device(unMap.data);
        const customErr = {
          error: formatErr(
              400,
              'Failed to update data : Device Unmapped',
              'saving to database',
          ),
        };
        return res.status(400).json(customErr);
      }
    }
    res.status(response.status).send(data);
  } else {
    res.status(response.status).send(response.data);
  }
});

/**
 * Delete a device Wrapper API For NetObjex Platform
 */
router.delete('/devices/:id', [checkJwt],
    async function(req:any, res:any) {
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
          BASE_URL+'/api/devices/'+req.params.id,
          'DELETE',
          header,
          '',
      );
      if (response.data.count) {
        // Delete the device from mongodb
        try {
          await DeviceModel.deleteOne(
              {'uuid': req.params.id},
          );
        } catch (err) {
          const customErr = {
            error: formatErr(
                500,
                'Failed to Delete data',
                'deleting from database',
            ),
          };
          res.status(500).json(customErr);
        }
      }
      res.status(response.status).send(response.data);
    });

/**
 * Get devices By Id Wrapper API For NetObjex Platform
 */
router.get('/devices/:id', checkJwt,
    async function(req:any, res:any) {
      const header = createHeader('auth', res.locals.jwtPayload.token);
      // Query to include device type data
      const filterDevice = 'filter[include][deviceType]';
      // Call platform api
      const response=await fetchApi(
          BASE_URL+'/api/devices/'+req.params.id+'?'+filterDevice,
          'GET',
          header,
          '',
      );
      if (response.status === 200) {
        const data = parseData.device(response.data);
        res.status(response.status).send(data);
      } else {
        res.status(response.status).send(response.data);
      }
    });

/**
 * Bulk Import Devices
 * Upload file => Verify file data => Import to platform
 * Platform does not support csv now
 */
router.post('/devices/upload', [checkJwt, fileUpload({
  limits: {
    fileSize: 2000000, // 2mb (in byte)
  },
  abortOnLimit: true,
})],
async function(req:any, res:any) {
  // Check if file exist
  if (!req.files) {
    const customErr = {
      error: formatErr(400, 'DATA IS REQUIRED', 'FILE'),
    };
    return res.status(400).json(customErr);
  }

  const form = new FormData();
  // Verify the file type
  if (!FILE_TYPE.includes(req.files.data.mimetype)) {
    const customErr = {
      error: formatErr(400, 'INVALID FILE TYPE', 'File TYPE'),
    };
    return res.status(400).json(customErr);
  }

  // Check if device-type id exists
  if (!req.body.type) {
    const customErr = {
      error: formatErr(400, 'DEVICE TYPE REQUIRED', 'Device TYPE'),
    };
    return res.status(400).json(customErr);
  }

  // Check if group id exists
  if (!req.body.groupId) {
    const customErr = {
      error: formatErr(400, 'Group Id is REQUIRED', 'Group Id'),
    };
    return res.status(400).json(customErr);
  }

  form.append('file', req.files.data.data, {
    contentType: req.files.data.mimetype,
    filename: req.files.data.name,
  });

  // Verify the file content
  const result = await Excel.validate(req.files.data);
  if (result.status !== '200') {
    const data = {
      count: (result.data).length,
      message: result.data,
    };
    return res.status(result.status).send(data);
  }

  // Header to upload file
  const uploadHeader = createHeader('file', res.locals.jwtPayload.token);
  // Header to verify and import file to platform
  const header = createHeader('auth', res.locals.jwtPayload.token);

  // Call platform api to upload file
  const uploadResponse=await fetchApi(
      BASE_URL+'/api/files/upload?type=COUPON_IMAGE',
      'POST',
      uploadHeader,
      form,
  );
  if (uploadResponse.status==200) {
    // Call platform api to verify if devices already exists
    const verifyResponse=await fetchApi(
        BASE_URL+'/api/devices/verifyimport',
        'POST',
        header,
        JSON.stringify({
          typeid: req.body.type,
          fileurl: uploadResponse.data[0].fullpath,
        }),
    );
    if (!verifyResponse.data.valid) {
      // parse the error message
      const err = formatBulkErr(verifyResponse.data.errors);
      res.status(400).send(err);
    } else {
      // Import the devices to platform
      const importResponse=await fetchApi(
          BASE_URL+'/api/devices/import',
          'POST',
          header,
          JSON.stringify({
            typeid: req.body.type,
            customerid: req.body.groupId,
            fileurl: uploadResponse.data[0].fullpath,
          }),
      );
      if (importResponse.status === 200) {
        const count=(importResponse.data).length;
        res.status(importResponse.status)
            .send({count: count});
      } else {
        res.status(importResponse.status).send(importResponse.data);
      }
    }
  } else {
    res.status(uploadResponse.status).send(uploadResponse.data);
  }
  // res.status(200).send();
});

export default router;
