import { NestFactory } from '@nestjs/core';

import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';
import { rainbow } from 'colors';
import * as fs from 'node:fs';

async function bootstrap(): Promise<void> {
  const httpsOptions = {
    key: fs.readFileSync('./certs/key.pem'),
    cert: fs.readFileSync('./certs/cert.pem'),
  };
  const app = await NestFactory.create(AppModule, { httpsOptions });
  const port = process.env.PORT || 3000;

  const config = new DocumentBuilder()
    .setTitle('API')
    .setDescription('Documentation API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(port);

  const protocol = httpsOptions ? 'https' : 'http';
  console.info(rainbow(`Server is now running on ${protocol}://localhost:${port}`));
}

void bootstrap();
