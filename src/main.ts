import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ENVS } from './utils/constants';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  await app.listen(ENVS.PORT, () => {
    console.log(`Server is running on port ${ENVS.PORT}`);
  });
}
bootstrap();
