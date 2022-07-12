import {QUERY_PARAMETERS} from '../../constants';
import {isEmpty, floor, forEach} from 'lodash';
import {levelDetector} from '../../utils/helpers';
/**
 * Function to convert location analytics query response
 * @todo Improve Logic and reduce timecomplexity
 * @param {any} elasticResult
 * @param {any} queryParameters
 * @return {any}
 */
export function convertLocationSummaryResponse(
    elasticResult: any,
    queryParameters = QUERY_PARAMETERS,
) {
  const documents = elasticResult.aggregations.metrics.buckets;
  if (isEmpty(documents)) {
    return {
      status: false,
      message: 'No records found',
    };
  }
  const metrics: any = {};
  const finalResponse: any = [];

  for (let index = 0; index < documents.length; index++) {
    const buckets = documents[index].nested_doc.average.buckets;
    for (let j = 0; j < buckets.length; j++) {
      if (isEmpty(metrics[buckets[j].key])) {
        metrics[buckets[j].key] = [];
      }
      metrics[buckets[j].key].push({
        X: documents[index].key,
        Y: floor(buckets[j].metric_average.value || 0, 2),
      });
    }
  }
  let id = 0;
  forEach(metrics, (value, key) => {
    finalResponse[id] = {};
    finalResponse[id].id = id;
    finalResponse[id].label = key;
    const temp = value[value.length - 1].Y;
    finalResponse[id].value = floor(temp || 0, 2);
    finalResponse[id].unit = queryParameters[key].unit;
    finalResponse[id].chartData = value;
    finalResponse[id].level = levelDetector(key, temp, QUERY_PARAMETERS);
    id++;
  });
  return finalResponse;
}

/**
 * Convert location analytics response
 * @param {any} elasticResult
 * @return {any}
 */
export function convertLocationAnalyticsResponse(elasticResult: any) {
  const documents = elasticResult.aggregations.group.buckets;
  const columns = ['Location'];
  const isColumn: any = {};
  if (isEmpty(documents)) {
    return {
      status: false,
      message: 'No records found',
    };
  }
  const result = [];
  for (let index = 0; index < documents.length; index++) {
    const devices = documents[index].group_2.buckets;

    for (let j = 0; j < devices.length; j++) {
      if (isEmpty(result[index])) {
        result[index] = {};
      }
      const temp: any = {};
      forEach(devices[j].location.hits.hits[0]._source.metrics, (value) => {
        const finalValue = floor(value.value || 0, 2);
        const metricName = value.metric_name;
        temp[metricName] = {
          value: finalValue,
          level: levelDetector(metricName, finalValue, QUERY_PARAMETERS),
          unit: QUERY_PARAMETERS[metricName].unit,
        };
        if (isColumn[metricName] != true) {
          isColumn[metricName] = true;
          columns.push(metricName);
        }
      });
      result[index] = {
        ...result[index],
        ...temp,
        'Location': devices[j].location.hits.hits[0]._source.location_name,
      };
    }
  }
  return {
    columns,
    data: result,
  };
}
