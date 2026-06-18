import { CacheModuleAsyncOptions } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
import { ENVS } from './utils/constants';

export const redisOptions: CacheModuleAsyncOptions = {
  isGlobal: true,
  useFactory: async () => ({
    store: await redisStore({
      socket: {
        host: ENVS.REDIS_HOST,
        port: ENVS.REDIS_PORT,
      },
      password: ENVS.REDIS_PASSWORD,
    }),
  }),
};
