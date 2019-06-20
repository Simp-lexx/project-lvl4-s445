import buildFormObj from '../lib/formObjectBuilder';
import { Comment } from '../models';
import { checkAuth } from '../lib/tools';

export default (router) => {
  router
    .post('comments#new', '/tasks/:id/comments/new', checkAuth, async (ctx) => {
      const { form } = ctx.request.body;
      form.TaskId = Number(ctx.params.id);
      form.UserId = ctx.session.userId;
      const comment = Comment.build(form);
      try {
        await comment.save();
        ctx.flash.set('Comment Successfully Added.');
        ctx.redirect(`/tasks/${form.TaskId}`);
      } catch (e) {
        ctx.redirect(`/tasks/${form.TaskId}`, { f: buildFormObj(comment, e) });
      }
    });
};
