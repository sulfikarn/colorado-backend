import test from 'ava';
import request from 'supertest';
import app from '../index';

test('should give proper health check response', async (t) => {
  const response = await request(app)
      .get('/');
  t.is(response.status, 200);
  t.is(typeof response.body.message, 'string' );
});

test('should throw an error at unknown route', async (t) => {
  const response = await request(app)
      .get('/pinger');
  t.is(response.status, 404);
  t.is(response.body.message, 'This handle do not exist' );
});
