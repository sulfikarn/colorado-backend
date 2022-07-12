/**
 *  Build elastic query ofor location Analytics
 * @param {any} locationId
 * @param {any} locationParents
 * @param {any} timeInterval
 * @param {any} timestampStart
 * @param {any} timestampEnd
 * @return {any}
 */
export function buildLocationSummaryQuery(
    locationId:any,
    locationParents: any,
    timeInterval: any,
    timestampStart: any,
    timestampEnd = Date.now(),
) {
  if (locationId.length) {
    return {
      'size': 0,
      'query': {
        'bool': {
          'must': [
            {
              'term': {
                'location_id': {
                  'value': locationId,
                },
              },
            },
            {
              'terms': {
                'location_parents': JSON.parse(locationParents),
              },
            },
          ],
          'filter': [
            {
              'range': {
                '@timestamp': {
                  'gte': timestampStart,
                  'lte': timestampEnd,
                },
              },
            },
          ],
        },
      },
      'aggs': {
        'metrics': {
          'date_histogram': {
            'field': '@timestamp',
            'fixed_interval': timeInterval,
            'min_doc_count': 1,
          },
          'aggs': {
            'nested_doc': {
              'nested': {
                'path': 'metrics',
              },
              'aggs': {
                'average': {
                  'terms': {
                    'field': 'metrics.metric_name',
                  },
                  'aggs': {
                    'metric_average': {
                      'avg': {
                        'field': 'metrics.value',
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    };
  } else {
    return {
      'size': 0,
      'query': {
        'bool': {
          'must': [
            {
              'terms': {
                'location_parents': JSON.parse(locationParents),
              },
            },
          ],
          'filter': [
            {
              'range': {
                '@timestamp': {
                  'gte': timestampStart,
                  'lte': timestampEnd,
                },
              },
            },
          ],
        },
      },
      'aggs': {
        'metrics': {
          'date_histogram': {
            'field': '@timestamp',
            'fixed_interval': timeInterval,
            'min_doc_count': 1,
          },
          'aggs': {
            'nested_doc': {
              'nested': {
                'path': 'metrics',
              },
              'aggs': {
                'average': {
                  'terms': {
                    'field': 'metrics.metric_name',
                  },
                  'aggs': {
                    'metric_average': {
                      'avg': {
                        'field': 'metrics.value',
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    };
  }
}


/**
 *  Build elastic query for all location Analytics
 * @param {any} locationParents
 * @param {any} from
 * @param {string} locationId
 * @return {any}
 */
export function buildLocationAnalyticsQuery(
    locationParents: any,
    from:any = '60d',
    locationId: string = '',
) {
  const locationParentsArray = JSON.parse(locationParents) || [];
  // locationParentsArray.push(locationId);
  if (locationId.length) {
    return {
      'size': 0,
      'query': {
        'bool': {
          'must': [
            {
              'term': {
                'location_id': {
                  'value': locationId,
                },
              },
            },
            {
              'terms': {
                'location_parents': locationParentsArray,
              },
            },
          ],
          'filter': [
            {
              'range': {
                '@timestamp': {
                  'gte': `now-${from}`,
                },
              },
            },
          ],
        },
      },
      'aggs': {
        'group': {
          'terms': {
            'field': 'location_id',
          },
          'aggs': {
            'group_2': {
              'terms': {
                'field': 'device_type',
              },
              'aggs': {
                'location': {
                  'top_hits': {
                    'size': 1,
                    'sort': [
                      {
                        '@timestamp': {
                          'order': 'desc',
                        }},
                    ],
                  },
                },
              },
            },
          },
        },
      },
    };
  } else {
    return {
      'size': 0,
      'query': {
        'bool': {
          'must': [
            {
              'terms': {
                'location_parents': locationParentsArray,
              },
            },
          ],
          'filter': [
            {
              'range': {
                '@timestamp': {
                  'gte': `now-${from}`,
                },
              },
            },
          ],
        },
      },
      'aggs': {
        'group': {
          'terms': {
            'field': 'location_id',
          },
          'aggs': {
            'group_2': {
              'terms': {
                'field': 'device_type',
              },
              'aggs': {
                'location': {
                  'top_hits': {
                    'size': 1,
                    'sort': [
                      {
                        '@timestamp': {
                          'order': 'desc',
                        }},
                    ],
                  },
                },
              },
            },
          },
        },
      },
    };
  }
}
