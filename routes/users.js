import buildFormObj from '../lib/formObjectBuilder';
import { User } from '../models';
import { isExist, checkAuth } from '../lib/tools';

export default (router) => {
  router
    .get('users#list', '/users', checkAuth, async (ctx) => {
      const users = await User.findAll();
      ctx.render('users/index', { users });
    })
    .get('users#new', '/users/new', (ctx) => {
      const user = User.build();
      ctx.render('users/new', { f: buildFormObj(user) });
    })
    .post('users#create', '/users', async (ctx) => {
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
    .get('users#show', '/users/:id', checkAuth, async (ctx) => {
      const id = Number(ctx.params.id);
      const user = await User.findByPk(id);
      if (!isExist(user)) {
        ctx.render('errors/index');
      } else ctx.render('users/profile', { user });
    })
    .get('users#edit', '/users/:id/edit', checkAuth, async (ctx) => {
      const id = Number(ctx.params.id);
      if (id !== ctx.state.signedId()) {
        ctx.flash.set('Profile Edit Does Not Allowed');
        ctx.redirect(router.url('users#show', id));
      } else {
        const user = await User.findByPk(Number(id));
        ctx.render('users/edit', { f: buildFormObj(user), id });
      }
    })
    .patch('users#update', '/users/:id', async (ctx) => {
      const id = Number(ctx.params.id);
      const { form } = ctx.request.body;
      const user = await User.findByPk(id);
      try {
        await user.update(form);
        ctx.flash.set('User Profile Has Been Updated');
        ctx.redirect(router.url('users#show', id));
      } catch (e) {
        ctx.render('users/edit', { f: buildFormObj(user, e), id });
      }
    })
    .delete('users#delete', '/users/:id', checkAuth, async (ctx) => {
      const id = Number(ctx.params.id);
      if (ctx.state.signedId() === id) {
        User.destroy({
          where: { id },
        });
        ctx.session = {};
        ctx.flash.set('You Account Was Been Deleted.');
        ctx.redirect(router.url('root'));
      }
    });
};
