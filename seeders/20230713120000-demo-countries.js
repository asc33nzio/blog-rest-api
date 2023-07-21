'use strict';
const { getCountries } = require('node-countries');

module.exports = {
    up: async (queryInterface, Sequelize) => {
        try {
            const countriesList = await getCountries();
            const countriesData = countriesList.map((country) => ({
                country: country.name,
                createdAt: new Date(),
                updatedAt: new Date(),
            }));

            console.log(countriesData);

            await queryInterface.bulkInsert('Countries', countriesData, {});
        } catch (error) {
            console.error('Error seeding countries:', error);
        }
    },

    down: async (queryInterface, Sequelize) => {
        try {
            await queryInterface.bulkDelete('Countries', null, {});
        } catch (error) {
            console.error('Error deleting countries:', error);
        }
    }
};
