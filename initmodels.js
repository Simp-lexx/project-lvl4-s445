import connect from './database';
import getModels from './models';

export default async () => {
  const models = getModels(connect);

  await models.User.sync({ force: true });
  await models.Status.sync({ force: true });
  await models.Task.sync({ force: true });
  await models.Tag.sync({ force: true });
  await models.TaskTag.sync({ force: true });
  await models.Comment.sync({ force: true });
  await models.Status.bulkCreate([
    { name: 'New' },
    { name: 'In process' },
    { name: 'Testing' },
    { name: 'Finished' },
  ]);
};
