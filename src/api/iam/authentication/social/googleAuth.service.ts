import {
  ConflictException,
  Injectable,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import { AuthenticationService } from '../authentication.service';
import { PrismaService } from '@/lib/prisma';
import { UserRoles } from '../../types';
import { QueryErrorCodes } from '@/src/constants';

@Injectable()
export class GoogleAuthService implements OnModuleInit {
  private oauthClient: OAuth2Client;

  constructor(
    private readonly configService: ConfigService,
    private readonly authenticationService: AuthenticationService,
    private readonly prisma: PrismaService,
  ) {}

  onModuleInit() {
    const clientId = this.configService.get('GOOGLE_CLIENT_ID');
    const clientSecret = this.configService.get('GOOGLE_CLIENT_SECRET');

    this.oauthClient = new OAuth2Client(clientId, clientSecret);
  }

  async authenticate(token: string) {
    try {
      const loginTicket = await this.oauthClient.verifyIdToken({
        idToken: token,
      });

      //@ts-expect-error
      const { email, sub: googleId } = loginTicket.getPayload();

      const user = await this.prisma.user.findFirst({
        where: {
          googleId,
        },
      });

      if (user) {
        return this.authenticationService.generateTokens(user);
      } else {
        const role = await this.prisma.role.findFirst({
          where: { role: UserRoles.regular },
        });

        const newUser = await this.prisma.user.create({
          data: {
            email,
            googleId,
            role: {
              connect: {
                id: role?.id,
              },
            },
          },
        });
        return this.authenticationService.generateTokens(newUser);
      }
    } catch (err) {
      const error = JSON.parse(err as string) as { code: string };
      if (error.code === QueryErrorCodes.PG_UNIQUE_VIOLATION_ERROR) {
        throw new ConflictException();
      }
      throw new UnauthorizedException();
    }
  }
}
