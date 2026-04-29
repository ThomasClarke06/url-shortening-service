import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { ShortenUrlDto } from './dto/shorten-url.dto';
import { UrlsService } from './urls.service';

@Controller()
export class UrlsController {
  constructor(private readonly urls: UrlsService) {}

  // Declared before GET :code so "/" is not captured as a code.
  @Get()
  root(): { ok: boolean } {
    return { ok: true };
  }

  @Post('urls')
  @HttpCode(201)
  shorten(@Body() body: ShortenUrlDto) {
    const base =
      process.env.SHORT_LINK_BASE ??
      `http://localhost:${process.env.PORT ?? '3000'}`;
    return this.urls.shorten(body.url, base);
  }

  @Get(':code')
  resolve(@Param('code') code: string, @Res() res: Response): void {
    const target = this.urls.resolveForRedirect(code);
    // Explicit 302 so clients get a real Location header (reliable with supertest and browsers).
    res.redirect(302, target);
  }
}
