import test from 'ava';
import {levelDetector} from '../helpers';

export const QUERY_PARAMETERS:any = {
  'CO2': {unit: 'ppm', levels: {
    'DANGER': 2000,
    'SATISFACTORY': 1000,
    'GOOD': 250,
  }},
  'PM10': {unit: 'ug/m3', levels: {
    'DANGER': 100,
    'SATISFACTORY': 75,
    'GOOD': 50,
  }},
  'PM1.0': {unit: 'ug/m3', levels: {
    'DANGER': 70,
    'SATISFACTORY': 60,
    'GOOD': 50,
  }},
  'PM2.5': {unit: 'ug/m3', levels: {
    'DANGER': 75,
    'SATISFACTORY': 70,
    'GOOD': 60,
  }},
  'Humidity': {unit: '%', levels: {
    'DANGER': 60,
    'SATISFACTORY': 50,
    'GOOD': 30,
  }},
  'Temperature': {unit: '°C',
    levels: {
      'DANGER': 35,
      'SATISFACTORY': 30,
      'GOOD': 25,
    }},
};

test('levelDetector: Should successfully throw N/A for a not available metric',
    (t)=>{
      const res = levelDetector('test', 0, QUERY_PARAMETERS);
      t.is(res, 'N/A');
    });

test('levelDetector: Should successfully give the correct levels', (t)=>{
  const res1 = levelDetector('CO2', 100, QUERY_PARAMETERS);
  t.is(res1, 'GOOD');
  const res2 = levelDetector('PM1.0', 120, QUERY_PARAMETERS);
  t.is(res2, 'DANGER');
  const res3 = levelDetector('PM1.0', 60, QUERY_PARAMETERS);
  t.is(res3, 'SATISFACTORY');
});
