'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('ArticleKeywords', 'keywordsId', {
            type: Sequelize.INTEGER,
            allowNull: false,
            primaryKey: true,
            references: {
                model: 'Keywords',
                key: 'id',
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
            },
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('ArticleKeywords', 'keywordsId');
    },
};