import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ENVS } from './utils/constants';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      transform: false,
    }),
  );
  await app.listen(ENVS.PORT, () => {
    console.log(`Server is running on port ${ENVS.PORT}`);
  });
}
bootstrap();
