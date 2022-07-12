// MongoDb Apis
import express from 'express';
import {formatErr} from '../../errors';
// import {checkJwt} from '../../middleware/jwt';
// MongoDB collection
import {NotificationModel} from '../../db/notification-model/notify.model';
// eslint-disable-next-line new-cap
const router = express.Router();


router.post('/notifications',
    async function(req:any, res:any) {
      // Add data to mongo
      try {
        const Notification = new NotificationModel;
        Notification.data = req.body;
        await Notification.save();
        return res.status(200).send();
      } catch (err) {
        const customErr = {
          error: formatErr(500, 'Failed to Save data', 'Database'),
        };
        return res.status(500).json(customErr);
      }
    });

router.get('/notifications',
    async function(req:any, res:any) {
      // Add data to mongo
      const groupId = (req.query.groupId)?req.query.groupId:null;
      if (groupId) {
        try {
          const data = await NotificationModel.find(
              {'data.groupId': groupId},
              {_id: 0, __v: 0},
          );
          if (data.length) {
            return res.status(200).send(data);
          } else {
            const customErr = {
              error: formatErr(404, 'No Notification Found', 'id'),
            };
            return res.status(404).send(customErr);
          }
        } catch (err) {
          const customErr = {
            error: formatErr(500, 'Failed to Fetch data', 'Database'),
          };
          return res.status(500).json(customErr);
        }
      } else {
        const customErr = {
          error: formatErr(400, 'Group Id Required', 'Group Id'),
        };
        return res.status(400).json(customErr);
      }
    });

export default router;
