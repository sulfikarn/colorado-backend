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

test('Successfully get list of devices', async (t) => {
  nock(BASE_URL)
      .get('/api/device-types')
      .reply(200, {
        id: id,
      });
  const response = await request(app)
      .get('/api/v1/devices/types/list')
      .set('X-Auth-Key', tokenData.token);
  t.is(response.status, 200);
  t.is(response.body.id, id);
});
