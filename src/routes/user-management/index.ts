import express from 'express';
import {BASE_URL, ROLE_LIST} from '../../constants';
import {DEFAULT_LIMIT, DEFAULT_SKIP, ROLE_FILTER} from '../../constants';
import {body, validationResult, query} from 'express-validator';
import {formatErr} from '../../errors';
import {fetchApi, cleanObj} from '../../utils/index';
import {createHeader} from '../../utils/index';
import * as parseData from '../../utils/parseResponse';
import {checkJwt, isAdmin} from '../../middleware/jwt';
// eslint-disable-next-line new-cap
const router = express.Router();

/**
 * Create Group Wrapper API For NetObjex Platform
 * @param {string} name
 * @param {string} orgId
 */
router.post('/groups', [checkJwt], [
  body('name').exists({
    checkFalsy: true,
    checkNull: true,
  })
      .withMessage('NAME IS REQUIRED')
      .escape(),
  body('orgId').exists({
    checkFalsy: true,
    checkNull: true,
  })
      .withMessage('Organisation Id IS REQUIRED')
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
      BASE_URL+'/api/customers',
      'POST',
      header,
      JSON.stringify({
        name: req.body.name,
        parentid: req.body.orgId,
        // logofileid: req.body.logoFieldId,
      }));
  if (response.status === 200) {
    const data = parseData.group(response.data);
    res.status(response.status).send(data);
  } else {
    res.status(response.status).send(response.data);
  }
});

/**
   * Enable/Disable User Wrapper API For NetObjex Platform
   * @param {boolean} disabled
   */
router.patch('/users/:id/disable', [checkJwt, isAdmin], [
  body('disabled').exists({
    checkNull: true,
  })
      .withMessage('DISABLED IS REQUIRED')
      .bail()
      .isBoolean()
      .withMessage('INVALID VALUE'),
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
        disabled: req.body.disabled,
      }));
  if (response.status !== 200) {
    res.status(response.status).send(response.data);
  } else {
    const data = parseData.user(response.data);
    res.status(response.status).send(data);
  }
});

/**
 * Add a new user Wrapper API For NetObjex Platform
 * @param {string} firstName
 * @param {string} email
 * @param {string} employeeId
 * @param {string} role
 * @param {string} groupId
 */
router.post('/users', [checkJwt, isAdmin], [
  body('firstName').exists({
    checkFalsy: true,
    checkNull: true,
  })
      .withMessage('FIRSTNAME IS REQUIRED')
      .escape(),
  body('email').exists({
    checkFalsy: true,
    checkNull: true,
  })
      .withMessage('EMAIL IS REQUIRED')
      .isEmail()
      .withMessage('Invalid Email'),
  body('employeeId').exists({
    checkFalsy: true,
    checkNull: true,
  })
      .withMessage('Employee ID IS REQUIRED')
      .escape(),
  body('groupId').exists({
    checkFalsy: true,
    checkNull: true,
  })
      .withMessage('Group ID IS REQUIRED')
      .escape(),

], async function(req:any, res:any) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const customErr = {
      error: formatErr(400, errors.array()[0].msg, errors.array()[0].param),
    };
    return res.status(400).json(customErr);
  }

  const header = createHeader('auth-reset', res.locals.jwtPayload.token);
  // Call platform api
  const response=await fetchApi(
      BASE_URL+'/api/users',
      'POST',
      header,
      JSON.stringify({
        firstname: req.body.firstName,
        email: req.body.email,
        // customerid: (req.body.groupId)?
        //             req.body.groupId:res.locals.jwtPayload.userId,
        additional: JSON.stringify({employeeid: req.body.employeeId}),
        roles: [req.body.role],
        customerid: req.body.groupId,
        password: '',
      }));
  if (response.status !== 200) {
    res.status(response.status).send(response.data);
  } else {
    const data = parseData.user(response.data);
    res.status(response.status).send(data);
  }
});

/**
 * View groups Wrapper API For NetObjex Platform
 */
router.get('/groups/tree', [checkJwt],
    async function(req:any, res:any) {
      const header = createHeader('auth', res.locals.jwtPayload.token);
      // Call platform api
      const response=await fetchApi(
          BASE_URL+'/api/customers/get-by-tree',
          'GET',
          header,
          '');
      res.status(response.status).send(response.data);
    });

/**
 * View groups Wrapper API For NetObjex Platform
 */
router.get('/groups/list', [checkJwt], [
  query('groupId').exists({
    checkFalsy: true,
    checkNull: true,
  })
      .escape()
      .withMessage('Group ID is REQUIRED'),
],
async function(req:any, res:any) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const customErr = {
      error: formatErr(400, errors.array()[0].msg, errors.array()[0].param),
    };
    return res.status(400).json(customErr);
  }
  const limit = req.query.limit || DEFAULT_LIMIT;
  // req.query.skip is the page number,
  // need to convert it to number of data before invoking platform
  const page = req.query.skip;
  const skip = (req.query.skip)?(limit*(req.query.skip-1)):DEFAULT_SKIP;

  // Set header
  const header = createHeader('auth', res.locals.jwtPayload.token);
  const filterGroup = '[where][parentid]='+req.query.groupId;
  const filterPage = (limit)?
                      '&filter[limit]='+limit+'&filter[skip]='+skip:'';

  // Call platform api
  const response=await fetchApi(
      BASE_URL+'/api/customers?filter'+filterGroup+filterPage,
      'GET',
      header,
      '',
  );
  if (response.status === 200) {
    const resp = response.data;
    const data = resp.map((group : any) => {
      return parseData.group(group);
    });
    const count =await fetchApi(
        BASE_URL+'/api/customers/count?'+filterGroup,
        'GET',
        header,
        '',
    );
    if (count.status === 200) {
      const totalPages = Math.ceil(count.data.count/limit);
      res.status(response.status).send({
        data: data,
        page: page,
        perPage: limit,
        count: count.data.count,
        totalPages: totalPages,
      });
    } else {
      res.status(count.status).send(count.data);
    }
  } else {
    res.status(response.status).send(response.data);
  }
});

/**
 * View users Wrapper API For NetObjex Platform
 */
router.get('/users/list', [checkJwt],
    async function(req:any, res:any) {
      const header = createHeader('auth', res.locals.jwtPayload.token);
      // Call platform api
      const limit = req.query.limit || DEFAULT_LIMIT;
      // req.query.skip is the page number,
      // need to convert it to number of data before invoking platform
      const page = req.query.skip;
      const skip = (req.query.skip)?(limit*(req.query.skip-1)):DEFAULT_SKIP;
      const filterGroup = (req.query.groupId)?
          '"where":{"customerid":"'+req.query.groupId+'"},':'';
      // eslint-disable-next-line max-len
      const filterPage = (limit)?',"limit":'+limit+',"skip":'+skip:'';
      const response=await fetchApi(
          // eslint-disable-next-line max-len
          BASE_URL+'/api/users'+'?filter={'+filterGroup+ROLE_FILTER+filterPage+'}',
          'GET',
          header,
          '',
      );
      if (response.status !== 200) {
        res.status(response.status).send(response.data);
      } else {
        const resp = response.data;
        const data = resp.map((user : any) => {
          return parseData.user(user);
        });
        const filterCount = (req.query.groupId)?
            '[where][customerid]='+req.query.groupId:'';
        const count =await fetchApi(
            BASE_URL+'/api/users/count?'+filterCount,
            'GET',
            header,
            '',
        );
        if (count.status === 200) {
          const totalPages = Math.ceil(count.data.count/limit);
          res.status(response.status).send({
            data: data,
            page: page,
            perPage: limit,
            count: count.data.count,
            totalPages: totalPages,
          });
        } else {
          res.status(count.status).send(count.data);
        }
      }
    });

/**
   * Update User data Wrapper API For NetObjex Platform
   * @param {string} firstName
   * @param {string} email
   * @param {string} groupId
   * @param {string} employeeId
   * @param {string} role
   */
router.patch('/users/:id', [checkJwt, isAdmin], [
  body('disabled')
      .optional()
      .isBoolean()
      .withMessage('INVALID VALUE'),
  body('email')
      .optional()
      .isEmail()
      .withMessage('INVALID VALUE'),
], async function(req:any, res:any) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const customErr = {
      error: formatErr(400, errors.array()[0].msg, errors.array()[0].param),
    };
    return res.status(400).json(customErr);
  }
  const role = (req.body.role)?[req.body.role]:null;
  const body = JSON.stringify(cleanObj({
    firstname: req.body.firstName || '',
    email: req.body.email || '',
    customerid: req.body.groupId || '',
    additional: (req.body.employeeId) ?
                  JSON.stringify({employeeid: req.body.employeeId}) : '',
    roles: role,
    disabled: req.body.disabled || '',
  }));

  const header = createHeader('auth', res.locals.jwtPayload.token);
  // Call platform api
  const response=await fetchApi(
      BASE_URL+'/api/users/'+req.params.id,
      'PATCH',
      header,
      body,
  );
  if (response.status !== 200) {
    res.status(response.status).send(response.data);
  } else {
    const data = parseData.user(response.data);
    res.status(response.status).send(data);
  }
});

/**
 * View users Wrapper API For NetObjex Platform
 */
router.get('/roles/list', checkJwt,
    async function(req:any, res:any) {
      const header = createHeader('auth', res.locals.jwtPayload.token);
      // Call platform api
      const response=await fetchApi(
          BASE_URL+'/api/users/roles',
          'GET',
          header,
          '',
      );

      if (response.status === 200) {
        const data = response.data.filter(
            (item:any)=>ROLE_LIST.includes(item.name),
        );
        res.status(response.status).send(data);
      } else {
        res.status(response.status).send(response.data);
      }
    });

/**
 * Update Group/Department Wrapper API For NetObjex Platform
 * @param {string} name
 * @param {string} parentId
 */
router.patch('/groups/:id', [checkJwt], [
  body('name').exists({
    checkFalsy: true,
    checkNull: true,
  })
      .withMessage('NAME IS REQUIRED')
      .escape(),
  body('parentId').optional()
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
      BASE_URL+'/api/customers/'+req.params.id,
      'PATCH',
      header,
      JSON.stringify({
        name: req.body.name,
        // parentid: req.body.parentId,
      }));
  if (response.status === 200) {
    const data = parseData.group(response.data);
    res.status(response.status).send(data);
  } else {
    res.status(response.status).send(response.data);
  }
});

/**
 * Delete Group Wrapper API For NetObjex Platform
 */
router.delete('/groups/:id', checkJwt,
    async function(req:any, res:any) {
      const header = createHeader('auth', res.locals.jwtPayload.token);
      // Call platform api
      const locations =await fetchApi(
          BASE_URL+'/api/locations/count?[where][customerid]='+req.params.id,
          'GET',
          header,
          '',
      );
      if (locations.data.count) {
        const customErr = {
          error: formatErr(
              400,
              'Cannot Delete Group : Locations are mapped to this group',
              'deleting group',
          ),
        };
        return res.status(400).json(customErr);
      } else {
        const response=await fetchApi(
            BASE_URL+'/api/customers/'+req.params.id,
            'DELETE',
            header,
            '',
        );
        res.status(response.status).send(response.data);
      }
    });

/**
 * Get a Group Wrapper API For NetObjex Platform
 */
router.get('/groups/:id', checkJwt,
    async function(req:any, res:any) {
      const header = createHeader('auth', res.locals.jwtPayload.token);
      // Call platform api
      const response=await fetchApi(
          BASE_URL+'/api/customers/'+req.params.id,
          'GET',
          header,
          '',
      );
      if (response.status === 200) {
        const data = parseData.group(response.data);
        res.status(response.status).send(data);
      } else {
        res.status(response.status).send(response.data);
      }
    });

export default router;
