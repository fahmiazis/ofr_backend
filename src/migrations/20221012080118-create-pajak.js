'use strict'
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('pajaks', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      no_coa: {
        type: Sequelize.STRING
      },
      sub_coa: {
        type: Sequelize.STRING
      },
      cost_center: {
        type: Sequelize.STRING
      },
      nama_coa: {
        type: Sequelize.STRING
      },
      keterangan: {
        type: Sequelize.STRING
      },
      periode: {
        type: Sequelize.DATE
      },
      nilai_ajuan: {
        type: Sequelize.STRING
      },
      bank_tujuan: {
        type: Sequelize.STRING
      },
      norek_ajuan: {
        type: Sequelize.STRING
      },
      nama_tujuan: {
        type: Sequelize.STRING
      },
      status_npwp: {
        type: Sequelize.INTEGER
      },
      nama_npwp: {
        type: Sequelize.STRING
      },
      no_npwp: {
        type: Sequelize.STRING
      },
      dpp: {
        type: Sequelize.STRING
      },
      ppn: {
        type: Sequelize.STRING
      },
      pph: {
        type: Sequelize.STRING
      },
      jenis_pph: {
        type: Sequelize.STRING
      },
      nilai_bayar: {
        type: Sequelize.STRING
      },
      tanggal_transfer: {
        type: Sequelize.DATE
      },
      status_transaksi: {
        type: Sequelize.INTEGER
      },
      status_reject: {
        type: Sequelize.INTEGER
      },
      status_approve: {
        type: Sequelize.STRING
      },
      isreject: {
        type: Sequelize.INTEGER
      },
      reason: {
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
    await queryInterface.dropTable('pajaks')
  }
}
