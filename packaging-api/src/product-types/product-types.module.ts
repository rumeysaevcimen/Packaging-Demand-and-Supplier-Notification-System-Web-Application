import { Module } from '@nestjs/common';
import { ProductTypeController } from './product-types.controller';

@Module({
  controllers: [ProductTypeController],
  providers: [],
  exports: [],
})
export class ProductTypesModule {}
