'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // 1 = area hanya boleh mengajukan jenis transaksi yang ada di konfigurasi transaksi
    await queryInterface.addColumn('finances', 'config_only', {
      type: Sequelize.DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('finances', 'config_only', {})
  }
}
