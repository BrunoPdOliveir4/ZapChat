// src/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../../User/User.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
        private userService: UserService,
        private jwtService: JwtService
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.userService.findByUsername(username);
    if (user && await bcrypt.compare(password, user.password)) {
        const { password, ...result } = user.toObject();
        return result;
    }
    throw new UnauthorizedException('Credenciais inválidas');
  }

  async login(user: any) {
    const payload = { sub: user._id, username: user.username };
    return {
      access_token: this.jwtService.sign(payload), 
      _id: user._id,
      username: user.username
    };
  }
}
