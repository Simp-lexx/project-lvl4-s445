import { getData } from '../lib/tools';

export default (router, { Tag }) => {
  router
    .get('tag', '/tags/:id', async (ctx) => {
      const id = Number(ctx.params.id);
      const tag = await Tag.findByPk(id);
      const filteredTasks = await tag.getTasks();
      const tasks = await Promise.all(filteredTasks.map(async task => getData(task)));

      ctx.render('tags/index', { tasks, tag });
    });
};
