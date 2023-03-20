'use strict'
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('veriftaxes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      system: {
        type: Sequelize.STRING
      },
      gl_account: {
        type: Sequelize.STRING
      },
      gl_name: {
        type: Sequelize.STRING
      },
      jenis_transaksi: {
        type: Sequelize.STRING
      },
      type_transaksi: {
        type: Sequelize.STRING
      },
      jenis_pph: {
        type: Sequelize.STRING
      },
      status_npwp: {
        type: Sequelize.STRING
      },
      tarif_pph: {
        type: Sequelize.STRING
      },
      dpp_nongrossup: {
        type: Sequelize.STRING
      },
      dpp_grossup: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    })
  },
  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('veriftaxes')
  }
}
