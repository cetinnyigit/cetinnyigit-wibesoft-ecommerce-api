import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
const session = require('express-session');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS'u açtım, frontend bağlanabilmesi için gerekli
  app.enableCors();

  // Validation için global pipe ekledim
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Hataları yakalamak için custom filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Response formatını düzenlemek için interceptor
  app.useGlobalInterceptors(new ResponseInterceptor());

  // Sepet için session kullanıyorum, express-session'ı entegre ettim
  app.use(
    session({
      secret: process.env.SESSION_SECRET || 'my-secret',
      resave: false,
      saveUninitialized: true,
      cookie: { maxAge: 24 * 60 * 60 * 1000 }, // 24 hours
    }),
  );

  // Swagger ekledim, API'yi test etmek için kullanışlı oluyor
  const config = new DocumentBuilder()
    .setTitle('E-Commerce API')
    .setDescription('E-Commerce Backend API Documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Swagger documentation: http://localhost:${port}/api/docs`);
}
bootstrap();
