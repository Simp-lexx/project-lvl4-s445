export const getData = async (task) => {
  const creator = await task.getCreator();
  const creatorId = creator.id;
  const assignedTo = await task.getAssignedTo();
  const status = await task.statusName;
  const tags = await task.getTags();
  const tagsNames = tags.map(tag => tag.name);
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
    comments,
    createdAt,
  };
  return data;
};

export const getParams = query => Object.keys(query).reduce((acc, key) => {
  if (query[key] !== 'All' && query[key] !== '') {
    return { ...acc, [key]: Number(query[key]) };
  }
  return acc;
}, {});

export const isExist = entity => !(entity === null || entity.createdAt === undefined);

export const checkAuth = async (ctx, next) => {
  if (ctx.state.isSignedIn()) {
    await next();
    return;
  }
  ctx.flash.set('Please Log In For Access to This page');
  ctx.redirect('/sessions/new');
};
