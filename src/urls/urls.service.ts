import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { randomBytes } from 'crypto';

const CODE_LENGTH = 8;
const ALPHABET = 'abcdefghijklmnopqrstuvwxyz0123456789';

type ShortenResult = {
  code: string;
  shortUrl: string;
  originalUrl: string;
};

@Injectable()
export class UrlsService {
  /** Lookup by short code; second map makes repeat shorten for the same URL idempotent. */
  private readonly byCode = new Map<string, { url: string }>();
  private readonly codeByUrl = new Map<string, string>();

  shorten(rawUrl: string, shortLinkBase?: string): ShortenResult {
    const url = rawUrl.trim();
    const existing = this.codeByUrl.get(url);
    if (existing) {
      return this.toResult(existing, shortLinkBase);
    }

    let code = this.generateCode();
    let attempts = 0;
    // Same code twice is extremely unlikely; retry a few times before giving up.
    while (this.byCode.has(code) && attempts < 16) {
      code = this.generateCode();
      attempts += 1;
    }
    if (this.byCode.has(code)) {
      throw new InternalServerErrorException(
        'Could not allocate a unique short code',
      );
    }

    this.byCode.set(code, { url });
    this.codeByUrl.set(url, code);
    return this.toResult(code, shortLinkBase);
  }

  /** Used by GET /:code — returns the long URL or throws NotFoundException. */
  resolveForRedirect(code: string): string {
    const row = this.byCode.get(code);
    if (!row) {
      throw new NotFoundException('Short link not found');
    }
    return row.url;
  }

  private toResult(code: string, shortLinkBase?: string): ShortenResult {
    const row = this.byCode.get(code);
    if (!row) {
      throw new NotFoundException('Short link not found');
    }
    const base = (shortLinkBase ?? 'http://localhost:3000').replace(/\/$/, '');
    return {
      code,
      shortUrl: `${base}/${code}`,
      originalUrl: row.url,
    };
  }

  private generateCode(): string {
    const bytes = randomBytes(CODE_LENGTH);
    let out = '';
    for (let i = 0; i < CODE_LENGTH; i++) {
      out += ALPHABET[bytes[i]! % ALPHABET.length];
    }
    return out;
  }
}
