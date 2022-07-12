import {serial as test} from 'ava';
import request from 'supertest';
import app from '../../../../index';
import nock from 'nock';
import {BASE_URL, AUTH_KEY} from '../../../constants';
import {signJwt} from '../../../middleware/jwt';

const data = JSON.stringify([
  {
    active: true,
    additional: '',
    childs: [],
    email: 'admin@university-colorado.edu',
    id: '23972ac5-a093-4d5c-ac63-093799d8c17f',
    logosmallfileid: null,
    name: 'University of Colorado',
    parentid: null,

  },
]);

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

test('Successfully get list of groups', async (t) => {
  nock(BASE_URL)
      .get('/api/customers/get-by-tree')
      .reply(200, {
        data,
      });
  const response = await request(app)
      .get('/api/v1/groups/list')
      .set('X-Auth-Key', tokenData.token);
  t.is(response.status, 200);
  t.is(response.body.data, data);
});
