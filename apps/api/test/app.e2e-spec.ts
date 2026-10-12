import { Test, TestingModule } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

/**
 * End-to-end smoke test. Requires a reachable MongoDB (see MONGODB_URI) —
 * run via `docker compose up -d mongodb` then `pnpm --filter @needx/api test:e2e`.
 * Not executed inside the sandbox this project was generated in, since no
 * outbound MongoDB connection is available there — see ARCHITECTURE.md.
 */
describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/api/v1/health (GET) returns ok', () => {
    return request(app.getHttpServer())
      .get('/api/v1/health')
      .expect(200)
      .expect((res) => {
        expect(res.body.data.status).toBe('ok');
      });
  });

  it('/api/v1/categories (GET) is public and returns a list', () => {
    return request(app.getHttpServer())
      .get('/api/v1/categories')
      .expect(200)
      .expect((res) => {
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.data)).toBe(true);
      });
  });

  it('/api/v1/users/me (GET) rejects an unauthenticated request', () => {
    return request(app.getHttpServer()).get('/api/v1/users/me').expect(401);
  });
});
