import url from 'url';
import rollbar from 'rollbar';
import buildFormObj from '../lib/formObjectBuilder';
import { getData, getParams } from '../lib/tools';

export default (router, {
  User, Task, Status, Tag,
}) => {
  router
    .get('tasks#new', '/tasks/new', async (ctx) => {
      if (ctx.state.isSignedIn()) {
        const task = Task.build();
        const users = await User.findAll();
        ctx.render('tasks/new', { f: buildFormObj(task), users });
      } else {
        ctx.flash.set('Please Log In For Access to This page');
        ctx.redirect(router.url('sessions#new'));
      }
    })
    .get('tasks#list', '/tasks', async (ctx) => {
      if (ctx.state.isSignedIn()) {
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
      } else {
        ctx.flash.set('Please Log In For Access to This page');
        ctx.redirect(router.url('sessions#new'));
      }
    })
    .get('tasks#view', '/tasks/:id', async (ctx) => {
      if (ctx.state.isSignedIn()) {
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
      } else {
        ctx.flash.set('Please Log In For Access to This page');
        ctx.redirect(router.url('sessions#new'));
      }
    })
    .post('tasks#create', '/tasks', async (ctx) => {
      // console.log(ctx);
      // console.log(ctx.session);
      if (ctx.state.isSignedIn()) {
        const { request: { body: form } } = ctx;
        // console.log(form);
        const { userId } = ctx.session;
        // console.log(userId);
        form.form.creatorId = userId;
        // console.log(form.form.creatorId);
        // console.log(form.form);
        const users = await User.findAll();
        // console.log(users);
        // console.log(form.form.Tags);
        const tags = form.form.Tags.split(' ');
        // console.log(tags);
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
      } else {
        ctx.flash.set('Please Log In For Access to This page');
        ctx.redirect(router.url('sessions#new'));
      }
    })
    .patch('tasks#update', '/tasks/:id', async (ctx) => {
      // console.log(ctx.request);
      // console.log(ctx.request.body);
      if (ctx.state.isSignedIn()) {
        const { statusId, taskId } = ctx.request.body;
        // console.log(statusId, taskId);
        const task = await Task.findByPk(Number(taskId));
        // console.log(task);
        task.setStatus(Number(statusId));
        ctx.redirect(`/tasks/${taskId}`);
      } else {
        ctx.flash.set('Please Log In For Access to This page');
        ctx.redirect(router.url('sessions#new'));
      }
    })
    .delete('tasks#delete', '/tasks/:id', async (ctx) => {
      if (ctx.state.isSignedIn()) {
        const taskId = Number(ctx.params.id);
        Task.destroy({
          where: { id: taskId },
        });
        ctx.flash.set('Task Succesfully Deleted.');
        ctx.redirect(router.url('tasks#list'));
      } else {
        ctx.flash.set('Please Log In For Access to This page');
        ctx.redirect(router.url('sessions#new'));
      }
    });
};
