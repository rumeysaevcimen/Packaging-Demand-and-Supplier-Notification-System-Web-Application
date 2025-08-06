import { Controller, Get } from '@nestjs/common';
import { readFileSync } from 'fs';
import { join } from 'path';

@Controller('users')
export class UsersController {
  private dataPath = join(process.cwd(), 'src', 'data', 'users.json');

  @Get()
  findAll() {
    const data = readFileSync(this.dataPath, 'utf8');
    return JSON.parse(data);
  }
}
