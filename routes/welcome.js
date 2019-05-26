export default (router) => {
  router.get('/', (ctx) => {
    ctx.render('welcome/index');
  });
};
