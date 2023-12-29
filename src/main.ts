import { NestFactory } from '@nestjs/core';
import { json } from 'body-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: [
      process.env.FRONTEND_BASE_URL,
      process.env.LOCAL_FRONTEND_BASE_URL,
    ],
  });
  app.use(json({ limit: '30mb' }));
  await app.listen(3333);
}
bootstrap();
