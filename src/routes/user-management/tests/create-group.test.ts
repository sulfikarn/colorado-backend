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

const name = 'test';
const firstName = 'group1';
const parentId= 'org1';

// Create Group Unit Test
test('Should successfully create a group with data', async (t) => {
  nock(BASE_URL)
      .post('/api/customers')
      .reply(200, {
        parentid: parentId,
      });

  await request(app)
      .post('/api/v1/groups')
      .set('Accept', 'application/json')
      .send({name, firstName, parentId})
      .set('X-Auth-Key', tokenData.token)
      .expect('Content-Type', /json/)
      .expect(200)
      .then((res) => {
        t.is(res.body.parentId, parentId);
      });
});

test('Should throw error on invalid parent id', async (t) => {
  nock(BASE_URL)
      .post('/api/customers')
      .reply(500, {
        name: 'error',
      });

  await request(app)
      .post('/api/v1/groups')
      .set('Accept', 'application/json')
      .send({name, firstName, parentId})
      .set('X-Auth-Key', tokenData.token)
      .expect('Content-Type', /json/)
      .expect(500)
      .then((res) => {
        t.is(res.body.name, 'error');
      });
});

test('Should throw error on missing name', async (t) => {
  const response = await request(app)
      .post('/api/v1/groups')
      .send({parentId})
      .set('X-Auth-Key', tokenData.token);
  t.is(response.status, 400);
  t.is(response.body.error.message, 'NAME IS REQUIRED');
});
