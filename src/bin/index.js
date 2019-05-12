import Koa from 'koa';
import Pug from 'koa-pug';
import Rollbar from 'rollbar';
import dotenv from 'dotenv';
import Router from 'koa-router';
import path from 'path';

dotenv.config();

const app = new Koa();
const rollBar = new Rollbar(process.env.READ_RB_T);
const router = new Router();

app.use(async (ctx, next) => {
  try {
    await next();
  } catch (e) {
    rollBar.error(e, ctx.request);
  }
});

const pug = new Pug({
  viewPath: path.join(__dirname, 'views'),
  debug: true,
  pretty: false,
  compileDebug: false,
  basedir: path.join(__dirname, 'views'),
});
pug.use(app);

router.get('/', async (ctx) => {
  const data = { title: 'Welcome!', message: 'To the task manager' };
  await ctx.render('index', data);
});

app.use(router.routes());

export default app;
