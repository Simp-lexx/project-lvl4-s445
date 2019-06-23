import { encrypt } from '../lib/secure';

export default (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    email: {
      type: DataTypes.STRING,
      unique: {
        args: true,
        msg: 'This e-mail already in use.',
      },
      validate: {
        isEmail: {
          args: true,
          msg: 'Entered e-mail does not valid',
        },
        notEmpty: {
          args: true,
          msg: 'Empty e-mail does not allowed',
        },
      },
    },
    passwordDigest: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: true,
      },
    },
    password: {
      type: DataTypes.VIRTUAL,
      set(value) {
        this.setDataValue('passwordDigest', encrypt(value));
        this.setDataValue('password', value);
        return value;
      },
      validate: {
        len: {
          args: [6, +Infinity],
          msg: 'The minimum password length is 6 characters',
        },
      },
    },
    firstName: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: {
          args: true,
          msg: 'Empty first name does not allowed',
        },
      },
    },
    lastName: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: {
          args: true,
          msg: 'Empty last name does not allowed',
        },
      },
    },
  }, {
    getterMethods: {
      fullName() {
        return `${this.firstName} ${this.lastName}`;
      },
    },
  });
  User.associate = (models) => {
    User.hasMany(models.Task, { foreignKey: 'creatorId', as: 'creator' });
    User.hasMany(models.Task, { foreignKey: 'assignedToId', as: 'assignedTo' });
    User.hasMany(models.Comment);
  };
  return User;
};
