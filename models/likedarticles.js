'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class LikedArticles extends Model {
    static associate(models) {
      LikedArticles.belongsTo(models.Articles, {
        foreignKey: 'articleId',
        as: 'article',
        onDelete: 'CASCADE'
      });
      LikedArticles.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user',
        onDelete: 'CASCADE'
      });
    }
  }
  LikedArticles.init({
    userId: DataTypes.INTEGER,
    articleId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'LikedArticles',
  });
  return LikedArticles;
};