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

const id = '215ffc07-7ef8-430c-83de-83490a8d0d30';

test.before(async ()=>{
  tokenData.token = signJwt(tokenData.userId, tokenData.role, AUTH_KEY);
});

test.beforeEach(async ()=>{
  await nock.cleanAll();
});

test('Successfully delete a device', async (t) => {
  nock(BASE_URL)
      .delete('/api/devices/'+id)
      .reply(200, {
        count: 1,
      });
  const response = await request(app)
      .delete('/api/v1/devices/'+id)
      .set('X-Auth-Key', tokenData.token);
  t.is(response.status, 200);
  t.is(response.body.count, 1);
});

test('Return count 0 for non existing device', async (t) => {
  nock(BASE_URL)
      .delete('/api/devices/'+id)
      .reply(200, {
        count: 0,
      });
  const response = await request(app)
      .delete('/api/v1/devices/'+id)
      .set('X-Auth-Key', tokenData.token);
  t.is(response.status, 200);
  t.is(response.body.count, 0);
});
