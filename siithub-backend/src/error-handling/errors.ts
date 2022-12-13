
class HandableError extends Error {
  public payload: any;
  
  constructor(message: string, payload: any = null) {
    super(message);
    this.payload = payload;
  }
}

class BadLogicException extends HandableError {
  constructor(message: string, payload: any = null) {
    super(message, payload);
    this.name = "BadLogicException";
  }
}

class AuthenticationException extends HandableError {
  constructor(message: string, payload: any = null) {
    super(message, payload);
    this.name = "AuthenticationException";
  }
}

class ForbiddenException extends HandableError {
  constructor(message: string, payload: any = null) {
    super(message, payload);
    this.name = "ForbiddenException";
  }
}

class MissingEntityException extends HandableError {
  constructor(message: string, payload: any = null) {
    super(message, payload);
    this.name = "MissingEntityException";
  }
}

class DuplicateException extends HandableError {
  constructor(message: string, payload: any = null) {
    super(message, payload);
    this.name = "DuplicateException";
  }
}

export {
  HandableError,
  BadLogicException,
  AuthenticationException,
  ForbiddenException,
  MissingEntityException,
  DuplicateException
};