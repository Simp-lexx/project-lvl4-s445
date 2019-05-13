import gulp from 'gulp';
// import repl from 'repl';
import getServer from '.';

gulp.task('default', console.log('Welcome!'));

gulp.task('server', (cb) => {
  getServer.listen(process.env.PORT || 8000, cb);
});
