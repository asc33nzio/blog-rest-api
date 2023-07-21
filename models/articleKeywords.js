'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class ArticleKeywords extends Model {
        static associate(models) {
            ArticleKeywords.belongsTo(models.Articles, {
                foreignKey: 'articleId',
                as: 'article'
            });
            ArticleKeywords.belongsTo(models.Keywords, {
                foreignKey: 'keywordsId',
                as: 'keyword'
            });
        }
    }

    ArticleKeywords.init(
        {
            articleId: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                allowNull: false,
            },
            keywordsId: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                allowNull: false,
            },
        },
        {
            sequelize,
            modelName: 'ArticleKeywords',
            indexes: [
                {
                    unique: true,
                    fields: ['articleId', 'keywordsId']
                },
            ],
        }
    );

    return ArticleKeywords;
};
