// import url from 'url';
import { getData, checkAuth } from '../lib/tools';
import { Tag } from '../models';

export default (router) => {
  router
    .get('tags#view', '/tags/:id', checkAuth, async (ctx) => {
      const id = Number(ctx.params.id);
      const tag = await Tag.findByPk(id);
      const filteredTasks = await tag.getTasks();
      const tasksPromise = filteredTasks.map(task => getData(task));
      const tasks = await Promise.all(tasksPromise);
      ctx.render('tags/index', { tasks, tag });
    });
};
