// src/middleware/auth.ts
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/auth';

// extend Express Request so TS knows about req.userId
export interface AuthRequest<P = {}, ResBody = any, ReqBody = any>
  extends Request<P, ResBody, ReqBody> {
  userId: string;
}

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const auth = req.headers.authorization;
  if (!auth) {
    res.status(401).json({ success: false, message: 'No token' });
    return;
  }
  const [scheme, token] = auth.split(' ');
  if (scheme !== 'Bearer' || !token) {
    res.status(401).json({ success: false, message: 'Bad token' });
    return;
  }

  try {
    const { userId } = jwt.verify(token, JWT_SECRET) as {
      userId: string;
    };
    (req as AuthRequest).userId = userId;
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Invalid token' });
    return;
  }
}
