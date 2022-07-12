import fetch from 'node-fetch';
import {formatErr} from '../errors';
import {API_AUTH_KEY, APP_BUNDLE_ID} from '../constants';
// eslint-disable-next-line new-cap

/**
 * Function to perform platform api calls
 * @param url
 * @param method
 * @param header
 * @param body
 */
// eslint-disable-next-line
export async function fetchApi(url:string, method:string, header:{[key:string]:string}, body:any) {
  try {
    if (method==='GET' || method==='DELETE') {
      const response = await fetch( url, {
        method: method,
        headers: header,
      });
      // Resolve the promise
      const data = await response.json();
      return {
        status: response.status,
        data: data,
      };
    } else {
      const response = await fetch( url, {
        method: method,
        headers: header,
        body: body,
      });
      // Resolve the promise
      const data = await response.json();
      return {
        status: response.status,
        data: data,
      };
    }
  } catch (err) {
    const customErr = {
      error: formatErr(500, 'Server Error', 'Server Response'),
    };
    return {
      status: '500',
      data: customErr,
    };
  }
};

/**
 * Function to filter empty values from an json object
 * @param {object} obj
 * @return {object}
 */
export function cleanObj(obj:any) {
  Object.keys(obj).forEach((k) =>
    (obj[k] && typeof obj[k] === 'object') && cleanObj(obj[k]) ||
    (!obj[k] && obj[k] !== undefined) && delete obj[k],
  );
  return obj;
};

/**
 * Create header with the auth key
 * auth, auth-api, auth-bundle, file, auth-api-bundle
 * @param {string} type
 * @param {string} authKey
 * @return {object} header
 */
export function createHeader(type:string, authKey:string) {
  switch (type) {
    case 'auth':
      const authHeader = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-AUTH-KEY': authKey,
      };
      return authHeader;
    case 'auth-bundle':
      const bundleHeader = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-AUTH-KEY': authKey,
        'X-APP-BUNDLE-ID': APP_BUNDLE_ID,
      };
      return bundleHeader;
    case 'auth-api':
      const apiHeader = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-AUTH-KEY': authKey,
        'X-API-AUTH-KEY': API_AUTH_KEY,
      };
      return apiHeader;
    case 'auth-api-bundle':
      const apiBundleHeader = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-AUTH-KEY': authKey,
        'X-API-AUTH-KEY': API_AUTH_KEY,
        'X-APP-BUNDLE-ID': APP_BUNDLE_ID,
      };
      return apiBundleHeader;
    case 'file':
      const fileHeader = {
        'X-AUTH-KEY': authKey,
      };
      return fileHeader;
    case 'auth-reset':
      const resetHeader = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-AUTH-KEY': authKey,
        'X-RESET-PASSWORD': '1',
        'X-APP-BUNDLE-ID': APP_BUNDLE_ID,
      };
      return resetHeader;
    default:
      const Header= {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      };
      return Header;
  }
}
