// import test from 'ava';
// import {
//   buildLocationSummaryQuery,
//   buildLocationAnalyticsQuery,
// } from '../queryBuilder';

// export const QUERY_PARAMETERS = [
//   {label: 'co2', unit: 'ppm'},
//   {label: 'pm10', unit: 'ug/m3'},
//   {label: 'pm1.0', unit: 'ug/m3'},
//   {label: 'pm2.5', unit: 'ug/m3'},
//   {label: 'humidity', unit: '%'},
//   {label: 'temperature', unit: '°C'},
// ];

// const locationId = 'L1';
// const locationParents = ['L1', 'L2'];

// test('Should build location  summary query with correct parameters', (t) => {
//   const res = buildLocationSummaryQuery(
//       locationId,
//       JSON.stringify(locationParents),
//       5,
//       1612840220390,
//       1612840220394,
//   );
//   t.deepEqual(res,
//       {
//         size: 0,
//         query: {
//           bool: {
//             should: [
//               {
//                 term: {
//                   location_id: {
//                     value: 'L1',
//                   },
//                 },
//               },
//               {
//                 terms: {
//                   location_parents: [
//                     'L1',
//                     'L2',
//                   ],
//                 },
//               },
//             ],
//             filter: [
//               {
//                 range: {
//                   '@timestamp': {
//                     gte: 1612840220390,
//                     lte: 1612840220394,
//                   },
//                 },
//               },
//             ],
//           },
//         },
//         aggs: {
//           metrics: {
//             date_histogram: {
//               field: '@timestamp',
//               fixed_interval: 5,
//               min_doc_count: 1,
//             },
//             aggs: {
//               nested_doc: {
//                 nested: {
//                   path: 'metrics',
//                 },
//                 aggs: {
//                   average: {
//                     terms: {
//                       field: 'metrics.metric_name',
//                     },
//                     aggs: {
//                       metric_average: {
//                         avg: {
//                           field: 'metrics.value',
//                         },
//                       },
//                     },
//                   },
//                 },
//               },
//             },
//           },
//         },
//       });
// });

// // test(' Should build location analytics query with correct parameters', (t) => {
// //   const res = buildLocationAnalyticsQuery(JSON.stringify(locationParents));
// //   t.deepEqual(res, {
// //     size: 0,
// //     query: {
// //       bool: {
// //         filter: [
// //           {
// //             bool: {
// //               must: [
// //                 {
// //                   terms: {
// //                     location_parents: ['L1', 'L2'],
// //                   },
// //                 },
// //               ],
// //               filter: [
// //                 {
// //                   range: {
// //                     '@timestamp': {
// //                       gte: 'now-60d',
// //                     },
// //                   },
// //                 },
// //               ],
// //             },
// //           },
// //         ],
// //       },
// //     },
// //     aggs: {
// //       group: {
// //         terms: {
// //           field: 'location_id',
// //         },
// //         aggs: {
// //           group_2: {
// //             terms: {
// //               field: 'device_type',
// //             },
// //             aggs: {
// //               location: {
// //                 top_hits: {
// //                   size: 1,
// //                   sort: [
// //                     {
// //                       '@timestamp': {
// //                         order: 'desc',
// //                       },
// //                     },
// //                   ],
// //                 },
// //               },
// //             },
// //           },
// //         },
// //       },
// //     },
// //   });
// // });
