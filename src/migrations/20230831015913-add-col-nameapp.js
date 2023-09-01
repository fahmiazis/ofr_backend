'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('nameapps', 'tipe', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('nameapps', 'kode_plant', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('approves', 'tipe', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('approves', 'kode_plant', {
      type: Sequelize.DataTypes.STRING
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('nameapps', 'tipe', {})
    await queryInterface.removeColumn('nameapps', 'kode_plant', {})
    await queryInterface.removeColumn('approves', 'tipe', {})
    await queryInterface.removeColumn('approves', 'kode_plant', {})
  }
}
