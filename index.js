import Koa from 'koa';
import Pug from 'koa-pug';
import Rollbar from 'rollbar';
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

const rollbar = new Rollbar({
  accessToken: process.env.ROLLBAR_TOKEN,
  captureUncaught: true,
  captureUnhandledRejections: true,
});

export default () => {
  const app = new Koa();

  app.use(bodyParser());
  app.use(koaLogger());
  app.use(serve(path.join(__dirname, 'public')));

  app.use(methodoverride((req) => {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
      return req.body._method; // eslint-disable-line
    }
    return '';
  }));

  if (process.env.NODE_ENV !== 'test') {
    koaWebpack({
      config: webpackConfig,
    }).then(m => app.use(m));
  }

  app.keys = ['some secret'];
  app.use(session(app));
  app.use(flash());

  app.use(async (ctx, next) => {
    ctx.state = {
      flash: ctx.flash,
      isSignedIn: () => ctx.session.userId !== undefined,
      signedId: () => ctx.session.userId,
    };
    await next();
  });

  const router = new Router();

  addRoutes(router, container);
  app.use(router.routes());
  app.use(router.allowedMethods());

  app.use(async (ctx) => {
    if (ctx.status !== 404) {
      return;
    }
    ctx.redirect('404');
  });

  const pug = new Pug({
    viewPath: path.join(__dirname, 'views'),
    noCache: process.env.NODE_ENV === 'development',
    debug: true,
    pretty: true,
    compileDebug: true,
    locals: [],
    basedir: path.join(__dirname, 'views'),
    helperPath: [
      { _ },
      { urlFor: (...args) => router.url(...args) },
    ],
  });

  app.use(async (ctx, next) => {
    try {
      await next();
    } catch (e) {
      rollbar.error(e, ctx.request);
    }
  });

  pug.use(app);

  return app;
};
