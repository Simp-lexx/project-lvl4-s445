export default (sequelize, DataTypes) => {
  const Task = sequelize.define('Task', {
    name: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: true,
      },
    },
    description: DataTypes.TEXT,
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
      allowNull: false,
      validate: {
        notEmpty: true,
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
    Task.belongsTo(models.User, { as: 'assignedTo' });
    Task.belongsTo(models.User, { as: 'creator' });
    Task.belongsTo(models.Status);
    Task.belongsToMany(models.Tag, { through: 'TaskTag' });
    Task.hasMany(models.Comment);
  };
  return Task;
};
