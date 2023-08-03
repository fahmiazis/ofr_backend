'use strict'
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('taxcodes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      tax_type: {
        type: Sequelize.STRING
      },
      tax_code: {
        type: Sequelize.STRING
      },
      keterangan: {
        type: Sequelize.STRING
      },
      stat_npwp: {
        type: Sequelize.STRING
      },
      kode_obpajak: {
        type: Sequelize.STRING
      },
      tax_objdesc: {
        type: Sequelize.STRING
      },
      pph: {
        type: Sequelize.STRING
      },
      income: {
        type: Sequelize.STRING
      },
      tax_base: {
        type: Sequelize.STRING
      },
      tarif_asis: {
        type: Sequelize.STRING
      },
      transaksi: {
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
    await queryInterface.dropTable('taxcodes')
  }
}
