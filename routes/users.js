import buildFormObj from '../lib/formObjectBuilder';

export default (router, { User }) => {
  router
    .get('users#list', '/users', async (ctx) => {
      const users = await User.findAll();
      ctx.render('users', { users });
    })
    .get('users#new', '/users/new', (ctx) => {
      const user = User.build();
      ctx.render('users/new', { f: buildFormObj(user) });
    })
    .post('users#create', '/users/new', async (ctx) => {
      const { form } = ctx.request.body;
      const user = User.build(form);
      try {
        await user.save();
        ctx.flash.set('User has been created');
        ctx.redirect(router.url('sessions#new'));
      } catch (e) {
        ctx.render('users/new', { f: buildFormObj(user, e) });
      }
    })
    .get('users#profile', '/users/:id/profile', async (ctx) => {
      const id = Number(ctx.params.id);
      const user = await User.findByPk(id);
      // console.log(user);
      ctx.render('users/profile', { user });
    })
    .get('users#edit', '/users/:id/edit', async (ctx) => {
      const { id } = ctx.params;
      // console.log(id);
      const user = await User.findByPk(Number(id));
      // console.log(user);
      ctx.render('users/edit', { f: buildFormObj(user), id });
    })
    .patch('users#update', '/users/:id', async (ctx) => {
      const { id } = ctx.params;
      const { form } = ctx.request.body;
      const user = await User.findByPk(id);
      try {
        await user.update(form);
        ctx.flash.set('User Profile Has Been Updated');
        ctx.redirect(router.url('users#profile', id));
      } catch (e) {
        ctx.render('users/edit', { f: buildFormObj(user, e), id });
      }
    })
    .delete('users#delete', '/users/:id', async (ctx) => {
      const userId = Number(ctx.params.id);
      User.destroy({
        where: { id: userId },
      });
      ctx.flash.set('You account was been deleted.');
      ctx.session = {};
      ctx.redirect(router.url('root'));
    });
};
