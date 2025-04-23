import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as fs from 'fs';
import * as path from 'path';

async function bootstrap() {
  const httpsOptions = {
    key: fs.readFileSync(path.join(__dirname, '../certificate/key.pem')),
    cert: fs.readFileSync(path.join(__dirname, '../certificate/cert.pem')),
  };

  const app = await NestFactory.create(AppModule, { httpsOptions });

  app.enableCors({
    origin: '*',
  });

  await app.listen(process.env.PORT ?? 3000);
  console.log('HTTPS server running at https://localhost:' + (process.env.PORT ?? 3000));
}
bootstrap();
