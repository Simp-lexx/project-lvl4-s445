module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('TasksTag', {
    TaskId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    TagId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
  }),
  down: queryInterface => queryInterface.dropTable('TasksTag'),
};
