import { ApiVersions, AuthType } from '@/src/constants';
import { Body, Controller, Post } from '@nestjs/common';
import { GoogleAuthService } from './googleAuth.service';
import { GoogleTokenDto } from './googleAuth.dto';
import { Auth } from '@/lib/decorators/auth.decorator';

@Auth(AuthType.None)
@Controller({
  version: ApiVersions.V1,
  path: 'authentication/google',
})
export class GoogleAuthController {
  constructor(private readonly googleAuthService: GoogleAuthService) {}

  @Post()
  async handleGoogleAuthentication(@Body() tokenDto: GoogleTokenDto) {
    return this.googleAuthService.authenticate(tokenDto.token);
  }
}
