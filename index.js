import Koa from 'koa';
import Pug from 'koa-pug';
import Rollbar from 'rollbar';
import dotenv from 'dotenv';
import Router from 'koa-router';
import serve from 'koa-static';
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
  pretty: true,
  compileDebug: true,
  basedir: path.join(__dirname, 'views'),
});
pug.use(app);

router.get('/', async (ctx) => {
  const data = { title: 'Welcome!', message: 'To the task manager' };
  await ctx.render('index', data);
});

app.use(router.routes());
app.use(serve(path.join(__dirname, 'public')));

/* app.listen(process.env.PORT || 8000, () => {
  console.log('App started');
}); */

export default app;
