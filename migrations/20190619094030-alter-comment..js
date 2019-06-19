module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.addColumn('Comments', 'UserId', Sequelize.INTEGER)
    .then(() => queryInterface.addColumn('Comments', 'TaskId', Sequelize.INTEGER)),
  down: queryInterface => queryInterface.removeColumn('Comments', 'UserId')
    .then(() => queryInterface.removeColumn('Comments', 'TaskId')),
};
