import {serial as test} from 'ava';
import request from 'supertest';
import app from '../../../../index';
import nock from 'nock';
import {BASE_URL, AUTH_KEY} from '../../../constants';
import {signJwt} from '../../../middleware/jwt';

const data = [{
  name: 'test',
  employeeId: 'COX-RX531',
  email: 'trungtrannam09013@gmail.com',
  role: 5,
  status: 'Active',
},
];

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
      .get('/api/users')
      .reply(200,
          [{
            firstname: 'test',
            email: 'trungtrannam09013@gmail.com',
            role: 5,
            verified: true,
            disabled: false,
          },
          ],
      );
  const response = await request(app)
      .get('/api/v1/users/list')
      .set('X-Auth-Key', tokenData.token);
  t.is(response.status, 200);
  t.is(response.body[0].email, data[0].email);
});
