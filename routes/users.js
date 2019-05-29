import buildFormObj from '../lib/formObjectBuilder';

export default (router, { User }) => {
  router
    .get('usersList', '/users', async (ctx) => {
      const users = await User.findAll();
      ctx.render('users', { users });
    })
    .get('newUserForm', '/users/new', (ctx) => {
      const user = User.build();
      ctx.render('users/new', { f: buildFormObj(user) });
    })
    .post('newUserAdd', '/users/new', async (ctx) => {
      const { form } = ctx.request.body;
      console.log(form);
      const user = User.build(form);
      console.log(user);
      try {
        await user.save();
        ctx.flash.set('User has been created');
        ctx.redirect(router.url('newSession'));
      } catch (e) {
        ctx.render('users/new', { f: buildFormObj(user, e) });
      }
    })
    .get('userProfile', '/users/:id/profile', async (ctx) => {
      const id = Number(ctx.params.id);
      const user = await User.findById(id);
      ctx.render('users/profile', { user });
    })
    .delete('deleteUser', '/users/:id', async (ctx) => {
      const userId = Number(ctx.params.id);
      User.destroy({
        where: { id: userId },
      });
      ctx.flash.set('You account was been deleted.');
      ctx.session = {};
      ctx.redirect(router.url('root'));
    });
};
