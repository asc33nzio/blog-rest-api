'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ChangeEmailRequest extends Model {
    static associate(models) {
      ChangeEmailRequest.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user',
      });
    }
  }
  ChangeEmailRequest.init({
    userId: {
      type: DataTypes.INTEGER,
      defaultValue: null
    },
    token: {
      type: DataTypes.STRING,
      defaultValue: null
    },
    newEmail: {
      type: DataTypes.STRING,
      defaultValue: null
    }
  }, {
    sequelize,
    modelName: 'ChangeEmailRequest',
  });
  return ChangeEmailRequest;
};