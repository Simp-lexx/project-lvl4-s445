export default (sequelize, DataTypes) => {
  const Tag = sequelize.define('Tag', {
    name: {
      type: DataTypes.STRING,
      unique: true,
      validate: {
        notEmpty: true,
      },
    },
  }, {
    timestamps: false,
  });
  Tag.associate = (models) => {
    Tag.belongsToMany(models.Task, { through: 'TaskTag' });
  };
  return Tag;
};
