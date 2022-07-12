import {serial as test} from 'ava';
import request from 'supertest';
import app from '../../../../index';
import nock from 'nock';
import {BASE_URL, AUTH_KEY} from '../../../constants';
import {signJwt} from '../../../middleware/jwt';

const tokenData = {
  userId: '75be158b-523f-4486-80a2-fe8c70f2d3eb',
  role: 'CustomerAdmin',
  token: '',
};

test.before(async ()=>{
  tokenData.token = signJwt(tokenData.userId, tokenData.role, AUTH_KEY);
});

test.beforeEach(async ()=>{
  await nock.cleanAll();
});

const deviceType = 'b20d9f61-7324-4787-b8f0-181469f7b23c';
const deviceId = 'WT001';
const name = 'WR-COL-01';
const departmentId = '23972ac5-a093-4d5c-ac63-093799d8c17f';
const id = 'd4f2ea31-27cd-4cfd-88d6-698756eac08e';

test('Should successfully update a device', async (t) => {
  nock(BASE_URL)
      .patch('/api/devices/'+id)
      .reply(200, {
        deviceId: deviceId,
      });
  const response = await request(app)
      .patch('/api/v1/devices/'+id)
      .send({deviceType, deviceId, name, departmentId})
      .set('X-Auth-Key', tokenData.token);
  t.is(response.status, 200);
  t.is(response.body.deviceId, deviceId);
});
