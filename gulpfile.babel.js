import gulp from 'gulp';
// import repl from 'repl';
import getServer from '.';

gulp.task('default', console.log('Welcome!'));

gulp.task('server', (cb) => {
  getServer().listen((process.env.PORT || 3000), () => {
    console.log(`App started on port: ${process.env.PORT}`);
  }, cb);
});
