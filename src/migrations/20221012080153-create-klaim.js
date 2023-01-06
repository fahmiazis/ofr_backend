'use strict'
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('klaims', {
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
        type: Sequelize.STRING
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
      ppu: {
        type: Sequelize.STRING
      },
      pa: {
        type: Sequelize.STRING
      },
      nominal: {
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
      no_transaksi: {
        type: Sequelize.STRING
      },
      kode_plant: {
        type: Sequelize.STRING
      },
      area: {
        type: Sequelize.STRING
      },
      periode_awal: {
        type: Sequelize.DATE
      },
      periode_akhir: {
        type: Sequelize.DATE
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
    await queryInterface.dropTable('klaims')
  }
}
