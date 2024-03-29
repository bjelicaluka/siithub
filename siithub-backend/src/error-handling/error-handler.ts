import type { Response } from 'express';
import { ZodError } from 'zod';
import * as errors from './errors';

export type ErrorResponse = {
  statusCode: number;
  message: string;
}

const ErrorNameCode = {
  [errors.BadLogicException.name]: 400,
  [errors.AuthenticationException.name]: 401,
  [errors.ForbiddenException.name]: 403,
  [errors.MissingEntityException.name]: 404,
  [errors.DuplicateException.name]: 409,
  [Error.name]: 500,
}

export class ErrorHandler {

  private response: Response;

  constructor(response: Response) {
    this.response = response;
  }

  public static forResponse(response: Response) {
    return new ErrorHandler(response);
  }

  public handleError(e: Error): ErrorResponse {
    const errorResponse = (e.name === ZodError.name) ? {
      statusCode: 400,
      message: "Validation error",
      payload: (e as ZodError).issues
    } : {
      statusCode: ErrorNameCode[e.name] || ErrorNameCode[Error.name],
      message: e.message,
      payload: (e as errors.HandableError).payload || null
    };
    
    this.sendErrorResponse(errorResponse)
    
    return errorResponse;
  }

  private sendErrorResponse(errorResponse: ErrorResponse) {
    const { statusCode } = errorResponse;
    this.response.status(statusCode).send(errorResponse);
  }

}