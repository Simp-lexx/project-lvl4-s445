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

/* const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');

const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';

// eslint-disable-next-line import/no-dynamic-require
const config = require(`${__dirname}/../config/config.json`)[env];
const db = {};

let sequelize;

if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable]);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

fs
  .readdirSync(__dirname)
  .filter(file => (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js'))
  .forEach((file) => {
    const model = sequelize.import(path.join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
 */
