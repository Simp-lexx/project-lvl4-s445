module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('Tag', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER,
    },
    name: {
      type: Sequelize.STRING,
      unique: true,
      validate: {
        notEmpty: true,
      },
    },
  }),
  down: queryInterface => queryInterface.dropTable('Tag'),
};
