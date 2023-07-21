'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Articles extends Model {
    static associate(models) {
      Articles.belongsTo(models.Categories, {
        foreignKey: 'categoryId',
        as: 'articleCategory'
      });
      Articles.belongsTo(models.User, {
        foreignKey: 'authorId',
        as: 'articleAuthor',
        targetKey: 'id'
      });
      Articles.belongsToMany(models.User, {
        through: models.LikedArticles,
        foreignKey: 'articleId',
        as: 'likedBy'
      });
      Articles.belongsToMany(models.Keywords, {
        through: 'ArticleKeywords',
        foreignKey: 'articleId',
        otherKey: 'keywordsId',
        as: 'keywords_list'
      });
    }
  }

  Articles.init(
    {
      title: {
        type: DataTypes.STRING,
        allowNull: false
      },
      author: {
        type: DataTypes.STRING,
        allowNull: false
      },
      publish: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false
      },
      imgURL: {
        type: DataTypes.STRING,
        allowNull: false
      },
      category: {
        type: DataTypes.STRING,
        allowNull: false
      },
      content: {
        type: DataTypes.STRING(500),
        allowNull: false
      },
      videoURL: {
        type: DataTypes.STRING,
        allowNull: true
      },
      country: {
        type: DataTypes.STRING,
        allowNull: false
      },
      authorId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'authorId'
      },
      likeCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      users_that_liked: {
        type: DataTypes.TEXT,
        defaultValue: null,
        get() {
          const usersLiked = this.getDataValue('users_that_liked');
          return usersLiked ? JSON.parse(usersLiked) : [];
        },
        set(value) {
          this.setDataValue('users_that_liked', JSON.stringify(value));
        },
        keywords: {
          type: DataTypes.TEXT,
          allowNull: true,
        }
      },
      keywords: {
        type: DataTypes.TEXT,
        allowNull: true,
        get() {
          return this.getDataValue('keywords') ? this.getDataValue('keywords').split(',') : [];
        },
        set(value) {
          if (Array.isArray(value)) {
            this.setDataValue('keywords', value.join(','));
          } else {
            this.setDataValue('keywords', value);
          }
        }
      }
    },
    {
      sequelize,
      modelName: 'Articles'
    }
  );

  Articles.afterCreate(async (article) => {
    const keywordsList = await article.getKeywords_list();
    const keywordNames = keywordsList.map(keyword => keyword.name);
  
    await article.setKeywords_list(keywordsList);
    await article.update({ keywords: keywordNames.join(', ') });
  });

  Articles.prototype.getKeywords_list = function () {
    const keywordsList = this.getDataValue('keywords_list');
    return keywordsList ? keywordsList : [];
  };

  return Articles;
};