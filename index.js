import Koa from 'koa';
import Pug from 'koa-pug';
import Rollbar from 'rollbar';
import dotenv from 'dotenv';
import Router from 'koa-router';
import serve from 'koa-static';
import bodyParser from 'koa-bodyparser';
import koaLogger from 'koa-logger';
import methodoverride from 'koa-methodoverride';
import koaWebpack from 'koa-webpack';
import path from 'path';

import addRoutes from './routes';
import webpackConfig from './webpack.config';
import container from './container';

export default () => {
  dotenv.config();

  const app = new Koa();

  app.use(bodyParser());
  app.use(koaLogger());
  app.use(methodoverride());
  app.use(serve(path.join(__dirname, 'public')));

  if (process.env.NODE_ENV !== 'production') {
    koaWebpack({
      config: webpackConfig,
    }).then(m => app.use(m));
  }

  const rollbar = new Rollbar(process.env.READ_RB_T);

  app.use(async (ctx, next) => {
    try {
      await next();
    } catch (e) {
      console.error(e, ctx.request);
      rollbar.error(e, ctx.request); // rollbar.error
    }
  });

  const router = new Router();
  addRoutes(router, container);
  app.use(router.allowedMethods());
  app.use(router.routes());

  const pug = new Pug({
    viewPath: path.join(__dirname, 'views'),
    noCache: process.env.NODE_ENV === 'development',
    debug: true,
    pretty: true,
    compileDebug: true,
    locals: [],
    basedir: path.join(__dirname, 'views'),
  });
  pug.use(app);
  return app;
};
