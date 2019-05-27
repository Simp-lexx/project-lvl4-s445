import Sequelize from 'sequelize';

export default (connect) => {
  connect.define('Task', {
    name: {
      type: Sequelize.STRING,
      validate: {
        notEmpty: true,
      },
    },
    description: {
      type: Sequelize.TEXT,
    },

    StatusId: {
      type: Sequelize.INTEGER,
      defaultValue: 1,
    },
    creatorId: {
      type: Sequelize.INTEGER,
      validate: {
        notEmpty: true,
      },
    },

    assignedToId: {
      type: Sequelize.INTEGER,
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
    freezeTableName: true,
  });
  // return Task;
};
