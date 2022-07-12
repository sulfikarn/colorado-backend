// MongoDb Apis
import express from 'express';
import {formatErr} from '../../errors';
// import {checkJwt} from '../../middleware/jwt';
// MongoDB collection
import {DeviceModel} from '../../db/device-model/device.model';
// eslint-disable-next-line new-cap
const router = express.Router();

// Get a device from mongo with given deviceid (Not the platform uuid)
router.get('/mapping/devices/:id',
    async function(req:any, res:any) {
      // Fetch data from mongo
      try {
        const data = await DeviceModel.findOne(
            {device_id: req.params.id},
            {_id: 0, __v: 0},
        );
        if (data) {
          return res.status(200).send(data);
        } else {
          const customErr = {
            error: formatErr(400, 'No Device Found', 'id'),
          };
          return res.status(404).send(customErr);
        }
      } catch (err) {
        const customErr = {
          error: formatErr(500, 'Failed to fetch device', 'Database'),
        };
        return res.status(500).json(customErr);
      }
    });

export default router;
