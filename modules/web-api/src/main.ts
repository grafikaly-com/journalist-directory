import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { WinstonLoggerService } from './logger/winston/winston-logger.service';

// TODO: to be used later to trigger an https server if required
// import * as fs from 'fs';
// const httpsOptions = {
//   key: fs.readFileSync('./certs/cert-key.pem'),
//   cert: fs.readFileSync('./certs/cert.pem')
// };

// eslint-disable-next-line @typescript-eslint/ban-types
const BigIntPrototype: BigInt & { toJSON?: () => string } = BigInt.prototype;
BigIntPrototype.toJSON = function () {
  return this.toString();
};

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: { origin: process.env.MEDIAMINE_UI_HOSTNAME },
    bufferLogs: true
  });

  app.set('query parser', 'extended');
  app.useLogger(new WinstonLoggerService());

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Mediamine API')
    .setDescription('List of the Web APIs in Mediamine')
    .setVersion('1.0')
    .addTag('mediamine')
    .addBearerAuth()
    .build();
  SwaggerModule.setup('api', app, SwaggerModule.createDocument(app, swaggerConfig));

  await app.listen(parseInt(process.env.MEDIAMINE_API_PORT ?? '3002', 10));
}

console.log('process.env.NODE_ENV: ', process.env.NODE_ENV);

bootstrap();
