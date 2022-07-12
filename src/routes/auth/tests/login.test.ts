import {serial as test} from 'ava';
import request from 'supertest';
import app from '../../../../index';
import nock from 'nock';
import {BASE_URL} from '../../../constants';

test.beforeEach(async ()=>{
  await nock.cleanAll();
});
const username = 'johndoe';
const password = 'password';

// Login unit tests
test('Should throw error on Invalid Username', async (t) => {
  nock(BASE_URL)
      .post('/api/users/authenticate')
      .reply(400, {
        message: 'Username or Password is invalid',
      });

  const response = await request(app)
      .post('/api/v1/login')
      .send({username, password});
  t.is(response.status, 400);
  t.is(response.body.message, 'Username or Password is invalid');
});

test('Should throw error on Invalid Password', async (t) => {
  nock(BASE_URL)
      .post('/api/users/authenticate')
      .reply(400, {
        message: 'Username or Password is invalid',
      });

  const response = await request(app)
      .post('/api/v1/login')
      .send({username, password});
  t.is(response.status, 400);
  t.is(response.body.message, 'Username or Password is invalid');
});

test('Should throw error on Empty Username', async (t) => {
  const password = 'test';
  const response = await request(app)
      .post('/api/v1/login')
      .send({password});
  t.is(response.status, 400);
  t.is(response.body.error.message, 'USERNAME IS REQUIRED');
});

test('Should throw error on Empty Password', async (t) => {
  const response = await request(app)
      .post('/api/v1/login')
      .send({username});
  t.is(response.status, 400);
  t.is(response.body.error.message, 'PASSWORD IS REQUIRED');
});

test('Should pass on valid User Login', async (t) => {
  nock(BASE_URL)
      .post('/api/users/authenticate')
      .reply(200, {

        uid: '123456',
        roles: ['test'],
        token: 'qwertyasdf123',
        username: username,

      });

  await request(app)
      .post('/api/v1/login')
      .set('Accept', 'application/json')
      .send({username, password})
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .then((res) => {
        t.is(res.body.username, username);
      });
});
