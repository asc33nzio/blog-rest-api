'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Keywords extends Model {
    static associate(models) {
      Keywords.belongsToMany(models.Articles, {
        through: 'ArticleKeywords',
        foreignKey: 'keywordsId',
      });
    }
  }

  Keywords.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
    },
    {
      sequelize,
      modelName: 'Keywords',
    }
  );

  return Keywords;
};