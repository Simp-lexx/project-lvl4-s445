import Koa from 'koa';
import Pug from 'koa-pug';
import Rollbar from 'rollbar';
import dotenv from 'dotenv';
import Router from 'koa-router';
import serve from 'koa-static';
import bodyParser from 'koa-bodyparser';
import koaLogger from 'koa-logger';
import methodoverride from 'koa-methodoverride';
// import webpack from 'koa-webpack';
import path from 'path';
// import getWebpackConfig from './webpack.config';

export default () => {
  dotenv.config();

  const app = new Koa();
  app.use(bodyParser());
  app.use(koaLogger());
  app.use(methodoverride());
  app.use(serve(path.join(__dirname, 'views')));

  app.use(async (ctx, next) => {
    try {
      await next();
    } catch (e) {
      console.error(e, ctx.request);
    }
  });

  const router = new Router();

  app.use(router.routes());
  app.use(router.allowedMethods());

  router.get('/', (ctx) => {
    // const data = { title: 'TM', message: 'Welcome\n\n to the Task manager' };
    ctx.render('welcome/index');
  });
  const rollbar = new Rollbar({
    accessToken: process.env.READ_RB_T,
    captureUncaught: true,
    captureUnhandledRejections: true,
  });

  rollbar.log('Hello world!');

  const pug = new Pug({
    viewPath: path.join(__dirname, 'views'),
    debug: true,
    pretty: true,
    compileDebug: true,
    basedir: path.join(__dirname, 'views'),
    app,
  });
  pug.use(app);

  // rollbar.init();
  app.use(rollbar.errorHandler(process.env.READ_RB_T));
  return app;
};
