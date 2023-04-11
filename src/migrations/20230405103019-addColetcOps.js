'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('ops', 'start_ops', {
      type: Sequelize.DataTypes.DATE
    })
    await queryInterface.addColumn('ops', 'end_ops', {
      type: Sequelize.DataTypes.DATE
    })
    await queryInterface.addColumn('ops', 'end_proses', {
      type: Sequelize.DataTypes.DATE
    })
    await queryInterface.addColumn('ops', 'history', {
      type: Sequelize.DataTypes.TEXT
    })
    await queryInterface.addColumn('ops', 'menu_rev', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('ops', 'menu_proses', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('ops', 'tujuan_tf', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('ops', 'tiperek', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('ops', 'no_pembayaran', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('ops', 'bank_transfer', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('ops', 'nama_vendor', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('ops', 'jenis_vendor', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('ops', 'alamat_vendor', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('ops', 'penanggung_pajak', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('ops', 'type_transaksi', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('ops', 'no_faktur', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('ops', 'nilai_buku', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('ops', 'nilai_utang', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('ops', 'tgl_tagihanbayar', {
      type: Sequelize.DataTypes.DATE
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('ops', 'start_ops', {})
    await queryInterface.removeColumn('ops', 'end_ops', {})
    await queryInterface.removeColumn('ops', 'end_proses', {})
    await queryInterface.removeColumn('ops', 'history', {})
    await queryInterface.removeColumn('ops', 'menu_rev', {})
    await queryInterface.removeColumn('ops', 'menu_proses', {})
    await queryInterface.removeColumn('ops', 'tujuan_tf', {})
    await queryInterface.removeColumn('ops', 'tiperek', {})
    await queryInterface.removeColumn('ops', 'no_pembayaran', {})
    await queryInterface.removeColumn('ops', 'bank_transfer', {})
    await queryInterface.removeColumn('ops', 'nama_vendor', {})
    await queryInterface.removeColumn('ops', 'jenis_vendor', {})
    await queryInterface.removeColumn('ops', 'alamat_vendor', {})
    await queryInterface.removeColumn('ops', 'penanggung_pajak', {})
    await queryInterface.removeColumn('ops', 'type_transaksi', {})
    await queryInterface.removeColumn('ops', 'no_faktur', {})
    await queryInterface.removeColumn('ops', 'nilai_buku', {})
    await queryInterface.removeColumn('ops', 'nilai_utang', {})
    await queryInterface.removeColumn('ops', 'tgl_tagihanbayar', {})
  }
}
