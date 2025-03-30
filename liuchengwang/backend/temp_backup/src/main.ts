import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 全局前缀
  app.setGlobalPrefix('api');

  // 全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // 启用CORS
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // 移除导致错误的路由打印代码
  /*
  // 打印所有注册的路由
  const server = app.getHttpServer();
  const router = server._events.request._router;
  console.log('注册的路由:');
  router.stack.forEach((layer) => {
    if (layer.route) {
      const path = layer.route?.path;
      const method = layer.route?.stack[0].method;
      console.log(`${method.toUpperCase()} /api${path}`);
    }
  });
  */

  // 启动应用
  await app.listen(3000);
  console.log(`应用已启动: http://localhost:3000/api`);
}
bootstrap();