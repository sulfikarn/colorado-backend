import test from 'ava';
import {
  convertLocationSummaryResponse,
  convertLocationAnalyticsResponse,
} from '../filterQueryResponse';

export const QUERY_PARAMETERS:any = {
  'CO2': {unit: 'ppm'},
  'PM10': {unit: 'μg/m³'},
  'PM1.0': {unit: 'μg/m³'},
  'PM2.5': {unit: 'μg/m³'},
  'Humidity': {unit: '%'},
  'Temperature': {unit: '°C'},
};

const queryResponse=
{
  'took': 1,
  'timed_out': false,
  '_shards': {
    'total': 6,
    'successful': 6,
    'skipped': 0,
    'failed': 0,
  },
  'hits': {
    'total': {
      'value': 10,
      'relation': 'eq',
    },
    'max_score': null,
    'hits': [],
  },
  'aggregations': {
    'metrics': {
      'buckets': [
        {
          'key_as_string': '2021-02-10T01:00:00.000Z',
          'key': 1612918800000,
          'doc_count': 3,
          'nested_doc': {
            'doc_count': 11,
            'average': {
              'doc_count_error_upper_bound': 0,
              'sum_other_doc_count': 0,
              'buckets': [
                {
                  'key': 'Humidity',
                  'doc_count': 3,
                  'metric_average': {
                    'value': 41.666666666666664,
                  },
                },
                {
                  'key': 'Temperature',
                  'doc_count': 3,
                  'metric_average': {
                    'value': 30.666666666666668,
                  },
                },
                {
                  'key': 'CO2',
                  'doc_count': 2,
                  'metric_average': {
                    'value': 425.0,
                  },
                },
                {
                  'key': 'PM1.0',
                  'doc_count': 1,
                  'metric_average': {
                    'value': 35.0,
                  },
                },
                {
                  'key': 'PM10',
                  'doc_count': 1,
                  'metric_average': {
                    'value': 35.0,
                  },
                },
                {
                  'key': 'PM2.5',
                  'doc_count': 1,
                  'metric_average': {
                    'value': 54.0,
                  },
                },
              ],
            },
          },
        },
        {
          'key_as_string': '2021-02-10T01:30:00.000Z',
          'key': 1612920600000,
          'doc_count': 3,
          'nested_doc': {
            'doc_count': 13,
            'average': {
              'doc_count_error_upper_bound': 0,
              'sum_other_doc_count': 0,
              'buckets': [
                {
                  'key': 'Humidity',
                  'doc_count': 3,
                  'metric_average': {
                    'value': 46.333333333333336,
                  },
                },
                {
                  'key': 'Temperature',
                  'doc_count': 3,
                  'metric_average': {
                    'value': 30.333333333333332,
                  },
                },
                {
                  'key': 'PM1.0',
                  'doc_count': 2,
                  'metric_average': {
                    'value': 32.0,
                  },
                },
                {
                  'key': 'PM10',
                  'doc_count': 2,
                  'metric_average': {
                    'value': 37.5,
                  },
                },
                {
                  'key': 'PM2.5',
                  'doc_count': 2,
                  'metric_average': {
                    'value': 55.0,
                  },
                },
                {
                  'key': 'CO2',
                  'doc_count': 1,
                  'metric_average': {
                    'value': 400.0,
                  },
                },
              ],
            },
          },
        },
        {
          'key_as_string': '2021-02-10T12:30:00.000Z',
          'key': 1612960200000,
          'doc_count': 4,
          'nested_doc': {
            'doc_count': 16,
            'average': {
              'doc_count_error_upper_bound': 0,
              'sum_other_doc_count': 0,
              'buckets': [
                {
                  'key': 'Humidity',
                  'doc_count': 4,
                  'metric_average': {
                    'value': 45.75,
                  },
                },
                {
                  'key': 'Temperature',
                  'doc_count': 4,
                  'metric_average': {
                    'value': 31.25,
                  },
                },
                {
                  'key': 'CO2',
                  'doc_count': 2,
                  'metric_average': {
                    'value': 425.0,
                  },
                },
                {
                  'key': 'PM1.0',
                  'doc_count': 2,
                  'metric_average': {
                    'value': 27.5,
                  },
                },
                {
                  'key': 'PM10',
                  'doc_count': 2,
                  'metric_average': {
                    'value': 37.5,
                  },
                },
                {
                  'key': 'PM2.5',
                  'doc_count': 2,
                  'metric_average': {
                    'value': 50.0,
                  },
                },
              ],
            },
          },
        },
      ],
    },
  },
};


const queryResponseEmpty = {
  'took': 3,
  'timed_out': false,
  '_shards': {
    'total': 9,
    'successful': 9,
    'skipped': 4,
    'failed': 0,
  },
  'hits': {
    'total': {
      'value': 0,
      'relation': 'eq',
    },
    'max_score': null,
    'hits': [],
  },
  'aggregations': {
    'metrics': {
      'buckets': [
      ],
    },
  },
};

test('Should convert elastic search response to approprate version', (t) => {
  const res = convertLocationSummaryResponse(
      queryResponse,
      QUERY_PARAMETERS,
  );
  t.deepEqual(res, [
    {
      id: 0,
      label: 'Humidity',
      value: 45.75,
      unit: '%',
      chartData: [
        {
          X: 1612918800000,
          Y: 41.66,
        },
        {
          X: 1612920600000,
          Y: 46.33,
        },
        {
          X: 1612960200000,
          Y: 45.75,
        },
      ],
      level: 'SATISFACTORY',
    },
    {
      id: 1,
      label: 'Temperature',
      value: 31.25,
      unit: '°C',
      chartData: [
        {
          X: 1612918800000,
          Y: 30.66,
        },
        {
          X: 1612920600000,
          Y: 30.33,
        },
        {
          X: 1612960200000,
          Y: 31.25,
        },
      ],
      level: 'DANGER',
    },
    {
      id: 2,
      label: 'CO2',
      value: 425,
      unit: 'ppm',
      chartData: [
        {
          X: 1612918800000,
          Y: 425,
        },
        {
          X: 1612920600000,
          Y: 400,
        },
        {
          X: 1612960200000,
          Y: 425,
        },
      ],
      level: 'SATISFACTORY',
    },
    {
      id: 3,
      label: 'PM1.0',
      value: 27.5,
      unit: 'μg/m³',
      chartData: [
        {
          X: 1612918800000,
          Y: 35,
        },
        {
          X: 1612920600000,
          Y: 32,
        },
        {
          X: 1612960200000,
          Y: 27.5,
        },
      ],
      level: 'GOOD',
    },
    {
      id: 4,
      label: 'PM10',
      value: 37.5,
      unit: 'μg/m³',
      chartData: [
        {
          X: 1612918800000,
          Y: 35,
        },
        {
          X: 1612920600000,
          Y: 37.5,
        },
        {
          X: 1612960200000,
          Y: 37.5,
        },
      ],
      level: 'GOOD',
    },
    {
      id: 5,
      label: 'PM2.5',
      value: 50,
      unit: 'μg/m³',
      chartData: [
        {
          X: 1612918800000,
          Y: 54,
        },
        {
          X: 1612920600000,
          Y: 55,
        },
        {
          X: 1612960200000,
          Y: 50,
        },
      ],
      level: 'GOOD',
    },
  ]);
});


test('Should give records not found response', (t) => {
  const res = convertLocationSummaryResponse(
      queryResponseEmpty,
      QUERY_PARAMETERS,
  );
  t.deepEqual(res, {
    status: false,
    message: 'No records found',
  });
});

const queryResponseAnalytics = {
  'took': 1,
  'timed_out': false,
  '_shards': {
    'total': 3,
    'successful': 3,
    'skipped': 0,
    'failed': 0,
  },
  'hits': {
    'total': {
      'value': 20,
      'relation': 'eq',
    },
    'max_score': null,
    'hits': [],
  },
  'aggregations': {
    'group': {
      'doc_count_error_upper_bound': 0,
      'sum_other_doc_count': 0,
      'buckets': [
        {
          'key': 'L1',
          'doc_count': 10,
          'group_2': {
            'doc_count_error_upper_bound': 0,
            'sum_other_doc_count': 0,
            'buckets': [
              {
                'key': 'D1',
                'doc_count': 6,
                'location': {
                  'hits': {
                    'total': {
                      'value': 6,
                      'relation': 'eq',
                    },
                    'max_score': null,
                    'hits': [
                      {
                        '_index': 'airq-sigfox-metrics-000001',
                        '_type': '_doc',
                        '_id': 'EB9toXcBuJQ_-lmTaveb',
                        '_score': null,
                        '_source': {
                          'metrics': [
                            {
                              'metric_name': 'CO2',
                              'value': 250,
                            },
                            {
                              'metric_name': 'Humidity',
                              'value': 50,
                            },
                            {
                              'metric_name': 'Temperature',
                              'value': 30,
                            },
                          ],
                          '@timestamp': 1612960200000,
                          'device_id': 'D1',
                          'device_type': 'Co2',
                          'device_name': 'co2 sensor denver',
                          'location_id': 'L1',
                          'location_name': 'class 7',
                          'location_parents': [
                            'L0',
                          ],
                          'org_id': 'colorado',
                          'group_id': 'G1',
                        },
                        'sort': [
                          1612960200000,
                        ],
                      },
                    ],
                  },
                },
              },
              {
                'key': 'D3',
                'doc_count': 4,
                'location': {
                  'hits': {
                    'total': {
                      'value': 4,
                      'relation': 'eq',
                    },
                    'max_score': null,
                    'hits': [
                      {
                        '_index': 'airq-sigfox-metrics-000001',
                        '_type': '_doc',
                        '_id': 'Dx9toXcBuJQ_-lmTaveb',
                        '_score': null,
                        '_source': {
                          'metrics': [
                            {
                              'metric_name': 'PM1.0',
                              'value': 30,
                            },
                            {
                              'metric_name': 'Humidity',
                              'value': 50,
                            },
                            {
                              'metric_name': 'Temperature',
                              'value': 30,
                            },
                            {
                              'metric_name': 'PM2.5',
                              'value': 50,
                            },
                            {
                              'metric_name': 'PM10',
                              'value': 30,
                            },
                          ],
                          '@timestamp': 1612960250000,
                          'device_id': 'D3',
                          'device_type': 'PM',
                          'device_name': 'PM sensor denver',
                          'location_id': 'L1',
                          'location_name': 'class 7',
                          'location_parents': [
                            'L0',
                          ],
                          'org_id': 'colorado',
                          'group_id': 'G1',
                        },
                        'sort': [
                          1612960250000,
                        ],
                      },
                    ],
                  },
                },
              },
            ],
          },
        },
        {
          'key': 'L2',
          'doc_count': 10,
          'group_2': {
            'doc_count_error_upper_bound': 0,
            'sum_other_doc_count': 0,
            'buckets': [
              {
                'key': 'D4',
                'doc_count': 6,
                'location': {
                  'hits': {
                    'total': {
                      'value': 6,
                      'relation': 'eq',
                    },
                    'max_score': null,
                    'hits': [
                      {
                        '_index': 'airq-sigfox-metrics-000001',
                        '_type': '_doc',
                        '_id': 'gh9uoXcBuJQ_-lmTJv5b',
                        '_score': null,
                        '_source': {
                          'metrics': [
                            {
                              'metric_name': 'PM1.0',
                              'value': 25,
                            },
                            {
                              'metric_name': 'Humidity',
                              'value': 40,
                            },
                            {
                              'metric_name': 'Temperature',
                              'value': 35,
                            },
                            {
                              'metric_name': 'PM2.5',
                              'value': 50,
                            },
                            {
                              'metric_name': 'PM10',
                              'value': 45,
                            },
                          ],
                          '@timestamp': 1612960200000,
                          'device_id': 'D4',
                          'device_type': 'PM',
                          'device_name': 'PM sensor denver',
                          'location_id': 'L2',
                          'location_name': 'class 8',
                          'location_parents': [
                            'L0',
                          ],
                          'org_id': 'colorado',
                          'group_id': 'G1',
                        },
                        'sort': [
                          1612960200000,
                        ],
                      },
                    ],
                  },
                },
              },
              {
                'key': 'D2',
                'doc_count': 4,
                'location': {
                  'hits': {
                    'total': {
                      'value': 4,
                      'relation': 'eq',
                    },
                    'max_score': null,
                    'hits': [
                      {
                        '_index': 'airq-sigfox-metrics-000001',
                        '_type': '_doc',
                        '_id': 'Eh9toXcBuJQ_-lmTaveb',
                        '_score': null,
                        '_source': {
                          'metrics': [
                            {
                              'metric_name': 'CO2',
                              'value': 600,
                            },
                            {
                              'metric_name': 'Humidity',
                              'value': 43,
                            },
                            {
                              'metric_name': 'Temperature',
                              'value': 30,
                            },
                          ],
                          '@timestamp': 1612960200000,
                          'device_id': 'D2',
                          'device_type': 'Co2',
                          'device_name': 'co2 sensor denver',
                          'location_id': 'L2',
                          'location_name': 'class 8',
                          'location_parents': [
                            'L0',
                          ],
                          'org_id': 'colorado',
                          'group_id': 'G1',
                        },
                        'sort': [
                          1612960200000,
                        ],
                      },
                    ],
                  },
                },
              },
            ],
          },
        },
      ],
    },
  },
};


test('should give correct formated records for all location analytics', (t) => {
  const res = convertLocationAnalyticsResponse(
      queryResponseAnalytics,
  );
  t.deepEqual(res, {
    columns: [
      'Location',
      'CO2',
      'Humidity',
      'Temperature',
      'PM1.0',
      'PM2.5',
      'PM10',
    ],
    data: [
      {
        'CO2': {
          unit: 'ppm',
          value: 250,
          level: 'GOOD',
        },
        'Humidity': {
          unit: '%',
          value: 50,
          level: 'SATISFACTORY',
        },
        'Temperature': {
          unit: '°C',
          value: 30,
          level: 'SATISFACTORY',
        },
        'Location': 'class 7',
        'PM1.0': {
          unit: 'μg/m³',
          value: 30,
          level: 'GOOD',
        },
        'PM2.5': {
          unit: 'μg/m³',
          value: 50,
          level: 'GOOD',
        },
        'PM10': {
          unit: 'μg/m³',
          value: 30,
          level: 'GOOD',
        },
      },
      {
        'PM1.0': {
          unit: 'μg/m³',
          value: 25,
          level: 'GOOD',
        },
        'Humidity': {
          unit: '%',
          value: 43,
          level: 'SATISFACTORY',
        },
        'Temperature': {
          unit: '°C',
          value: 30,
          level: 'SATISFACTORY',
        },
        'PM2.5': {
          unit: 'μg/m³',
          value: 50,
          level: 'GOOD',
        },
        'PM10': {
          unit: 'μg/m³',
          value: 45,
          level: 'GOOD',
        },
        'Location': 'class 8',
        'CO2': {
          unit: 'ppm',
          value: 600,
          level: 'SATISFACTORY',
        },
      },
    ],
  });
});

