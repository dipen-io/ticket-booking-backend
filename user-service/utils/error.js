class AppError extends Error {
  constructor(message, statusCode, code) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;

    // Captures the stack trace and excludes this constructor from it
    Error.captureStackTrace(this, this.constructor);
  }
}

class BadRequestError extends AppError {
  constructor(message, code = "BAD_REQUEST") {
    super(message, 400, code);
  }
}

class UnauthorizedError extends AppError {
  constructor(message, code = "UNAUTHORIZED") {
    super(message, 401, code);
  }
}

class ForbiddenError extends AppError {
  constructor(message, code = "FORBIDDEN") {
    super(message, 403, code);
  }
}

class NotFoundError extends AppError {
  constructor(message, code = "NOT_FOUND") {
    super(message, 404, code);
  }
}

// Corrected to module.exports and included all classes
module.exports = {
  AppError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
};
