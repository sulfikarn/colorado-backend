import {Document, Model} from 'mongoose';
/* eslint camelcase: 0 */
export interface IDevice {
    device_id: string,
    device_type: string,
    uuid: string,
    device_name: string,
    location_id: string,
    location_name: string,
    location_parents: [string],
    org_id: string,
    group_id: string
}

export interface IDeviceDocument extends IDevice, Document {}
export interface IDeviceModel extends Model<IDeviceDocument> {}
