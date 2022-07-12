import {Request, Response, NextFunction} from 'express';
import * as jwt from 'jsonwebtoken';
import {JWT_SECRET_KEY, TTL} from '../constants';
import {formatErr} from '../errors';

/**
 * Validate the jwt token
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 */
export const checkJwt = (req: Request, res: Response, next: NextFunction) => {
  // Get the jwt token from the head
  const token = <string>req.headers['x-auth-key'];
  let jwtPayload;

  // Try to validate the token and get data
  try {
    jwtPayload = <any>jwt.verify(token, JWT_SECRET_KEY);
    res.locals.jwtPayload = jwtPayload;
  } catch (error) {
    // If token is not valid, respond with 401 (unauthorized)
    const customErr = {
      error: formatErr(401, 'AUTHENTICATION_REQUIRED', 'Authentication'),
    };
    res.status(401).send(customErr);
    return;
  }

  // The token is valid for 1 hour
  // We want to send a new token on every request
  //   const { userId, role } = jwtPayload;
  //   const newToken = jwt.sign({ userId, role }, JWT_SECRET_KEY, {
  //     expiresIn: "1h"
  //   });
  //   res.setHeader("token", newToken);

  // Call the next middleware or controller
  next();
};

export const signJwt = (userId: string, role: string, token: string) => {
  return jwt.sign(
      {userId: userId, role: role, token: token},
      JWT_SECRET_KEY,
      {expiresIn: TTL},
  );
};

/**
 * Check user's role from jwt payload,
 * if not admin respond with 403 (forbbiden)
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 */
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (res.locals.jwtPayload.role!=='CustomerAdmin') {
    const customErr = {
      error: formatErr(403, 'AUTHORISATION_FAILED', 'Authorisation'),
    };
    res.status(403).send(customErr);
    return;
  }
  next();
};
