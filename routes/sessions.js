import buildFormObj from '../lib/formObjectBuilder';
import { encrypt } from '../lib/secure';

export default (router, { User }) => {
  router
    .get('sessions#new', '/sessions/new', async (ctx) => {
      const data = {};
      // console.log(data);
      ctx.render('sessions/new', { f: buildFormObj(data) });
    })
    .post('sessions#create', '/sessions', async (ctx) => {
      // console.log(ctx.request);
      const { email, password } = ctx.request.body.form;
      // console.log(email, password);
      const user = await User.findOne({
        where: {
          email,
        },
      });
      // console.log(user);
      if (user && user.passwordDigest === encrypt(password)) {
        ctx.session.userId = user.id;
        // console.log(user.id);
        ctx.flash.set('You Successfully Logged In.');
        ctx.redirect(router.url('tasks#list'));
        return;
      }
      ctx.flash.set('Wrong Email or Password Entered');
      ctx.redirect(router.url('sessions#new'));
    })
    .delete('sessions#destroy', '/sessions', async (ctx) => {
      // console.log(ctx);
      // console.log(ctx.session);
      ctx.session = {};
      ctx.flash.set('You Successfully Log Out');
      ctx.redirect(router.url('root'));
    });
};
