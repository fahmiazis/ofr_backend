'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('klaims', 'people_reject', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('ikks', 'people_reject', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('ops', 'people_reject', {
      type: Sequelize.DataTypes.STRING
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('klaims', 'people_reject', {})
    await queryInterface.removeColumn('ikks', 'people_reject', {})
    await queryInterface.removeColumn('ops', 'people_reject', {})
  }
}
