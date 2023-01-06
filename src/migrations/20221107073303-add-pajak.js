'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('pajaks', 'no_transaksi', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('pajaks', 'kode_plant', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('pajaks', 'area', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('pajaks', 'periode_awal', {
      type: Sequelize.DataTypes.DATE
    })
    await queryInterface.addColumn('pajaks', 'periode_akhir', {
      type: Sequelize.DataTypes.DATE
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('pajaks', 'no_transaksi', {})
    await queryInterface.removeColumn('pajaks', 'kode_plant', {})
    await queryInterface.removeColumn('pajaks', 'area', {})
    await queryInterface.removeColumn('pajaks', 'periode_awal', {})
    await queryInterface.removeColumn('pajaks', 'periode_akhir', {})
  }
}
