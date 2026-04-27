import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UrlsService } from './urls.service';

describe('UrlsService', () => {
  let service: UrlsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UrlsService],
    }).compile();
    service = module.get(UrlsService);
  });

  it('shortens and resolves', () => {
    const created = service.shorten(
      'https://example.com/path',
      'http://short.ly',
    );
    expect(created.shortUrl).toBe(`http://short.ly/${created.code}`);
    expect(created.originalUrl).toBe('https://example.com/path');

    expect(service.resolveForRedirect(created.code)).toBe(
      'https://example.com/path',
    );
  });

  it('returns the same code for the same URL', () => {
    const a = service.shorten('https://example.com/same', 'http://b.test');
    const b = service.shorten('https://example.com/same', 'http://b.test');
    expect(b.code).toBe(a.code);
  });

  it('throws when code is unknown', () => {
    expect(() => service.resolveForRedirect('zzzzzzzz')).toThrow(
      NotFoundException,
    );
  });
});
