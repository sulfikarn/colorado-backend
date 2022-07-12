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
  tokenData.token = await signJwt(tokenData.userId, tokenData.role, AUTH_KEY);
});

test.afterEach(async ()=>{
  await nock.cleanAll();
});

const password = 'qwerty123';
const id = '75be158b-523f-4486-80a2-fe8c70f2d3eb';
const errMsg = 'invalid input syntax for type uuid: "75be158b-523f-4486"';

test('Should throw error for invalid id', async (t) => {
  const id = '75be158b-523f-4486';
  nock(BASE_URL)
      .patch('/api/users/'+id)
      .reply(500, {
        error: {
          message: errMsg,
        },
      });
  const response = await request(app)
      .patch('/api/v1/change-password/'+id)
      .set('Accept', 'application/json')
      .send({password})
      .set('X-Auth-Key', tokenData.token);
  t.is(response.status, 500);
  t.is(response.body.error.message, errMsg);
});

test('Should successfully update user password', async (t) => {
  nock(BASE_URL)
      .patch('/api/users/'+id)
      .reply(200, {updated: true});
  const response = await request(app)
      .patch('/api/v1/change-password/'+id)
      .set('Accept', 'application/json')
      .send({password})
      .set('X-Auth-Key', tokenData.token);
  t.is(response.status, 200);
  t.is(response.body.updated, true);
});

test('Should throw error for inavlid password', async (t) => {
  const password = 'pass';
  const response = await request(app)
      .patch('/api/v1/change-password/'+id)
      .set('Accept', 'application/json')
      .set('X-Auth-Key', tokenData.token)
      .send({password});
  t.is(response.status, 400);
  t.is(response.body.error.message, 'INVALID PASSWORD LENGTH');
});

test('Should throw error for missing password', async (t) => {
  const response = await request(app)
      .patch('/api/v1/change-password/'+id)
      .send()
      .set('X-Auth-Key', tokenData.token);
  t.is(response.status, 400);
  t.is(response.body.error.message, 'PASSWORD IS REQUIRED');
});
