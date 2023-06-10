import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { SignUpDto } from './dto/signUp.dto';
import { ApiVersions } from 'src/constants';
import { SignInDto } from './dto/signIn.dto';

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
  handleSignin(@Body() signInDto: SignInDto) {
    return this.authService.signin(signInDto);
  }
}
