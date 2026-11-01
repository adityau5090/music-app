import type { ErrorRequestHandler } from "express";

import { env } from "../config/env.js";
import { AppError } from "../utils/app-error.js";

export const errorMiddleware: ErrorRequestHandler = (
  error,
  _req,
  res,
  _next,
) => {
  const statusCode =
    error instanceof AppError ? error.statusCode : 500;

  const message =
    error instanceof AppError
      ? error.message
      : "Internal server error";

  if (statusCode >= 500) {
    console.error(error);
  }

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      ...(env.NODE_ENV === "development" &&
        error instanceof Error && {
          stack: error.stack,
        }),
    },
  });
};