// CloudBase 入口 - 放在项目根目录，从根目录部署
const NestFactory = require('./server/node_modules/@nestjs/core').NestFactory;
const { ValidationPipe } = require('./server/node_modules/@nestjs/common');
const { ResponseInterceptor } = require('./server/dist/common/interceptors/response.interceptor');
const { AllExceptionsFilter } = require('./server/dist/common/filters/http-exception.filter');

let cachedApp = null;

async function getApp() {
  if (cachedApp) return cachedApp;
  cachedApp = await NestFactory.create(require('./server/dist/app.module').AppModule, {
    logger: ['error', 'warn'],
  });
  const prefix = process.env.APP_PREFIX || '/api';
  cachedApp.setGlobalPrefix(prefix);
  cachedApp.enableCors({
    origin: true,
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Authorization',
  });
  cachedApp.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: false,
    transform: true,
  }));
  cachedApp.useGlobalInterceptors(new ResponseInterceptor());
  cachedApp.useGlobalFilters(new AllExceptionsFilter());
  return cachedApp;
}

exports.main = async (event, context) => {
  try {
    const app = await getApp();
    const adapter = app.getHttpAdapter();
    const response = await adapter.handleRequest(
      { ...event, method: event.httpMethod },
      { end: (chunk) => ({ done: true, value: chunk }) },
      null
    );
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
      },
      body: JSON.stringify(response || { success: true }),
    };
  } catch (error) {
    return {
      statusCode: error.statusCode || 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ statusCode: error.statusCode || 500, message: error.message || 'Internal server error' }),
    };
  }
};