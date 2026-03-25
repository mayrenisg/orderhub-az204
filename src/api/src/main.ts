import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization',
  });
  const config = new DocumentBuilder()
    .setTitle('OrderHub API')
    .setDescription('API base para la Semana 1 de AZ-204')
    .setVersion('1.0')
    .build();
const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('swagger', app, document);
const port = process.env.PORT || 3000;
await app.listen(port);
}
bootstrap();