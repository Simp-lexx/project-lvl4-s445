import url from 'url';
import rollbar from 'rollbar';
import buildFormObj from '../lib/formObjectBuilder';
import { getData, getParams } from '../lib/tools';

export default (router, {
  User, Task, Status, Tag,
}) => {
  router
    .get('newTaskForm', '/tasks/new', async (ctx) => {
      const task = Task.build();
      const users = await User.findAll();
      ctx.render('tasks/new', { f: buildFormObj(task), users });
    })
    .get('tasksList', '/tasks', async (ctx) => {
      const { query } = url.parse(ctx.request.url, true);
      const where = getParams(query);
      const filteredTasks = await Task.findAll({ where });
      const tasks = await Promise.all(filteredTasks.map(async task => getData(task)));
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
      const user = await User.findById(userId);
      const taskPromise = await Task.findById(taskId);
      const task = await getData(taskPromise);
      const { tags } = task;
      const statuses = await Status.findAll();
      const { comments } = task;
      ctx.render('tasks/task',
        {
          f: buildFormObj(task), user, task, statuses, tags, comments,
        });
    })
    .post('addNewTask', '/tasks/new', async (ctx) => {
      const { form } = ctx.request.body;
      form.creatorId = ctx.session.userId;
      const users = await User.findAll();
      const tags = form.Tags.split(' ');
      const task = Task.build(form);
      try {
        await task.save();
        tags.map(tag => Tag.findOne({ where: { name: tag } })
          .then(async result => (result ? task.addTag(result)
            : task.createTag({ name: tag }))));
        ctx.flash.set('Task Successully Added.');
        ctx.redirect(router.url('tasksList'));
      } catch (e) {
        rollbar.handleError(e);
        ctx.render('tasks/new', { f: buildFormObj(task, e), users });
      }
    })
    .patch('updateTask', '/tasks/:id', async (ctx) => {
      const { statusId, taskId } = ctx.request.body;
      const task = await Task.findById(Number(taskId));
      task.setStatus(Number(statusId));
      ctx.redirect(`/tasks/${taskId}`);
    })
    .delete('deleteTask', '/tasks/:id', async (ctx) => {
      const taskId = Number(ctx.params.id);
      Task.destroy({
        where: { id: taskId },
      });
      ctx.flash.set('Task Succesfully Deleted.');
      ctx.redirect(router.url('tasksList'));
    });
};
