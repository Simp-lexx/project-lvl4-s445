import { encrypt } from '../lib/secure';

export default (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    firstName: {
      type: DataTypes.STRING,
      field: 'firstName',
    },
    lastName: {
      type: DataTypes.STRING,
      field: 'lastName',
    },
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
  },

  {
    getterMethods: {
      fullName() {
        return `${this.firstName} ${this.lastName}`;
      },
    },
  });

  return User;
};
