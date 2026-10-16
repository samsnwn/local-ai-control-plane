import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { readFileSync } from 'fs';
import { join } from 'path';
import { createServer } from 'https';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const httpsOptions = {
    key: readFileSync(process.env.NODE_TLS_KEY_PATH ?? '.dev-certs/server.key'),
    cert: readFileSync(
      process.env.NODE_TLS_CERT_PATH ?? '.dev-certs/server.crt',
    ),
    ca: [readFileSync(process.env.NODE_TLS_CA_PATH ?? '.dev-certs/ca.crt')],
    requestUnauthorized: false,
    rejectUnauthorized: false,
  };

  const httpsServer = createServer(
    httpsOptions,
    app.getHttpServer().requestListener,
  );
  await new Promise<void>((resolve) =>
    httpsServer.listen(process.env.PORT ?? 3000, resolve),
  );
}
await bootstrap();
