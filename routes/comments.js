import buildFormObj from '../lib/formObjectBuilder';

export default (router, { Comment }) => {
  router
    .post('new comment', '/tasks/:id/comments/new', async (ctx) => {
      const { form } = ctx.request.body;
      form.TaskId = Number(ctx.params.id);
      form.UserId = ctx.session.userId;
      const comment = Comment.build(form);
      try {
        await comment.save();
        ctx.flash.set('Comment has been created');
        ctx.redirect(`/tasks/${form.TaskId}`);
      } catch (e) {
        ctx.redirect(`/tasks/${form.TaskId}`, { f: buildFormObj(comment, e) });
      }
    });
};
