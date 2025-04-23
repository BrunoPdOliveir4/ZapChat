import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { AuthService } from './Auth.service';
import { ResponseEntity } from 'src/Utils/Response.entity';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post('login')
    @HttpCode(200)
    async login(@Body() body: { username: string, password: string }): Promise<ResponseEntity<any>> {
        const user = await this.authService.validateUser(body.username, body.password);
        const token = await this.authService.login(user);
        return ResponseEntity.ok(token);
    }
}
