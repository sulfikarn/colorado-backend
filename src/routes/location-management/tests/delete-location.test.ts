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

const id= '392be495-c610-4577-9c68-8876e3eedde2';


test.beforeEach(async ()=>{
  await nock.cleanAll();
});

test('Successfully delete a location', async (t) => {
  nock(BASE_URL)
      .delete('/api/locations/'+id)
      .reply(200, {
        count: 1,
      });
  const response = await request(app)
      .delete('/api/v1/locations/'+id)
      .set('X-Auth-Key', tokenData.token);
  t.is(response.status, 200);
  t.is(response.body.count, 1);
});

test('Return count 0 for non existing device', async (t) => {
  nock(BASE_URL)
      .delete('/api/locations/'+id)
      .reply(200, {
        count: 0,
      });
  const response = await request(app)
      .delete('/api/v1/locations/'+id)
      .set('X-Auth-Key', tokenData.token);
  t.is(response.status, 200);
  t.is(response.body.count, 0);
});

