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

const firstName = 'Test';
const email = 'test@example.com';
const groupId = '1234567789';
const employeeId = '123456677';
const role = 'c0f76abc-0ec7-4777-8512-2f35ca425e92';

test('Should throw error on Invalid firstName', async (t) => {
  const response = await request(app)
      .post('/api/v1/users')
      .send({email, groupId, employeeId, role})
      .set('X-Auth-Key', tokenData.token);
  t.is(response.status, 400);
  t.is(response.body.error.message, 'FIRSTNAME IS REQUIRED');
});

test('Should throw error on Invalid email', async (t) => {
  const response = await request(app)
      .post('/api/v1/users')
      .send({firstName, groupId, employeeId})
      .set('X-Auth-Key', tokenData.token);
  t.is(response.status, 400);
  t.is(response.body.error.message, 'EMAIL IS REQUIRED');
});

test('Should throw error on Invalid employee id', async (t) => {
  const response = await request(app)
      .post('/api/v1/users')
      .send({email, firstName, groupId, role})
      .set('X-Auth-Key', tokenData.token);
  t.is(response.status, 400);
  t.is(response.body.error.message, 'Employee ID IS REQUIRED');
});

test('Should successfully create an user', async (t) => {
  nock(BASE_URL)
      .post('/api/users')
      .reply(200, {
        email: email,
      });
  const response = await request(app)
      .post('/api/v1/users')
      .send({email, firstName, groupId, employeeId, role})
      .set('X-Auth-Key', tokenData.token);
  t.is(response.status, 200);
  t.is(response.body.email, email);
});
