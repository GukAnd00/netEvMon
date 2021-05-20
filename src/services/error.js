/* eslint-disable max-classes-per-file */

"use strict";

import { constants as StatusCodes } from "http2";

const statusCodes = {
  BadRequestError: StatusCodes.HTTP_STATUS_BAD_REQUEST,
  UnauthorizedError: StatusCodes.HTTP_STATUS_UNAUTHORIZED,
  NotFoundError: StatusCodes.HTTP_STATUS_NOT_FOUND,
  InternalError: StatusCodes.HTTP_STATUS_INTERNAL_SERVER_ERROR,
  ConflictError: StatusCodes.HTTP_STATUS_CONFLICT,
  ForbiddenError: StatusCodes.HTTP_STATUS_FORBIDDEN,
};

export class SystemError extends Error {
  constructor({ message }) {
    super(message);
    this.message = message;
  }
}

export class BadRequestError extends SystemError {
  constructor(message) {
    super({
      message,
    });
    this.name = "BadRequestError";
  }
}

export class UnauthorizedError extends SystemError {
  constructor(message) {
    super({
      message,
    });
    this.name = "UnauthorizedError";
  }
}

export class NotFoundError extends SystemError {
  constructor(message) {
    super({
      message,
    });
    this.name = "NotFoundError";
  }
}

export class InternalError extends SystemError {
  constructor(message) {
    super({
      message,
    });
    this.name = "InternalError";
  }
}

export class ConflictError extends SystemError {
  constructor(message) {
    super({
      message,
    });
    this.name = "ConflictError";
  }
}

export class ForbiddenError extends SystemError {
  constructor(message) {
    super({
      message,
    });
    this.name = "ForbiddenError";
  }
}

const getErrorInstanceName = (error) => error.name;

export const getStatusCode = (error) => (statusCodes[error] ? statusCodes[error] : statusCodes.InternalError);

export const generateHttpError = (response, error, next) => {
  const statusCode = getStatusCode(getErrorInstanceName(error));
  const errorMessage = error.message;

  response.status(statusCode).json({ success: false, error: errorMessage });
  return next(errorMessage);
};

export const errorHandle = (handler) => async (req, res, next) => {
  try {
    await handler(req, res, next);
  } catch (e) {
    generateHttpError(res, e, next);
  }
};
