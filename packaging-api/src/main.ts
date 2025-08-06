import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: 'http://localhost:3000', // Frontend'in çalıştığı adres
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true, // Eğer cookie veya auth kullanacaksan gerekli
  });

  await app.listen(3001);
  console.log('✅ Backend started on port 3001');
}
bootstrap();
