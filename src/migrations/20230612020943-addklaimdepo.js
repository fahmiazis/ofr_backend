'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('klaims', 'kode_vendor', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('depos', 'pic_klaim', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('depos', 'manager_klaim', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('depos', 'pic_tax', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('depos', 'manager_tax', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.renameColumn('depos', 'pic_1', 'pic_finance')
    await queryInterface.renameColumn('depos', 'pic_2', 'spv_finance')
    await queryInterface.renameColumn('depos', 'pic_3', 'asman_finance')
    await queryInterface.renameColumn('depos', 'pic_4', 'manager_finance')
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('klaims', 'kode_vendor', {})
    await queryInterface.removeColumn('depos', 'pic_klaim', {})
    await queryInterface.removeColumn('depos', 'manager_klaim', {})
    await queryInterface.removeColumn('depos', 'pic_tax', {})
    await queryInterface.removeColumn('depos', 'manager_tax', {})
    await queryInterface.renameColumn('depos', 'pic_finance', 'pic_1')
    await queryInterface.renameColumn('depos', 'spv_finance', 'pic_2')
    await queryInterface.renameColumn('depos', 'asman_finance', 'pic_3')
    await queryInterface.renameColumn('depos', 'manager_finance', 'pic_4')
  }
}
