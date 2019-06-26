import url from 'url';
import rollbar from 'rollbar';
import buildFormObj from '../lib/formObjectBuilder';

import { User, Task, Status, Tag } from '../models'; // eslint-disable-line

import { getData, getParams, checkAuth } from '../lib/tools';

export default (router) => {
  router
    .get('tasks#new', '/tasks/new', checkAuth, async (ctx) => {
      const task = Task.build();
      const users = await User.findAll();
      ctx.render('tasks/new', { f: buildFormObj(task), users });
    })
    .get('tasks#list', '/tasks', checkAuth, async (ctx) => {
      console.log(ctx.request.url);
      console.log(url.parse(ctx.request.url, true));
      const { query } = url.parse(ctx.request.url, true);
      console.log(query);
      // console.log(...query);
      const where = getParams(query);
      console.log(where);
      const filteredTasks = await Task.findAll({ where });
      // const scopes = filteredTasks._modelOptions.scopes; // eslint-disable-line
       // eslint-disable-line
      const tasks = await Promise.all(filteredTasks.map(async task => getData(task)));
      const scopedModel = await Task.scope(query);
      const tagsFromTask = await scopedModel.findAll(where);
      console.log(scopedModel);
      console.log(tagsFromTask);
      // console.log(tasks);// console.log(tasks);
      const tags = await Tag.findAll();
      // console.log(tags);
      const statuses = await Status.findAll();
      const users = await User.findAll();
      ctx.render('tasks/index', {
        users, tasks, statuses, tags,
      });
    })
    .get('tasks#view', '/tasks/:id', checkAuth, async (ctx) => {
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
    .post('tasks#create', '/tasks', checkAuth, async (ctx) => {
      const { request: { body: form } } = ctx;
      const { userId } = ctx.session;
      form.form.creatorId = userId;
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
    .patch('tasks#update', '/tasks/:id', checkAuth, async (ctx) => {
      const { statusId, taskId } = ctx.request.body;
      const task = await Task.findByPk(Number(taskId));
      task.setStatus(Number(statusId));
      ctx.redirect(`/tasks/${taskId}`);
    })
    .delete('tasks#delete', '/tasks/:id', checkAuth, async (ctx) => {
      const taskId = Number(ctx.params.id);
      Task.destroy({
        where: { id: taskId },
      });
      ctx.flash.set('Task Succesfully Deleted.');
      ctx.redirect(router.url('tasks#list'));
    });
};
