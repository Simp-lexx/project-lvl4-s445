import connect from './database';
import getModels from './models';

export default async () => {
  const models = getModels(connect);

  await models.User.defint({ force: true });
  await models.Status.define({ force: true });
  await models.Task.define({ force: true });
  await models.Tag.define({ force: true });
  await models.TaskTag.define({ force: true });
  await models.Comment.define({ force: true });
  await models.Status.bulkCreate([
    { name: 'New' },
    { name: 'In process' },
    { name: 'Testing' },
    { name: 'Finished' },
  ]);
};
