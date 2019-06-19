import debug from 'debug';
import url from 'url';
import rollbar from 'rollbar';
import buildFormObj from '../lib/formObjectBuilder';

import { User, Task, Status, Tag } from '../models'; // eslint-disable-line

import { getData, getParams } from '../lib/tools';

const log = debug('application:tasks');
export default (router) => {
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
      // log(ctx);
      // log(ctx.request);
      // log(ctx.response);
      // log(ctx.response);
      if (ctx.state.isSignedIn()) {
        const { query } = url.parse(ctx.request.url, true);
        log(query);
        // console.log(query);
        const where = getParams(query);
        log(where);
        const filteredTasks = await Task.findAll({ where });
        log(filteredTasks);
        const tasks = await Promise.all(filteredTasks.map(async task => getData(task)));
        log(tasks);

        const tags = await Tag.findAll();
        // log(tags);
        const statuses = await Status.findAll();
        // log(statuses);
        const users = await User.findAll();
        // log(users);
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
      if (ctx.state.isSignedIn()) {
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
      } else {
        ctx.flash.set('Please Log In For Access to This page');
        ctx.redirect(router.url('sessions#new'));
      }
    })
    .patch('tasks#update', '/tasks/:id', async (ctx) => {
      if (ctx.state.isSignedIn()) {
        const { statusId, taskId } = ctx.request.body;
        const task = await Task.findByPk(Number(taskId));
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
