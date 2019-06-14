export default (sequelize, DataTypes) => {
  const Status = sequelize.define('Status', {
    name: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: true,
      },
    },
  }, {
    timestamps: false,
  });
  Status.associate = (models) => {
    Status.hasMany(models.Task);
  };
  return Status;
};
