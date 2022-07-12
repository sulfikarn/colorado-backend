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

const username = 'Test';
const email = 'test@example.com';
const groupId = '1234567789';
const employeeId = '123456677';
const id = '75be158b-523f-4486-80a2-fe8c70f2d3eb';
const errMsg = 'invalid input syntax for type uuid: "75be158b-523f-4486"';
const data = {
  id: '75be158b-523f-4486-80a2-fe8c70f2d3eb',
  updated: '2021-01-15T14:31:39.922Z',
  firstName: 'Atul S',
  email: 'atul.sathyan@netobjex.com',
  avatar: '0de91186-c151-469b-8824-afc7a80d2e83',
  username: 'AtulS',
  disabled: false,
  deleted: false,
  role: 5,
  customerId: '23972ac5-a093-4d5c-ac63-093799d8c17f',
  verified: true,
  employeeId: 'COX-RX244',
};

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
      .patch('/api/v1/users/'+id)
      .send({email, username, groupId, employeeId})
      .set('X-Auth-Key', tokenData.token);
  t.is(response.status, 500);
  t.is(response.body.error.message, errMsg);
});

test('Should successfully update user data', async (t) => {
  nock(BASE_URL)
      .patch('/api/users/'+id)
      .reply(200, {
        id: data.id,
      });
  const response = await request(app)
      .patch('/api/v1/users/'+id)
      .send({email, username, groupId, employeeId})
      .set('X-Auth-Key', tokenData.token);
  t.is(response.status, 200);
  t.is(response.body.id, id);
});

test('Should throw error for invalid email', async (t) => {
  const email= 'test@examplecom';
  const response = await request(app)
      .patch('/api/v1/users/'+id)
      .send({email})
      .set('X-Auth-Key', tokenData.token);
  t.is(response.status, 400);
  t.is(response.body.error.message, 'INVALID VALUE');
});
