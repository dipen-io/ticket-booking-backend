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

class ConflictError extends AppError {
    constructor(message, code = "CONFLICT_ERROR") {
        super(message, 405, code);
    }
}

class TooManyRequest extends AppError {
    constructor(message, code = "TOO_MANY_REQUEST") {
        super(message, 405, code);
    }
}

// Corrected to module.exports and included all classes
module.exports = {
    AppError,
    ConflictError,
    TooManyRequest,
    BadRequestError,
    UnauthorizedError,
    ForbiddenError,
    NotFoundError,
};
