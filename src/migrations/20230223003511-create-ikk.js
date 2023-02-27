'use strict'
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('ikks', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      no_coa: {
        type: Sequelize.STRING
      },
      nama_coa: {
        type: Sequelize.STRING
      },
      sub_coa: {
        type: Sequelize.STRING
      },
      cost_center: {
        type: Sequelize.STRING
      },
      uraian: {
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
      nama_ktp: {
        type: Sequelize.STRING
      },
      no_ktp: {
        type: Sequelize.STRING
      },
      start_ikk: {
        type: Sequelize.DATE
      },
      end_ikk: {
        type: Sequelize.DATE
      },
      end_proses: {
        type: Sequelize.DATE
      },
      history: {
        type: Sequelize.TEXT
      },
      menu_rev: {
        type: Sequelize.STRING
      },
      menu_proses: {
        type: Sequelize.STRING
      },
      tujuan_tf: {
        type: Sequelize.STRING
      },
      tiperek: {
        type: Sequelize.STRING
      },
      no_pembayaran: {
        type: Sequelize.STRING
      },
      bank_transfer: {
        type: Sequelize.STRING
      },
      tipe_nodoc: {
        type: Sequelize.STRING
      },
      nodoc: {
        type: Sequelize.STRING
      },
      alamat: {
        type: Sequelize.STRING
      },
      user_nama: {
        type: Sequelize.STRING
      },
      user_jabatan: {
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
    await queryInterface.dropTable('ikks')
  }
}
