class AppError extends Error {
  constructor(message, statusCode, erro) {
    super(message);
    ((this.statusCode = statusCode),
      (this.code = code),
      Error.captureStackTrace(this, this.constructor));
  }
}

class BadRequestError extends AppError {
  constructor(message, code = "BAD REQEST") {
    super(message, 400, code);
  }
}

class UauthorizedError extends AppError {
  constructor(message, code = "UNAUTHORIZED") {
    super(message, 401, code);
  }
}

class ForbiddenError extends AppError {
  constructor(message, code = "FORBIDDEN") {
    super(message, 403, code);
  }
}

class NotFoundErorr extends AppError {
  constructor(message, code = "NOT_FOUND") {
    super(message, 404, code);
  }
}

module.export = { AppError };
