import express from 'express';
import {BASE_URL, SIMPLE_HEADER, RESET_PASS_HEADER} from '../../constants';
import {RESEND_PASS_HEADER, NO_MAIL_HEADER} from '../../constants';
import {body, validationResult} from 'express-validator';
import {formatErr} from '../../errors';
import {signJwt, checkJwt} from '../../middleware/jwt';
import {fetchApi} from '../../utils/index';
// eslint-disable-next-line new-cap
const router = express.Router();

/**
 * Login Wrapper API For NetObjex Platform
 * @param {string} username
 * @param {string} password
 */
router.post('/login', [
  // username must exists
  body('username').exists({
    checkFalsy: true,
    checkNull: true,
  })
      .withMessage('USERNAME IS REQUIRED')
      .escape(),
  // password must exists
  body('password').exists({
    checkFalsy: true,
    checkNull: true,
  })
      .withMessage('PASSWORD IS REQUIRED')
      .escape(),
], async function(req:any, res:any) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const customErr = {
      error: formatErr(400, errors.array()[0].msg, errors.array()[0].param),
    };
    return res.status(400).json(customErr);
  }
  // Call platform login api
  const response=await fetchApi(
      BASE_URL+'/api/users/authenticate',
      'POST',
      SIMPLE_HEADER,
      JSON.stringify({
        username: req.body.username,
        password: req.body.password,
      }));
  if (response.status === 200) {
    // Add jwt token to response
    response.data.jwtToken=signJwt(
        response.data.uid,
        response.data.roles[0] || '',
        response.data.token,
    );
    const data = {
      token: response.data.token,
      uId: response.data.uid,
      email: response.data.email,
      groupId: response.data.userUnder,
      created: response.data.created,
      ttl: response.data.ttl,
      roles: response.data.roles,
      org: response.data.orgInfo.id,
      avatar: response.data.avatar,
      baseAvatarUrl: response.data.base_avatar_url,
      username: response.data.username,
      firstName: response.data.firstname,
      orgInfo: response.data.orgInfo,
      groupInfo: response.data.groupInfo,
      jwtToken: response.data.jwtToken,
    };
    res.status(response.status).send(data);
  } else {
    res.status(response.status).send(response.data);
  }
});

/**
 * Reset Password Wrapper API For NetObjex Platform
 * @param {string} email
 */
router.post('/reset-password', [
  // email must exist.
  body('email').exists({
    checkFalsy: true,
    checkNull: true,
  })
      .withMessage('EMAIL IS REQUIRED')
      .bail()
      .isEmail(),
], async function(req:any, res:any) {
  // Set platform header based on req header
  // 'no-mail'=1 : sends token in response
  const header = (req.headers['no-mail']==1)?NO_MAIL_HEADER:RESET_PASS_HEADER;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const customErr = {
      error: formatErr(400, errors.array()[0].msg, errors.array()[0].param),
    };
    return res.status(400).json(customErr);
  }
  // Call platform reset password api
  const response=await fetchApi(
      BASE_URL+'/api/users/reset',
      'POST',
      header,
      JSON.stringify({
        email: req.body.email,
      }));
  res.status(response.status).send(response.data);
});

/**
 * Confirm Reset Password Wrapper API For NetObjex Platform
 * @param {string} email
 * @param {string} token
 * @param {string} password
 */
router.post('/confirm-password', [
  // email must exist.
  body('email').exists({
    checkFalsy: true,
    checkNull: true,
  })
      .withMessage('EMAIL IS REQUIRED')
      .bail()
      .isEmail(),
  // token must exist.
  body('token').exists({
    checkFalsy: true,
    checkNull: true,
  })
      .withMessage('TOKEN IS REQUIRED')
      .escape(),
  // email must exist.
  body('password').exists({
    checkFalsy: true,
    checkNull: true,
  })
      .withMessage('PASSWORD IS REQUIRED')
      .bail()
      .isLength({min: 6, max: 20})
      .withMessage('INVALID PASSWORD LENGTH'),
], async function(req:any, res:any) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const customErr = {
      error: formatErr(400, errors.array()[0].msg, errors.array()[0].param),
    };
    return res.status(400).json(customErr);
  }
  // Call platform confirm reset password api
  const response=await fetchApi(
      BASE_URL+'/api/users/confirm-reset',
      'POST',
      SIMPLE_HEADER,
      JSON.stringify({
        email: req.body.email,
        token: req.body.token,
        password: req.body.password,
      }));
  res.status(response.status).send(response.data);
});

/**
 * Resend invitation mail Wrapper API For Platform
 * @param {string} email
 */
router.post('/resend', [
  // email must exist.
  body('email').exists({
    checkFalsy: true,
    checkNull: true,
  })
      .withMessage('EMAIL IS REQUIRED')
      .bail()
      .isEmail(),
], async function(req:any, res:any) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const customErr = {
      error: formatErr(400, errors.array()[0].msg, errors.array()[0].param),
    };
    return res.status(400).json(customErr);
  }
  // Call platform api
  const response=await fetchApi(
      BASE_URL+'/api/users/resend',
      'POST',
      RESEND_PASS_HEADER,
      JSON.stringify({
        email: req.body.email,
      }));
  res.status(response.status).send(response.data);
});

/**
 * Verify if x-auth-key is valid
 * @param {string} token
 */
router.get('/verify', [checkJwt],
    async function(req:any, res:any) {
      // If token is invalid the middleware will send error else
      res.status(200).send();
    });

export default router;
