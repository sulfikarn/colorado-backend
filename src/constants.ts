/**
 * Constants used in this application
 */
require('dotenv').config();

export const PORT = process.env.PORT || 3000;
export const BASE_URL = process.env.BASE_URL as string;
export const AUTH_KEY = process.env.AUTH_KEY as string;
export const API_AUTH_KEY = process.env.API_AUTH_KEY as string;
export const APP_BUNDLE_ID = process.env.APP_BUNDLE_ID as string;

// Elastic search
export const ELASTIC_NODE = process.env.ELASTIC_NODE as string;
export const SIGFOX_METRICS_INDEX = process.env.METRICS_INDEX as string;
export const QUERY_PARAMETERS:any = {
  'CO2': {unit: 'ppm', levels: {
    'DANGER': 2000,
    'SATISFACTORY': 1000,
    'GOOD': 250,
  }},
  'PM10': {unit: 'μg/m³', levels: {
    'DANGER': 100,
    'SATISFACTORY': 75,
    'GOOD': 50,
  }},
  'PM1.0': {unit: 'μg/m³', levels: {
    'DANGER': 70,
    'SATISFACTORY': 60,
    'GOOD': 50,
  }},
  'PM2.5': {unit: 'μg/m³', levels: {
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

export const SIMPLE_HEADER = {
  'Accept': 'application/json',
  'Content-Type': 'application/json',
};

export const RESET_PASS_HEADER = {
  'Accept': 'application/json',
  'Content-Type': 'application/json',
  'X-APP-BUNDLE-ID': APP_BUNDLE_ID,
};

export const RESEND_PASS_HEADER = {
  'Accept': 'application/json',
  'Content-Type': 'application/json',
  'X-API-AUTH-KEY': API_AUTH_KEY,
  'X-APP-BUNDLE-ID': APP_BUNDLE_ID,
};

export const NO_MAIL_HEADER = {
  'Content-Type': 'application/json',
  'X-IGNORE-SEND-USER-EMAIL': '1',
};
export const JWT_SECRET_KEY = process.env.SECRET as string;
export const IMG_TYPE = ['image/png', 'image/jpeg'];
export const FILE_TYPE = [
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/csv',
];

export const DEFAULT_LIMIT = 0;
export const DEFAULT_SKIP = 0;
// eslint-disable-next-line max-len
export const ROLE_FILTER = '"include":{"relation":"rolesInfo","scope":{"fields":["name"]}}';
export const ROLE_LIST = ['CustomerAdmin', 'Customer'];
export const MONGO_DB = process.env.MONGO_DB_CONNECT as string;
export const DEVICE_DB = process.env.DEVICE_DB as string;
export const NOTIFICATION_DB = process.env.NOTIFICATION_DB as string;
export const TTL = '24h';
