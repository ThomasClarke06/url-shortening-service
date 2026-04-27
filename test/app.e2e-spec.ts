import {
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import type { Server } from 'http';
import request from 'supertest';
import { AppModule } from '../src/app.module';

type ShortenBody = {
  shortUrl: string;
  code: string;
  originalUrl: string;
};

function httpServer(app: INestApplication): Server {
  return app.getHttpServer() as Server;
}

describe('App (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    process.env.SHORT_LINK_BASE = 'http://short.ly';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();
  });

  afterEach(async () => {
    await app.close();
    delete process.env.SHORT_LINK_BASE;
  });

  it('GET /', () => {
    return request(httpServer(app))
      .get('/')
      .expect(200)
      .expect((res) => {
        expect((res.body as { ok: boolean }).ok).toBe(true);
      });
  });

  it('POST /urls then GET /:code redirects', async () => {
    const res = await request(httpServer(app))
      .post('/urls')
      .send({ url: 'https://www.example.com/some/very/long/path' })
      .expect(201);

    const body = res.body as ShortenBody;
    expect(body.shortUrl).toMatch(/^http:\/\/short\.ly\/[a-z0-9]{8}$/);
    expect(body.originalUrl).toBe(
      'https://www.example.com/some/very/long/path',
    );

    await request(httpServer(app))
      .get(`/${body.code}`)
      .expect(302)
      .expect('Location', 'https://www.example.com/some/very/long/path');

    const dup = await request(httpServer(app))
      .post('/urls')
      .send({ url: 'https://www.example.com/some/very/long/path' })
      .expect(201);
    expect((dup.body as ShortenBody).code).toBe(body.code);
  });

  it('POST /urls rejects bad input', async () => {
    await request(httpServer(app)).post('/urls').send({ url: '' }).expect(400);
    await request(httpServer(app))
      .post('/urls')
      .send({ url: 'not-a-url' })
      .expect(400);
    await request(httpServer(app)).post('/urls').send({}).expect(400);
  });

  it('GET /:code returns 404 when missing', () => {
    return request(httpServer(app)).get('/notfound1').expect(404);
  });
});
