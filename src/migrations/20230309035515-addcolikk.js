'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('ikks', 'nama_vendor', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('ikks', 'jenis_vendor', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('ikks', 'alamat_vendor', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('ikks', 'penanggung_pajak', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('ikks', 'type_transaksi', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('ikks', 'no_faktur', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('ikks', 'dpp', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('ikks', 'ppn', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('ikks', 'nilai_buku', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('ikks', 'nilai_utang', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('ikks', 'jenis_pph', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('ikks', 'tgl_tagihanbayar', {
      type: Sequelize.DataTypes.DATE
    })
    await queryInterface.addColumn('ikks', 'no_bpkk', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('ikks', 'type_topup', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('ikks', 'nilai_topup', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('ikks', 'tgl_topup', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('ikks', 'bank_topup', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('ikks', 'no_bbk', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('ikks', 'saldo_awal', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('ikks', 'saldo_akhir', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('ikks', 'kasbon', {
      type: Sequelize.DataTypes.STRING
    })
    await queryInterface.addColumn('ikks', 'saldo_akhirtunai', {
      type: Sequelize.DataTypes.STRING
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('ikks', 'nama_vendor', {})
    await queryInterface.removeColumn('ikks', 'jenis_vendor', {})
    await queryInterface.removeColumn('ikks', 'alamat_vendor', {})
    await queryInterface.removeColumn('ikks', 'penanggung_pajak', {})
    await queryInterface.removeColumn('ikks', 'type_transaksi', {})
    await queryInterface.removeColumn('ikks', 'no_faktur', {})
    await queryInterface.removeColumn('ikks', 'dpp', {})
    await queryInterface.removeColumn('ikks', 'ppn', {})
    await queryInterface.removeColumn('ikks', 'nilai_buku', {})
    await queryInterface.removeColumn('ikks', 'nilai_utang', {})
    await queryInterface.removeColumn('ikks', 'jenis_pph', {})
    await queryInterface.removeColumn('ikks', 'tgl_tagihanbayar', {})
    await queryInterface.removeColumn('ikks', 'no_bpkk', {})
    await queryInterface.removeColumn('ikks', 'type_topup', {})
    await queryInterface.removeColumn('ikks', 'nilai_topup', {})
    await queryInterface.removeColumn('ikks', 'tgl_topup', {})
    await queryInterface.removeColumn('ikks', 'bank_topup', {})
    await queryInterface.removeColumn('ikks', 'no_bbk', {})
    await queryInterface.removeColumn('ikks', 'saldo_awal', {})
    await queryInterface.removeColumn('ikks', 'saldo_akhir', {})
    await queryInterface.removeColumn('ikks', 'kasbon', {})
    await queryInterface.removeColumn('ikks', 'saldo_akhirtunai', {})
  }
}
