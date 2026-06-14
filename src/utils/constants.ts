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
};

export const BANK_ID = '00000000-0000-0000-0000-000000000000';
