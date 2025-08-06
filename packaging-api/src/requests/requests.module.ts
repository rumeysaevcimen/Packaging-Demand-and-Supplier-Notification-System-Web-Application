import { Module } from '@nestjs/common';
import { RequestController } from './requests.controller';

@Module({
  controllers: [RequestController],
  providers: [],
  exports: [],
})
export class RequestModule {}
