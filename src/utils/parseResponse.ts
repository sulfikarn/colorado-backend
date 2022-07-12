import {formatErr} from '../errors';

/**
 * Create the respone data for user
 * @param {json} user
 * @return {json}
 */
export const user = (user:any) => {
  try {
    return {
      id: user.id,
      updated: user.updated,
      firstName: user.firstname,
      email: user.email,
      avatar: user.avatar,
      username: user.username,
      disabled: user.disabled,
      deleted: user.deleted,
      // eslint-disable-next-line max-len
      role: user.rolesInfo?((user.rolesInfo[0])?getRoleName(user.rolesInfo[0]):null):null,
      // eslint-disable-next-line max-len
      roleId: user.rolesInfo?((user.rolesInfo[0])?getRoleId(user.rolesInfo[0]):null):null,
      customerId: user.customerid,
      verified: user.verified,
      status: (user.verified)?
                    ((user.disabled)?'Disabled':'Active'):'Invited',
      employeeId: (user.additional)?
                     JSON.parse(user.additional)['employeeid']:'',
    };
  } catch (err) {
    const customErr = {
      error: formatErr(500, 'Server Error', 'parsing data'),
    };
    return {
      status: '500',
      data: customErr,
    };
  }
};

// Given a simple json object returns the value of key:id if present
// If key:id not present, returns null
const getRoleId = function(data:any): string {
  return data.hasOwnProperty('id')?data.id:null;
};

// Given a simple json object returns the value of key:name if present
// If key:name not present, returns null
const getRoleName = function(data:any): string {
  return data.hasOwnProperty('name')?data.name:null;
};

/**
 * Create the respone data for devices
 * @param {json} data
 * @return {json}
 */
export const device = (data:any) => {
  return {
    id: data.id,
    created: data.created,
    updated: data.updated,
    deviceId: data.deviceid,
    name: data.name,
    customerId: data.customerid,
    type: (data.deviceType)?getRoleName(data.deviceType):'',
    typeId: (data.deviceType)?getRoleId(data.deviceType):
            ((data.type)?data.type:''),
    parentId: data.parentid,
    locationId: data.locationid,
    locationList: (data.tags)?data.tags.split(','):[],
    location: data.description,
    status: (data.status)?'Active':'Inactive',
    orgId: (data.orgInfo)?getRoleId(data.orgInfo):'',
  };
};

/**
 * Create the respone data for group
 * @param {json} data
 * @return {json}
 */
export const group = (data:any) => {
  return {
    id: data.id,
    name: data.name,
    email: data.email,
    parentId: data.parentid,
    active: data.active,
  };
};

/**
 * Create the respone data for location
 * @param {json} data
 * @return {json}
 */
export const location = (data:any) => {
  return {
    id: data.id,
    created: data.created,
    updated: data.updated,
    name: data.name,
    customerId: data.customerid,
    parentId: data.parentid,
    parentList: (data.additional)?data.additional.split(','):[],
  };
};
