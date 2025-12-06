import { logger } from "@/config/logger";
import { AppError } from "@/middleware/error-handler";
import { NextFunction, Request, Response } from "express";

export const errorMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    logger.error(`Error: ${req.method} ${req.url} - ${err.message}`);
    return res.status(err.statusCode).json({
      status: "error",
      message: err.message,
      ...(err.details && { details: err.details }),
    });
  } else {
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
};
