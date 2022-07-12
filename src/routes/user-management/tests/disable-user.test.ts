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


const id = '52e9f3f2-1027-4c7f-b40b-6511eec99f89';

test('Should throw error on Invalid parameter', async (t) => {
  const disabled = 'invalid';
  const response = await request(app)
      .patch('/api/v1/users/'+id+'/disable')
      .send({disabled})
      .set('X-Auth-Key', tokenData.token);
  t.is(response.status, 400);
  t.is(response.body.error.message, 'INVALID VALUE');
});


test('Should throw error on missing parameter', async (t) => {
  const response = await request(app)
      .patch('/api/v1//users/'+id+'/disable')
      .send({})
      .set('X-Auth-Key', tokenData.token);
  t.is(response.status, 400);
  t.is(response.body.error.message, 'DISABLED IS REQUIRED');
});

test('Should disable user with giver id', async (t) => {
  const disabled = false;
  nock(BASE_URL)
      .patch('/api/users/52e9f3f2-1027-4c7f-b40b-6511eec99f89')
      .reply(200, {
        disabled: false,
      });

  const response = await request(app)
      .patch('/api/v1/users/'+id+'/disable')
      .send({disabled})
      .set('X-Auth-Key', tokenData.token);
  t.is(response.status, 200);
  t.is(response.body.disabled, false);
});

