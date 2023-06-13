import { Auth } from '@/lib/decorators/auth.decorator';
import { ApiVersions, AuthType } from '@/src/constants';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SessionAuthenticationService } from './sessionAuthentication.service';
import { SignInDto } from './dto/signIn.dto';
import { Request } from 'express';
import { promisify } from 'util';
import { SessionGuard } from '@/lib/guards/session.guard';
import { ActiveUser } from '@/lib/decorators/activeUser.decorator';
import { ActiveUserData } from '../types';

@Auth(AuthType.None)
@Controller({
  version: ApiVersions.V1,
  path: 'sessionAuth',
})
export class SessionAuthenticationController {
  constructor(
    private readonly sessionAuthService: SessionAuthenticationService,
  ) {}

  @HttpCode(HttpStatus.OK)
  @Post('signin')
  async handleSignin(@Req() request: Request, @Body() signInDto: SignInDto) {
    const user = await this.sessionAuthService.signin(signInDto);
    await promisify(request.logIn).call(request, user);
  }

  // sample route to test session authentication
  @UseGuards(SessionGuard)
  @Get()
  async handleGet(@ActiveUser() user: ActiveUserData) {
    return `Hello ${user.email}`;
  }
}
