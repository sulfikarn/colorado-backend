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
const id= '23972ac5-a093-4d5c-ac63-093799d8c17f';

// Create Group Unit Test
test('Should successfully update a group with name', async (t) => {
  nock(BASE_URL)
      .patch('/api/customers/'+id)
      .reply(200, {
        id: id,
      });

  await request(app)
      .patch('/api/v1/groups/'+id)
      .set('Accept', 'application/json')
      .send({name})
      .set('X-Auth-Key', tokenData.token)
      .expect('Content-Type', /json/)
      .expect(200)
      .then((res) => {
        t.is(res.body.id, id);
      });
});

test('Should throw error on missing name', async (t) => {
  const response = await request(app)
      .patch('/api/v1/groups/'+id)
      .send()
      .set('X-Auth-Key', tokenData.token);
  t.is(response.status, 400);
  t.is(response.body.error.message, 'NAME IS REQUIRED');
});
