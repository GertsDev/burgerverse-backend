// src/config/auth.ts
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in environment variables');
}
if (!process.env.JWT_REFRESH_SECRET) {
  throw new Error('JWT_REFRESH_SECRET is not defined in environment variables');
}

export const JWT_SECRET = process.env.JWT_SECRET;
export const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
export const ACCESS_EXPIRES_IN = '15m';
export const REFRESH_EXPIRES_IN = '7d';

console.log('JWT_SECRET loaded:', !!JWT_SECRET);
