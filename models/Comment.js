export default (sequelize, DataTypes) => {
  const Comment = sequelize.define('Comment', {
    content: {
      type: DataTypes.TEXT,
      validate: {
        notEmpty: true,
      },
    },
  }, {});
  Comment.associate = (models) => {
    Comment.belongsTo(models.User);
    Comment.belongsTo(models.Task);
  };
  return Comment;
};
