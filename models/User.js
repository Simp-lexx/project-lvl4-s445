import Sequelize from 'sequelize';
import { encrypt } from '../lib/secure';

export default (connect) => {
  connect.define('User', {
    firstName: {
      type: Sequelize.STRING,
      field: 'firstName',
    },
    lastName: {
      type: Sequelize.STRING,
      field: 'lastName',
    },
    email: {
      type: Sequelize.STRING,
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
      type: Sequelize.STRING,
      validate: {
        notEmpty: true,
      },
    },

    password: {
      type: Sequelize.VIRTUAL,
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
  }, {
    getterMethods: {
      fullName() {
        return `${this.firstName} ${this.lastName}`;
      },
    },
    freezeTableName: true,
  });
  // return User;
};
