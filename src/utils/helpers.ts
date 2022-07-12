import {isEmpty} from 'lodash';
import {QUERY_PARAMETERS} from '../constants';

/**
 * Metric danger level detector function
 * @param {string} metric
 * @param {number} value
 * @param {any }qureyParameter
 * @return {string}
 */
export function levelDetector(
    metric: string,
    value: number,
    qureyParameter = QUERY_PARAMETERS,
) {
  if (isEmpty(qureyParameter[metric])) {
    return 'N/A';
  } else if (qureyParameter[metric].levels.GOOD >= value) {
    return 'GOOD';
  } else if ( qureyParameter[metric].levels.SATISFACTORY >= value) {
    return 'SATISFACTORY';
  } else {
    return 'DANGER';
  }
}
