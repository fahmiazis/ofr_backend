'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('klaims', 'no_surkom', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('klaims', 'nama_program', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('klaims', 'dn_area', {
      type: Sequelize.DataTypes.STRING
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('klaims', 'no_surkom', {})
    await queryInterface.removeColumn('klaims', 'nama_program', {})
    await queryInterface.removeColumn('klaims', 'dn_area', {})
  }
}
