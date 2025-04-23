// src/middleware/asyncHandler.ts

import {
  Request,
  Response,
  NextFunction,
  RequestHandler
} from 'express';

/**
 * Wraps an async route‑handler so you don’t need a try/catch in every controller.
 *
 * By making this generic over Req extends Request, you can pass in functions
 * that expect a richer `req` (e.g. AuthRequest with userId) and TS will accept it.
 */
export function asyncHandler<
  Req extends Request = Request,
  ResBody = any
>(
  fn: (req: Req, res: Response<ResBody>, next: NextFunction) => Promise<any>
): RequestHandler {
  return (req, res, next) => {
    // Cast the plain Request to our richer Req
    Promise.resolve(fn(req as Req, res, next)).catch(next);
  };
}
