import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CoffeesModule } from 'src/api/coffees/coffees.module';
import { UsersModule } from 'src/api/users/users.module';
import { PrismaModule } from 'lib/prisma';
import { ConfigModule } from '@nestjs/config';
import { IAMModule } from 'src/api/iam';

@Module({
  imports: [
    CoffeesModule,
    ConfigModule.forRoot({ isGlobal: true }),
    IAMModule,
    PrismaModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
