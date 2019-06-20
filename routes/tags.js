import { getData, checkAuth } from '../lib/tools';
import { Tag } from '../models';

export default (router) => {
  router
    .get('tags#view', '/tags/:id', checkAuth, async (ctx) => {
      const id = Number(ctx.params.id);
      const tag = await Tag.findByPk(id);
      const filteredTasks = await tag.getTasks();
      const tasks = await Promise.all(filteredTasks.map(async task => getData(task)));

      ctx.render('tags/index', { tasks, tag });
    });
};
