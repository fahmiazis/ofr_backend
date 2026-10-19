'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // tanggal tarif digantikan data baru (upload master), end_period tetap jadi acuan non active
    await queryInterface.addColumn('veriftaxes', 'history_end_period', {
      type: Sequelize.DataTypes.DATE,
      allowNull: true
    })
    await queryInterface.addColumn('veriftaxes', 'updated_by', {
      type: Sequelize.DataTypes.STRING,
      allowNull: true
    })
    // data lama yang sudah punya end_period semuanya hasil tergantikan upload
    await queryInterface.sequelize.query('UPDATE veriftaxes SET history_end_period = end_period WHERE end_period IS NOT NULL')
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('veriftaxes', 'history_end_period', {})
    await queryInterface.removeColumn('veriftaxes', 'updated_by', {})
  }
}
