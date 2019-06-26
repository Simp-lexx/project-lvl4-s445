import {
  User, Task, Tag, TaskTag, Status, Comment,
} from './models';

export default async () => {
  await Comment.drop();
  await TaskTag.drop();
  await Tag.drop();
  await Task.drop();
  await Status.drop();
  await User.drop();

  await User.sync({ force: true });
  await Status.sync({ force: true });
  await Task.sync({ force: true });
  await Tag.sync({ force: true });
  await TaskTag.sync({ force: true });
  await Comment.sync({ force: true });
  await Status.bulkCreate([
    { name: 'New' },
    { name: 'In process' },
    { name: 'Testing' },
    { name: 'Finished' },
  ]);
};
