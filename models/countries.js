'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Countries extends Model {
    static associate(models) {
      
    }
  }
  Countries.init({
    country: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Countries',
  });
  return Countries;
};