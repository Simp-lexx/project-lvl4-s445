import buildFormObj from '../lib/formObjectBuilder';
import { User } from '../models';
import { isExist } from '../lib/tools';

export default (router) => {
  router
    .get('users#list', '/users', async (ctx) => {
      if (!ctx.state.isSignedIn()) {
        ctx.flash.set('Please Log In For Access to This page');
        ctx.redirect(router.url('sessions#new'));
      } else {
        const users = await User.findAll();
        ctx.render('users/index', { users });
      }
    })
    .get('users#new', '/users/new', (ctx) => {
      const user = User.build();
      ctx.render('users/new', { f: buildFormObj(user) });
    })
    .post('users#create', '/users', async (ctx) => {
      const { form } = ctx.request.body;
      console.log(form);
      const user = User.build(form);
      console.log(user);
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
      if (!isExist(user)) {
        ctx.render('errors/index');
      } else if (ctx.state.isSignedIn()) {
        ctx.render('users/profile', { user });
      } else {
        ctx.flash.set('Please Log In For Access to This page');
        ctx.redirect(router.url('sessions#new'));
      }
    })
    .get('users#edit', '/users/:id/edit', async (ctx) => {
      if (ctx.state.isSignedIn()) {
        const { id } = ctx.params;
        if (Number(id) !== ctx.state.signedId()) {
          ctx.flash.set('Profile Edit Does Not Allowed');
          ctx.redirect(router.url('users#profile', id));
        } else {
          const user = await User.findByPk(Number(id));
          ctx.render('users/edit', { f: buildFormObj(user), id });
        }
      } else {
        ctx.flash.set('Please Log In For Access to This page');
        ctx.redirect(router.url('sessions#new'));
      }
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
      if (ctx.state.isSignedIn()) {
        const userId = Number(ctx.params.id);
        if (ctx.state.isSignedIn() && ctx.state.signedId() === userId) {
          User.destroy({
            where: { userId },
          });
          ctx.flash.set('You account was been deleted.');
          ctx.session = {};
          ctx.redirect(router.url('root'));
        } else {
          ctx.flash.set('Profile Delete Does Not Allowed');
          ctx.redirect(router.url('users#profile', userId));
        }
      } else {
        ctx.render('errors/index');
        ctx.status = 404;
      }
    });
};
