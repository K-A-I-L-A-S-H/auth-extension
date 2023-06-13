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
import { ApiVersions, AuthType } from 'src/constants';
import { SignInDto } from './dto/signIn.dto';
import { Response } from 'express';
import { Auth } from '@/lib/decorators/auth.decorator';
import { RefreshTokenDto } from './dto/refreshToken.dto';
import { ActiveUser } from '@/lib/decorators/activeUser.decorator';
import { ActiveUserData, ResponseType } from '../types';
import { OTPAuthenticationService } from './otpAuthentication/otpAuthentication.service';
import { toFileStream } from 'qrcode';

@Auth(AuthType.None)
@Controller({
  version: ApiVersions.V1,
  path: 'authentication',
})
export class AuthenticationController {
  constructor(
    private authService: AuthenticationService,
    private otpAuthService: OTPAuthenticationService,
  ) {}

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

  @HttpCode(HttpStatus.OK)
  @Post('token/refresh')
  async handleRefreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshTokens(refreshTokenDto);
  }

  @Auth(AuthType.Bearer)
  @HttpCode(HttpStatus.OK)
  @Post('2fa/generate/qr')
  async generateQrCode(
    @ActiveUser() user: ActiveUserData,
    @Res() response: Response,
  ) {
    const { secret, uri } = this.otpAuthService.generateSecret(user.email);
    await this.otpAuthService.enableTfaForUser(user.email, secret);
    response.type(ResponseType.PNG);
    return toFileStream(response, uri!);
  }

  @Auth(AuthType.Bearer)
  @HttpCode(HttpStatus.OK)
  @Post('2fa/generate/otp')
  async generateOtp(@ActiveUser() user: ActiveUserData) {
    const { secret, otp } = this.otpAuthService.generateOtp(user.email);
    await this.otpAuthService.enableTfaForUser(user.email, secret);
    return {
      otp,
    };
  }

  @Auth(AuthType.Bearer)
  @HttpCode(HttpStatus.OK)
  @Post('2fa/verify')
  async verify(
    @Body() { otp }: { otp: string },
    @ActiveUser() user: ActiveUserData,
  ) {
    return this.otpAuthService.verifyOtp(otp, user);
  }
}
