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
const departmentId = '123456677';

test('Should throw error on empty name', async (t) => {
  const response = await request(app)
      .post('/api/v1/locations')
      .send({departmentId})
      .set('X-Auth-Key', tokenData.token);
  t.is(response.status, 400);
  t.is(response.body.error.message, 'NAME IS REQUIRED');
});

test('Successfully add location with valid name and customer id', async (t) => {
  nock(BASE_URL)
      .post('/api/locations')
      .reply(200, {
        name: name,
      });
  const response = await request(app)
      .post('/api/v1/locations')
      .send({name, departmentId})
      .set('X-Auth-Key', tokenData.token);
  t.is(response.status, 200);
  t.is(response.body.name, name);
});

test('Should throw error on empty department id', async (t) => {
  const response = await request(app)
      .post('/api/v1/locations')
      .send({name})
      .set('X-Auth-Key', tokenData.token);
  t.is(response.status, 400);
  t.is(response.body.error.message, 'Department Id IS REQUIRED');
});

test('Should throw error on existing name', async (t) => {
  nock(BASE_URL)
      .post('/api/locations')
      .reply(500, {
        error: {
          message: 'This name already being used',
        },
      });
  const response = await request(app)
      .post('/api/v1/locations')
      .send({name, departmentId})
      .set('X-Auth-Key', tokenData.token);
  t.is(response.status, 500);
  t.is(response.body.error.message, 'This name already being used');
});
