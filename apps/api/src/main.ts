import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api/v1');
  app.enableCors({
    origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('BUILDFlow ERP API')
    .setDescription('Modular Enterprise Resource Planning REST API for Medium Construction Enterprises')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs/api', app, document);

  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`[BUILDFlow ERP API] Server running on http://localhost:${port}/api/v1`);
  console.log(`[BUILDFlow ERP API] OpenAPI Docs available at http://localhost:${port}/docs/api`);
}

bootstrap();

