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

const data = JSON.stringify([
  {
    id: '392be495-c610-4577-9c68-8876e3eedde2',
    name: 'TVM',
    customerid: '23972ac5-a093-4d5c-ac63-093799d8c17f',

  },
]);

test.beforeEach(async ()=>{
  await nock.cleanAll();
});

test('Successfully get list of locations', async (t) => {
  nock(BASE_URL)
      .get('/api/locations?filter={"fields":["name", "customerid","id"]}')
      .reply(200, {
        data,
      });
  const response = await request(app)
      .get('/api/v1/locations/list')
      .set('X-Auth-Key', tokenData.token);
  t.is(response.status, 200);
  t.is(response.body.data, data);
});
