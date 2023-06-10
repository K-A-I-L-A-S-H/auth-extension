import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CoffeesModule } from 'src/api/coffees/coffees.module';
import { UsersModule } from 'src/api/users/users.module';
import { PrismaModule } from 'lib/prisma';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    CoffeesModule,
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
