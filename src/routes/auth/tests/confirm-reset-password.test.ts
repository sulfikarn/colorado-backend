import {serial as test} from 'ava';
import request from 'supertest';
import app from '../../../../index';
import nock from 'nock';
import {BASE_URL} from '../../../constants';

test.beforeEach(async ()=>{
  await nock.cleanAll();
});

const password = 'password';
const email = 'johndoe@test.com';
const token = 'testToken';

// Confirm Reset Password Unit Test
test('Should successfully update password with valid token', async (t) => {
  nock(BASE_URL)
      .post('/api/users/confirm-reset')
      .reply(200, {
        success: true,
      });

  await request(app)
      .post('/api/v1/confirm-password')
      .set('Accept', 'application/json')
      .send({email, token, password})
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .then((res) => {
        t.is(res.body.success, true);
      });
});

test('Should throw error on invalid token', async (t) => {
  nock(BASE_URL)
      .post('/api/users/confirm-reset')
      .reply(400, {
        message: 'TOKEN IS REQUIRED',
      });

  await request(app)
      .post('/api/v1/confirm-password')
      .set('Accept', 'application/json')
      .send({email, token, password})
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(400)
      .then((res) => {
        t.is(res.body.message, 'TOKEN IS REQUIRED');
      });
});

test('Should throw error on invalid password', async (t) => {
  const password = 'pass';
  const response = await request(app)
      .post('/api/v1/confirm-password')
      .set('Accept', 'application/json')
      .send({email, token, password});
  t.is(response.status, 400);
  t.is(response.body.error.message, 'INVALID PASSWORD LENGTH');
});
