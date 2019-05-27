import Sequelize from 'sequelize';

export default (connect) => {
  connect.define('Tag', {
    name: {
      type: Sequelize.STRING,
      unique: true,
      validate: {
        notEmpty: true,
      },
    },
  }, {
    freezeTableName: true,
    timestamps: false,
  });
  // return Tag;
};
