'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('vervendors', 'tgl_veriffin', {
      type: Sequelize.DataTypes.DATE
    })
    await queryInterface.addColumn('vervendors', 'tgl_veriftax', {
      type: Sequelize.DataTypes.DATE
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('vervendors', 'tgl_veriffin', {})
    await queryInterface.removeColumn('vervendors', 'tgl_veriftax', {})
  }
}
