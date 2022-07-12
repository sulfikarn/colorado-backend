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

const data = JSON.stringify([
  {
    'id': '7bc765fc-4956-41a8-9249-3b308b49fd6d',
    'name': '22 Colorado WrapperTest 1',
    'parentid': null,
    'childs': [],
  },
]);

test.beforeEach(async ()=>{
  await nock.cleanAll();
});

test('Successfully get list of locations in tree', async (t) => {
  nock(BASE_URL)
      .get('/api/locations/get-tree')
      .reply(200, {
        data,
      });
  const response = await request(app)
      .get('/api/v1/locations/tree')
      .set('X-Auth-Key', tokenData.token);
  t.is(response.status, 200);
  t.is(response.body.data, data);
});
