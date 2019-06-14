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
          msg: 'Entered e-mail does not valid.',
        },
        notEmpty: {
          args: true,
          msg: 'Please enter the email',
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
          msg: 'The minimum password length is 6 characters.',
        },
      },
    },
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
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
