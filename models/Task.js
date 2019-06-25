export default (sequelize, DataTypes) => {
  const Task = sequelize.define('Task', {
    name: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: {
          args: true,
          msg: 'Please enter the task name',
        },
      },
    },
    description: {
      type: DataTypes.TEXT,
    },
    StatusId: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    creatorId: {
      type: DataTypes.INTEGER,
      validate: {
        notEmpty: true,
      },
    },
    assignedToId: {
      type: DataTypes.INTEGER,
      validate: {
        notEmpty: {
          args: true,
          msg: 'User must be selected',
        },
      },
    },
  }, {
    getterMethods: {
      statusName: async function statusName() {
        const status = await this.getStatus();
        return status.dataValues.name;
      },
    },
  });
  Task.associate = (models) => {
    Task.belongsTo(models.User, { as: 'creator', foreignKeyConstraint: true, onDelete: 'cascade' });
    Task.belongsTo(models.User, { as: 'assignedTo', foreignKeyConstraint: true, onDelete: 'cascade' });
    Task.belongsTo(models.Status);
    Task.belongsToMany(models.Tag, { through: 'TaskTag' });
    Task.hasMany(models.Comment);
  };
  return Task;
};
