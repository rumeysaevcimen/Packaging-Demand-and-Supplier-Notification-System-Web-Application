import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProductTypesModule } from './product-types/product-types.module';
import { RequestModule } from './requests/requests.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    ProductTypesModule,
    RequestModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
