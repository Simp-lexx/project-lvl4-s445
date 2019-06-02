import url from 'url';
import rollbar from 'rollbar';
import buildFormObj from '../lib/formObjectBuilder';
import { getData, getParams } from '../lib/tools';

export default (router, {
  User, Task, Status, Tag,
}) => {
  router
    .get('tasks#new', '/tasks/new', async (ctx) => {
      const task = Task.build();
      const users = await User.findAll();
      ctx.render('tasks/new', { f: buildFormObj(task), users });
    })
    .get('tasks#list', '/tasks', async (ctx) => {
      console.log(ctx.request.url);
      const { query } = url.parse(ctx.request.url, true);
      console.log(query);
      const where = getParams(query);
      // console.log(where);
      const filteredTasks = await Task.findAll({ where });
      // console.log(filteredTasks);
      const tasks = await Promise.all(filteredTasks.map(async task => getData(task)));
      // console.log(tasks);
      const tags = await Tag.findAll();
      const statuses = await Status.findAll();
      const users = await User.findAll();
      ctx.render('tasks/index', {
        users, tasks, statuses, tags,
      });
    })
    .get('task', '/tasks/:id', async (ctx) => {
      const taskId = Number(ctx.params.id);
      const userId = Number(ctx.session.userId);
      const user = await User.findByPk(userId);
      const taskPromise = await Task.findByPk(taskId);
      const task = await getData(taskPromise);
      const { tags } = task;
      const statuses = await Status.findAll();
      const { comments } = task;
      ctx.render('tasks/task',
        {
          f: buildFormObj(task), user, task, statuses, tags, comments,
        });
    })
    .post('tasks#new', '/tasks/new', async (ctx) => {
      const { request: { body: form } } = ctx;
      console.log({ request: { body: form } });
      const { userId } = ctx.session;
      console.log(userId);
      form.form.creatorId = userId;
      console.log(form.form.creatorId);
      console.log(form.form);
      const users = await User.findAll();
      const tags = form.form.Tags.split(' ');
      const task = await Task.build(form.form);
      try {
        await task.save();
        tags.map(tag => Tag.findOne({ where: { name: tag } })
          .then(async result => (result ? task.addTag(result)
            : task.createTag({ name: tag }))));
        ctx.flash.set('Task Successully Added.');
        ctx.redirect(router.url('tasks#list'));
      } catch (e) {
        rollbar.handleError(e);
        ctx.render('tasks/new', { f: buildFormObj(task, e), users });
      }
    })
    .patch('tasks#update', '/tasks/:id', async (ctx) => {
      const { statusId, taskId } = ctx.request.body;
      const task = await Task.findByPk(Number(taskId));
      task.setStatus(Number(statusId));
      ctx.redirect(`/tasks/${taskId}`);
    })
    .delete('tasks#delete', '/tasks/:id', async (ctx) => {
      const taskId = Number(ctx.params.id);
      Task.destroy({
        where: { id: taskId },
      });
      ctx.flash.set('Task Succesfully Deleted.');
      ctx.redirect(router.url('tasks#list'));
    });
};
