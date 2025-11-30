import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { rainbow } from 'colors';
import * as fs from 'node:fs';

async function bootstrap(): Promise<void> {
  const port = process.env.PORT || 3000;

  let httpsOptions: { key: Buffer; cert: Buffer } | undefined = undefined;
  const httpsEnabled = process.env.HTTPS_ENABLED === 'true';
  const keyPath = process.env.HTTPS_KEY_PATH;
  const certPath = process.env.HTTPS_CERT_PATH;

  if (httpsEnabled && keyPath && certPath) {
    try {
      if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
        httpsOptions = {
          key: fs.readFileSync(keyPath),
          cert: fs.readFileSync(certPath),
        };
        console.info('HTTPS enabled');
      } else {
        console.warn('HTTPS enabled but certificate files not found, falling back to HTTP');
      }
    } catch (error: any) {
      console.error('Error loading HTTPS certificates:', error.message);
      console.warn('Falling back to HTTP');
    }
  }

  const app = await NestFactory.create(AppModule, httpsOptions ? { httpsOptions } : {});

  // CORS configuration
  const corsOrigins = process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'];
  app.enableCors({
    origin: corsOrigins,
    credentials: process.env.CORS_CREDENTIALS === 'true',
  });

  // Swagger documentation (DEV ONLY)
  const isDev = process.env.NODE_ENV === 'development';
  if (isDev) {
    const config = new DocumentBuilder()
      .setTitle('Agroalimentaire API')
      .setDescription('API de gestion agroalimentaire')
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);
  }

  await app.listen(port);

  const protocol = httpsOptions ? 'https' : 'http';
  console.info(rainbow(`Server is now running on ${protocol}://localhost:${port}`));
  if (isDev) {
    console.info(rainbow(`API Documentation: ${protocol}://localhost:${port}/docs`));
  }
}

void bootstrap();
