import {Schema} from 'mongoose';

const DeviceSchema = new Schema({
  device_id: {
    type: String,
    required: true,
    index: true, // ---Index----
  },
  uuid: String,
  device_type: String,
  device_name: String,
  location_id: String,
  location_name: String,
  location_parents: [String],
  org_id: String,
  group_id: String,
});

export default DeviceSchema;
