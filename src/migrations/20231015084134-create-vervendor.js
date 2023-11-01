'use strict'
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('vervendors', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      no_transaksi: {
        type: Sequelize.STRING
      },
      nama: {
        type: Sequelize.STRING
      },
      npwp: {
        type: Sequelize.STRING
      },
      nik: {
        type: Sequelize.STRING
      },
      alamat: {
        type: Sequelize.STRING
      },
      kode_plant: {
        type: Sequelize.STRING
      },
      status_transaksi: {
        type: Sequelize.INTEGER
      },
      tipe_ajuan: {
        type: Sequelize.STRING
      },
      idVendor: {
        type: Sequelize.STRING
      },
      status_reject: {
        type: Sequelize.INTEGER
      },
      isReject: {
        type: Sequelize.INTEGER
      },
      start_transaksi: {
        type: Sequelize.DATE
      },
      end_transaksi: {
        type: Sequelize.DATE
      },
      tgl_verif: {
        type: Sequelize.DATE
      },
      history: {
        type: Sequelize.TEXT
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
    await queryInterface.dropTable('vervendors')
  }
}
