import getUser from './User';
import getStatus from './Status';
import getTask from './Task';
import getTag from './Tag';
import getTaskTag from './TaskTag';
import getComment from './Comment';

export default (connect) => {
  const models = {
    User: getUser(connect),
    Status: getStatus(connect),
    Task: getTask(connect),
    Tag: getTag(connect),
    TaskTag: getTaskTag(connect),
    Comment: getComment(connect),
  };
  console.log(models.User);

  models.User.hasMany(models.Task, { foreignKey: 'creatorId', as: 'creator' });
  models.User.hasMany(models.Task, { foreignKey: 'assignedToId', as: 'assignedTo' });
  models.User.hasMany(models.Comment);
  models.Task.belongsTo(models.User, { as: 'assignedTo' });
  models.Task.belongsTo(models.User, { as: 'creator' });
  models.Task.belongsTo(models.Status);
  models.Task.belongsToMany(models.Tag, { through: 'TaskTag' });
  models.Task.hasMany(models.Comment);
  models.Status.hasMany(models.Task);
  models.Tag.belongsToMany(models.Task, { through: 'TaskTag' });
  models.Comment.belongsTo(models.User);
  models.Comment.belongsTo(models.Task);
  return models;
};
