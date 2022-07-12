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

const name = 'Test';
const id= '392be495-c610-4577-9c68-8876e3eedde2';

test('Should throw error on empty name', async (t) => {
  const response = await request(app)
      .patch('/api/v1/locations/'+id)
      .send()
      .set('X-Auth-Key', tokenData.token);
  t.is(response.status, 400);
  t.is(response.body.error.message, 'NAME IS REQUIRED');
});

test('Successfully update location with valid name', async (t) => {
  nock(BASE_URL)
      .patch('/api/locations/'+id)
      .reply(200, {
        name: name,
      });
  const response = await request(app)
      .patch('/api/v1/locations/'+id)
      .send({name})
      .set('X-Auth-Key', tokenData.token);
  t.is(response.status, 200);
  t.is(response.body.name, name);
});
