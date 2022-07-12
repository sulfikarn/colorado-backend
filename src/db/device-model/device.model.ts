import {model} from 'mongoose';
import {IDeviceDocument} from './device.types';
import DeviceSchema from './device.schema';
import {DEVICE_DB} from '../../constants';

export const DeviceModel = model<IDeviceDocument>(DEVICE_DB, DeviceSchema);
