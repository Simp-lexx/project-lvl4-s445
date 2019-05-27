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
import session from 'koa-generic-session';
import flash from 'koa-flash-simple';
import path from 'path';
import _ from 'lodash';

import addRoutes from './routes';
import webpackConfig from './webpack.config';
import container from './container';

export default () => {
  const app = new Koa();
  dotenv.config();
  const rollbar = new Rollbar(process.env.READ_RB_T);

  app.use(bodyParser());
  app.use(koaLogger());
  app.use(methodoverride((req) => {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
      return req.body._method; // eslint-disable-line
    }
    return '';
  }));
  app.use(serve(path.join(__dirname, 'public')));

  if (process.env.NODE_ENV !== 'production') {
    koaWebpack({
      config: webpackConfig,
    }).then(m => app.use(m));
  }

  app.keys = ['some secret'];
  app.use(session(app));
  app.use(flash);

  app.use(async (ctx, next) => {
    try {
      ctx.state = {
        flash: ctx.flash,
        isSignedIn: () => ctx.session.userId !== undefined,
        signedId: () => ctx.session.userId,
      };
      await next();
    } catch (e) {
      console.error(e, ctx.request);
      rollbar.error(e, ctx.request); // rollbar.error
    }
  });

  const router = new Router();
  const isLoggedIn = async (ctx, next) => {
    if (ctx.session.userId) {
      await next();
      return;
    }
    ctx.flash.set('Log In or Sign Up please.');
    ctx.redirect(router.url('newSession'));
  };
  router.use('/tasks', isLoggedIn());

  addRoutes(router, container);
  app.use(router.allowedMethods());
  app.use(router.routes());

  app.use(async (ctx) => {
    if (ctx.status !== 404) {
      return;
    }
    ctx.redirect('/404');
  });

  const pug = new Pug({
    viewPath: path.join(__dirname, 'views'),
    basedir: path.join(__dirname, 'views'),
    noCache: process.env.NODE_ENV === 'development',
    debug: true,
    pretty: true,
    compileDebug: true,
    locals: [],
    helperPath: [
      { _ },
      { urlFor: (...args) => router.url(...args) },
    ],
  });
  pug.use(app);

  return app;
};
