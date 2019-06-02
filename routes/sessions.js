import buildFormObj from '../lib/formObjectBuilder';
import { encrypt } from '../lib/secure';

export default (router, { User }) => {
  router
    .get('sessions#new', '/sessions/new', async (ctx) => {
      const data = {};
      ctx.render('sessions/new', { f: buildFormObj(data) });
    })
    .post('sessions#create', '/sessions', async (ctx) => {
      const { email, password } = ctx.request.body.form;
      const user = await User.findOne({
        where: {
          email,
        },
      });
      if (user && user.passwordDigest === encrypt(password)) {
        ctx.session.userId = user.id;
        ctx.flash.set('You Successfully Logged In.');
        ctx.redirect(router.url('tasks#list'));
        return;
      }
      ctx.flash.set('Wrong Email or Password Entered');
      ctx.render('sessions/new', { f: buildFormObj({ email }) });
    })
    .delete('sessions#destroy', '/sessions', async (ctx) => {
      ctx.session = {};
      ctx.redirect(router.url('root'));
    });
};
