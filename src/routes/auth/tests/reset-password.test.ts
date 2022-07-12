import {serial as test} from 'ava';
import request from 'supertest';
import app from '../../../../index';
import nock from 'nock';
import {BASE_URL} from '../../../constants';

test.beforeEach(async ()=>{
  await nock.cleanAll();
});

const email = 'johndoe@test.com';
const invalidEmail = 'johndoetest.com';

// Reset Password Unit Test
test('Should successfully send a mail on valid email', async (t) => {
  nock(BASE_URL)
      .post('/api/users/reset')
      .reply(200, {
        success: true,
      });

  await request(app)
      .post('/api/v1/reset-password')
      .set('Accept', 'application/json')
      .send({email})
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .then((res) => {
        t.is(res.body.success, true);
      });
});

test('Should send error on invalid email', async (t) => {
  const response = await request(app)
      .post('/api/v1/reset-password')
      .set('Accept', 'application/json')
      .send({invalidEmail});
  t.is(response.status, 400);
  t.is(response.body.error.message, 'EMAIL IS REQUIRED');
});

test('Should send a error on incorrect email', async (t) => {
  nock(BASE_URL)
      .post('/api/users/reset')
      .reply(400, {
        message: 'Email does not exist',
      });

  await request(app)
      .post('/api/v1/reset-password')
      .set('Accept', 'application/json')
      .send({email})
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(400)
      .then((res) => {
        t.is(res.body.message, 'Email does not exist');
      });
});
