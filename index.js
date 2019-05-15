import Koa from 'koa';
import Pug from 'koa-pug';
import Rollbar from 'rollbar';
import dotenv from 'dotenv';
import Router from 'koa-router';
import serve from 'koa-static';
import path from 'path';

export default () => {
  dotenv.config();
  const app = new Koa();
  const router = new Router();

  const rollbar = new Rollbar({
    accessToken: process.env.READ_RB_T,
    captureUncaught: true,
    captureUnhandledRejections: true,
  });

  rollbar.log('Hello world!');

  app.use(router.routes());

  app.use(serve(path.join(__dirname, 'public')));

  app.use(async (ctx) => {
    ctx.body = 'welcome';
  });

  router.get('/', (ctx) => {
    const data = { title: 'Welcome!', message: 'To the task manager' };
    ctx.render('index', data);
  });

  const pug = new Pug({
    viewPath: path.join(__dirname, 'views'),
    debug: true,
    pretty: true,
    compileDebug: true,
    basedir: path.join(__dirname, 'views'),
  });
  pug.use(app);

  rollbar.init();
  rollbar.errorHandler();
  return app;
};
