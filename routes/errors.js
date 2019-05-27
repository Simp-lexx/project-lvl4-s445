export default (router) => {
  router.get('/404', (ctx) => {
    ctx.status = 404;
    ctx.render('errors/index');
  });
};
