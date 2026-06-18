import { createHash } from 'crypto';

export const ENVS = {
  DATABASE_URL: process.env['DATABASE_URL'] ?? '',
  PORT: process.env['PORT'] ?? 3000,
  GOOGLE_CLIENT_ID: process.env['GOOGLE_CLIENT_ID'] ?? '',
  GOOGLE_CLIENT_SECRET: process.env['GOOGLE_CLIENT_SECRET'] ?? '',
  JWT_SECRET_KEY: process.env['JWT_SECRET'] ?? 'randomstring',
  JWT_REFRESH_SECRET_KEY:
    process.env['JWT_REFRESH_SECRET'] ?? 'randomstringrefresh',
  JWR_EXPIRES_IN: (process.env['JWR_EXPIRES_IN'] ?? '15m') as '15m',
  FRONTEND_URL: process.env['FRONTEND_URL'] ?? 'http://localhost:3000',
  REDIS_PORT: Number(process.env.REDIS_PORT ?? 6379),
  REDIS_HOST: process.env.REDIS_HOST ?? 'localhost',
  REDIS_PASSWORD: process.env.REDIS_PASSWORD ?? 'password',
};

export const hash = (data: object | string): string =>
  createHash('sha256')
    .update(typeof data === 'string' ? data : JSON.stringify(data))
    .digest('hex');

export const BANK_ID = '00000000-0000-0000-0000-000000000000';
