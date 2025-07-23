import { Request, Response, NextFunction } from "express";

export const errorMiddleware = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err);
  const statusCode = err.statusCode || 500;
  const message = err.message || "서버 오류가 발생했습니다.";
  res.status(statusCode).json({ message });
};
