import express from 'express';
import {BASE_URL, ROLE_FILTER} from '../../constants';
import {IMG_TYPE} from '../../constants';
import {body, validationResult} from 'express-validator';
import {formatErr} from '../../errors';
import {fetchApi, createHeader} from '../../utils/index';
import * as parseData from '../../utils/parseResponse';
import FormData from 'form-data';
import fileUpload from 'express-fileupload';
import {checkJwt} from '../../middleware/jwt';
// eslint-disable-next-line new-cap
const router = express.Router();

/**
   * Update User data Wrapper API For NetObjex Platform
   * @param {string} firstName
   */
router.patch('/update-profile/:id', checkJwt, [
  body('firstName').exists({
    checkFalsy: true,
    checkNull: true,
  })
      .withMessage('FIRSTNAME IS REQUIRED')
      .escape(),
], async function(req:any, res:any) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const customErr = {
      error: formatErr(400, errors.array()[0].msg, errors.array()[0].param),
    };
    return res.status(400).json(customErr);
  }

  const header = createHeader('auth', res.locals.jwtPayload.token);
  // Call platform api
  const response=await fetchApi(
      BASE_URL+'/api/users/'+req.params.id,
      'PATCH',
      header,
      JSON.stringify({
        firstname: req.body.firstName,
      }));
  if (response.status !== 200) {
    res.status(response.status).send(response.data);
  } else {
    const data = parseData.user(response.data);
    res.status(response.status).send(data);
  }
});

/**
 * Upload file (image) Wrapper API For NetObjex Platform
 */
router.patch('/users/:id/upload', [checkJwt, fileUpload({
  limits: {
    fileSize: 2000000, // 2mb (in byte)
  },
  abortOnLimit: true,
})],
async function(req:any, res:any) {
  if (!req.files) {
    const customErr = {
      error: formatErr(400, 'IMAGE IS REQUIRED', 'IMAGE'),
    };
    return res.status(400).json(customErr);
  }
  const form = new FormData();
  if (!IMG_TYPE.includes(req.files.image.mimetype)) {
    const customErr = {
      error: formatErr(400, 'INVALID FILE TYPE', 'IMAGE TYPE'),
    };
    return res.status(400).json(customErr);
  }
  form.append('file', req.files.image.data, {
    contentType: req.files.image.mimetype,
    filename: req.files.image.name,
  });

  const header = createHeader('file', res.locals.jwtPayload.token);
  // Call platform api to upload image
  const uploadResponse=await fetchApi(
      BASE_URL+'/api/files/upload?type=COUPON_IMAGE',
      'POST',
      header,
      form,
  );
  if (uploadResponse.status==200) {
    const header = createHeader('auth', res.locals.jwtPayload.token);
    // Call platform api to udate avatar
    const response=await fetchApi(
        BASE_URL+'/api/users/'+req.params.id,
        'PATCH',
        header,
        JSON.stringify({
          avatar: uploadResponse.data[0].id,
        }));
    if (response.status !== 200) {
      res.status(response.status).send(response.data);
    } else {
      const data = parseData.user(response.data);
      res.status(response.status).send(data);
    }
  } else {
    res.status(uploadResponse.status).send(uploadResponse.data);
  }
});

/**
   * Change User's password Wrapper API For NetObjex Platform
   * @param {string} password
   */
router.patch('/change-password/:id', checkJwt, [
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

  const header = createHeader('auth', res.locals.jwtPayload.token);
  // Call platform api
  const response=await fetchApi(
      BASE_URL+'/api/users/'+req.params.id,
      'PATCH',
      header,
      JSON.stringify({
        password: req.body.password,
      }));
  if (response.status !== 200) {
    res.status(response.status).send(response.data);
  } else {
    res.status(response.status).send({data: 'Successfully Updated'});
  }
});

/**
 * Get a User Wrapper API For NetObjex Platform
 */
router.get('/users/:id', checkJwt,
    async function(req:any, res:any) {
      const header = createHeader('auth', res.locals.jwtPayload.token);
      // Call platform api
      const response=await fetchApi(
          BASE_URL+'/api/users/'+req.params.id+'?filter={'+ROLE_FILTER+'}',
          'GET',
          header,
          '',
      );
      if (response.status !== 200) {
        res.status(response.status).send(response.data);
      } else {
        const data = parseData.user(response.data);
        res.status(response.status).send(data);
      }
    });

export default router;
