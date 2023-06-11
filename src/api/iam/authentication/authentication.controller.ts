import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
} from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { SignUpDto } from './dto/signUp.dto';
import { ApiVersions, AuthType, CookieNames } from 'src/constants';
import { SignInDto } from './dto/signIn.dto';
import { Response } from 'express';
import { Auth } from '@/lib/decorators/auth.decorator';

@Auth(AuthType.None)
@Controller({
  version: ApiVersions.V1,
  path: 'authentication',
})
export class AuthenticationController {
  constructor(private authService: AuthenticationService) {}

  @Post('signup')
  handleSignup(@Body() signUpDto: SignUpDto) {
    return this.authService.signup(signUpDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('signin')
  async handleSignin(
    @Res({ passthrough: true }) response: Response,
    @Body() signInDto: SignInDto,
  ) {
    return this.authService.signin(signInDto);
    // response.cookie(CookieNames.AccessToken, accessToken, {
    // const accessToken = await this.authService.signin(signInDto);
    // response.cookie(CookieNames.AccessToken, accessToken, {
    //   secure: true,
    //   httpOnly: true,
    //   sameSite: true,
    // });
  }
}
