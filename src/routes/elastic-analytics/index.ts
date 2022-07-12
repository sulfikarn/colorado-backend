import express from 'express';
import {query, validationResult} from 'express-validator';
import {Client} from '@elastic/elasticsearch';
import {
  ELASTIC_NODE,
  SIGFOX_METRICS_INDEX,
} from '../../constants';
import {
  buildLocationSummaryQuery,
  buildLocationAnalyticsQuery,
} from './queryBuilder';
import {
  convertLocationSummaryResponse,
  convertLocationAnalyticsResponse,
} from './filterQueryResponse';
import {formatErr} from '../../errors';
import log from '../../utils/log';
// eslint-disable-next-line new-cap
const router = express.Router();
const client = new Client({
  node: ELASTIC_NODE,
  requestTimeout: 3000,
});

/**
 * Get location based analytics of devices
 * @param {string} locationId Current location id
 * @param {string} locationPatents Array of location parents to be considered
 * @param {string} timeInterval Interval with which the API have to be called
 * @param {string} timestampStart Interval start time
 * @param {string} timestampEnd Interval end time
 */
router.get(
    '/location-analytics-summary',
    [
      query('locationId')
          .exists({
            checkFalsy: true,
            checkNull: true,
          }).escape()
          .optional()
          .withMessage('LOCATION ID IS REQUIRED'),
      query('locationParents')
          .exists({
            checkFalsy: true,
            checkNull: true,
          }).trim()
          .withMessage('LOCATION PARENTS IS REQUIRED'),
      query('timeInterval')
          .exists({
            checkFalsy: true,
            checkNull: true,
          })
          .withMessage('TIME INTERVAL IS REQUIRED'),
      query('timestampStart')
          .exists({
            checkFalsy: true,
            checkNull: true,
          }).trim()
          .optional()
          .withMessage('TIME INTERVAL IS REQUIRED'),
      query('timestampEnd')
          .exists({
            checkFalsy: true,
            checkNull: true,
          }).trim()
          .optional()
          .withMessage('TIME INTERVAL IS REQUIRED'),
    ],
    async function(req: any, res: any) {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const customErr = {
          error: formatErr(400, errors.array()[0].msg, errors.array()[0].param),
        };
        return res.status(400).json(customErr);
      }
      const presentTime = Date.now();
      // 3 months before present time
      const defaultTimeStart = new Date().setDate(new Date().getDate() - 90);
      const {
        timestampEnd = presentTime,
        timestampStart = defaultTimeStart,
        locationParents,
        timeInterval,
        locationId = '',
      } = req.query;
      try {
        const query = buildLocationSummaryQuery(
            locationId,
            locationParents,
            timeInterval,
            timestampStart,
            timestampEnd,
        );
        const {body} = await client.search({
          index: SIGFOX_METRICS_INDEX,
          body: {
            ...query,
          },
        });
        const finalResponse = convertLocationSummaryResponse(body);

        res.send(finalResponse);
      } catch (error) {
        log.error(
            `Error in /location-summary-analytics => ${error}`,
        );
        res.status(400).send('Something went wrong');
      }
    },
);

/**
 * Get location based analytics of devices
 * @param {string} locationPatents Array of location parents to be considered
 * @param {string} from Time to be used to limit the latest query [3h, 60d etc ]
 */
router.get(
    '/location-analytics',
    [
      query('locationParents')
          .exists({
            checkFalsy: true,
            checkNull: true,
          })
          .withMessage('LOCATION PARENTS IS REQUIRED'),
      query('from')
          .exists({
            checkFalsy: true,
            checkNull: true,
          })
          .optional()
          .withMessage('TIME FROM IS REQUIRED')
          .escape(),
      query('locationId')
          .exists({
            checkFalsy: true,
            checkNull: true,
          }).escape()
          .optional()
          .withMessage('LOCATION ID IS REQUIRED'),
    ],
    async function(req: any, res: any) {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const customErr = {
          error: formatErr(400, errors.array()[0].msg, errors.array()[0].param),
        };
        return res.status(400).json(customErr);
      }
      const {locationParents, from = '60d', locationId=''} = req.query;
      try {
        const query =
        await buildLocationAnalyticsQuery(locationParents, from, locationId);
        const {body} = await client.search({
          index: SIGFOX_METRICS_INDEX,
          body: {
            ...query,
          },
        });
        const finalResponse = convertLocationAnalyticsResponse(body);

        res.send(finalResponse);
      } catch (error) {
        log.error(`Error in /location-analytics => ${error}`,
        );
        res.status(400).send('Something went wrong');
      }
    },
);

export default router;
