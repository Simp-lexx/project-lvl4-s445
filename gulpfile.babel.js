import gulp from 'gulp';
import repl from 'repl';
import gutil from 'gulp-util';
import container from './container';
import getServer from '.';
import init from './initmodels';

gulp.task('console', () => {
  gutil.log = gutil.noop;
  const replServer = repl.start({
    prompt: 'Application console > ',
  });

  Object.keys(container).forEach((key) => {
    replServer.context[key] = container[key];
  });
});

gulp.task('server', (cb) => {
  getServer().listen((process.env.PORT || 3000), () => {
    console.log(`App started on port: ${process.env.PORT}`);
  }, cb);
});

gulp.task('init', async () => {
  await init();
  console.log('db was created');
});
