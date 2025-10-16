import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { UserModule } from '../../User/User.module';
import { AuthService } from './Auth.service';
import { JwtStrategy } from './jwt/jwt.strategy';
import { AuthController } from './Auth.controller';
import { JwtConfigModule } from './jwt/jwt.module';

@Module({
  imports: [
    UserModule,
    PassportModule,
    JwtConfigModule
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
