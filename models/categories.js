'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Categories extends Model {
    static associate(models) {
      Categories.hasMany(models.Articles, {
        foreignKey: 'categoryId',
        as: 'articles',
      });
    }
  }

  Categories.init({
    name: {
      type: DataTypes.STRING,
      unique: true
    }
  }, {
    sequelize,
    modelName: 'Categories',
  });
  return Categories;
};