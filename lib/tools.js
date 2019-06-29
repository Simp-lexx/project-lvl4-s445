export const getData = async (task) => {
  const creator = await task.getCreator();
  const creatorId = creator.id;
  const assignedTo = await task.getAssignedTo();
  const status = await task.statusName;
  const tags = await task.getTags();
  const tagsNames = tags.map(tag => tag.name);
  const tagsIds = tags.map(tag => tag.id);
  const { createdAt } = task;
  const comments = await task.getComments({
    order: [
      ['createdAt', 'DESC'],
    ],
  });

  const data = {
    id: task.dataValues.id,
    name: task.dataValues.name,
    description: task.dataValues.description,
    creator: creator.fullName,
    assignedTo: assignedTo.fullName,
    creatorId,
    status,
    tags,
    tagsNames,
    tagsIds,
    comments,
    createdAt,
  };
  return data;
};

const getParams = query => Object.keys(query).reduce((acc, key) => {
  if (query[key].split(' ')[0] !== 'All' && query[key] !== '') {
    if (key !== 'tagId') {
      return { where: { ...acc.where, [key]: Number(query[key]) }, tag: { ...acc.tag } };
    }
    return { where: { ...acc.where }, tag: { [key]: Number(query[key]) } };
  }
  return acc;
}, { where: {}, tag: {} });

const filterByTag = (tasks, tagId) => tasks.filter(task => task.tagsIds.indexOf(tagId) !== -1);

export const filterTasks = async (Task, query = {}) => {
  const { where, tag } = getParams(query);
  const filteredTasks = await Task.findAll({ where });
  const tasksPromise = filteredTasks.map(task => getData(task));
  const tasks = await Promise.all(tasksPromise);
  return Object.keys(tag).length === 0 ? tasks
    : filterByTag(tasks, tag.tagId);
};

export const isExist = entity => !(entity === null || entity.createdAt === undefined);

export const checkAuth = async (ctx, next) => {
  if (ctx.state.isSignedIn()) {
    await next();
    return;
  }
  ctx.flash.set('Please Log In For Access to This page');
  ctx.redirect('/sessions/new');
};
