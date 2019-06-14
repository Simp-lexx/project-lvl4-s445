export default (sequelize) => {
  const TaskTag = sequelize.define('TaskTag', {
  }, {
    timestamps: false,
  });
  return TaskTag;
};
