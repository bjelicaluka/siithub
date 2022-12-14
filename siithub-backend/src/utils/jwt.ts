import jwt from 'jsonwebtoken';
import { ForbiddenException } from '../error-handling/errors';

function generateJWT(payload: any): string {
  return jwt.sign(payload, process.env.TOKEN_SECRET || '', {
    expiresIn: '1800s'
  });
}

function parseJWT(token: string): any {
  try {
    return jwt.verify(token, process.env.TOKEN_SECRET || '');
  }
  catch(error: any) {
    throw new ForbiddenException(error.message, { token });
  }
}

export {
  generateJWT,
  parseJWT
}