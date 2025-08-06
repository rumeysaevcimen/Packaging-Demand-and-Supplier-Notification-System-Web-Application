import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { readFileSync } from 'fs';
import { join } from 'path';

@Controller('auth')
export class AuthController {
  @Post('login')
  login(@Body() body: { username: string; password: string }) {
    try {
      const filePath = join(process.cwd(), 'src', 'data', 'users.json');
      const data = readFileSync(filePath, 'utf8');
      const users = JSON.parse(data);

      const user = users.find(
        (u: any) => u.username === body.username && u.password === body.password,
      );

      if (!user) throw new UnauthorizedException('Invalid credentials');

      const { password, ...userData } = user;
      return { success: true, user: userData, token: 'mock-token-' + user.id };
    } catch (err) {
      throw new UnauthorizedException('Internal Server Error');
    }
  }
}
