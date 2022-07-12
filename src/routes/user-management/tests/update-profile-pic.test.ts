/* eslint-disable no-unused-vars */
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

const file = 'Test.jpg';
const id = '75be158b-523f-4486-80a2-fe8c70f2d3eb';
const errMsg = 'invalid input syntax for type uuid: "75be158b-523f-4486"';
const data = {
  id: '75be158b-523f-4486-80a2-fe8c70f2d3eb',
  verstamp: 11,
  created: '2020-12-27T10:19:11.717Z',
  updated: '2021-01-05T14:19:37.424Z',
  email: 'atul.sathyan@netobjex.com',
  avatar: 'afd4468f-f41d-429e-8c7d-8fd2e4e3c1a1',
  username: 'AtulS',
  role: 5,
  verificationcode: 0,
  customerid: '23972ac5-a093-4d5c-ac63-093799d8c17f',
  verified: true,
  otpauth: 0,
  approved: true,
  bio: null,
  deviceid: null,
  temperatureunit: 'F',
  waterunit: 'L',
  waterprice: '0',
  referral_code: null,
  referral_by: null,
  additional: '{"employeeid":"COX-RX248"}',
  created_at: '0',
  updated_at: 1609856377423,
};

test('Should throw error for missing file', async (t) => {
  const response = await request(app)
      .patch('/api/v1/users/'+id+'/upload')
      .send()
      .set('X-AUTH-Key', tokenData.token);
  t.is(response.status, 400);
  t.is(response.body.error.message, 'IMAGE IS REQUIRED');
});

test.skip('Should Successfully update user profile pic', async (t) => {
  nock(BASE_URL)
      .post('/api/files/upload?type=COUPON_IMAGE')
      .reply(200, {
        data: {
          id: data.avatar,
        },
      });
  nock(BASE_URL)
      .patch('/api/users/'+id)
      .reply(200, {
        data: {
          avatar: data.avatar,
        },
      });

  const response = await request(app)
      .patch('/api/v1/users/'+id+'/upload')
      // .send(fs.readFileSync('/home/atul/Downloads/Zoom.jpg'));
      .attach('image', '/home/atul/Downloads/Zoom.jpg')
      .set('X-AUTH-Key', tokenData.token);
  t.is(response.status, 200);
  t.is(response.body.data.avatar, data.avatar);
});

test.skip('Should throw error for invalid id', async (t) => {
  const id = '75be158b-523f-4486';
  nock(BASE_URL)
      .patch('/api/users/'+id)
      .reply(500, {
        error: {
          message: errMsg,
        },
      });
  nock(BASE_URL)
      .post('/api/files/upload?type=COUPON_IMAGE')
      .reply(200, {
        data: {
          id: data.avatar,
        },
      });
  const buffer = Buffer.from('some data');

  const response = await request(app)
      .patch('/api/v1/users/'+id+'/upload')
      .attach('image', buffer, file)
      .set('X-AUTH-Key', tokenData.token);
  t.is(response.status, 500);
  t.is(response.body.error.message, errMsg);
});
