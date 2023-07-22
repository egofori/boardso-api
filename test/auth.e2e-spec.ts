import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { ConfigModule } from '@nestjs/config';
import { AuthService } from '../src/auth/auth.service';
import { AuthModule } from '../src/auth/auth.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  const authService = {
    signUpLocal: () => ({ token: 'xyz' }),
    signInLocal: () => ({ token: 'xyz' }),
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AuthModule, ConfigModule.forRoot({ isGlobal: true })],
    })
      .overrideProvider(AuthService)
      .useValue(authService)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/auth/local/sign-up (POST)', () => {
    return request(app.getHttpServer())
      .post('/auth/local/sign-up')
      .expect(201)
      .expect(authService.signUpLocal());
  });

  it('/auth/local/sign-in (POST)', () => {
    return request(app.getHttpServer())
      .post('/auth/local/sign-in')
      .expect(200)
      .expect(authService.signInLocal());
  });
});
