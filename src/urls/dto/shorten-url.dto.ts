import { IsNotEmpty, IsString, IsUrl, MaxLength } from 'class-validator';

export class ShortenUrlDto {
  @IsNotEmpty({ message: 'url must not be empty' })
  @IsString()
  @MaxLength(2048)
  @IsUrl(
    {
      require_protocol: true,
      protocols: ['http', 'https'],
      require_tld: false,
    },
    { message: 'url must be a valid http(s) URL' },
  )
  url!: string;
}
