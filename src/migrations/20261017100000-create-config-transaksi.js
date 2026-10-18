'use strict'
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // mapping jenis transaksi (master tarif) -> boleh diajukan semua area atau area tertentu saja
    await queryInterface.createTable('config_transaksis', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      jenis_transaksi: {
        allowNull: false,
        unique: true,
        type: Sequelize.STRING
      },
      tipe_akses: {
        allowNull: false,
        defaultValue: 'all',
        type: Sequelize.STRING
      },
      keterangan: {
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
    await queryInterface.createTable('config_transaksi_areas', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      id_config: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      kode_plant: {
        allowNull: false,
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
    await queryInterface.addIndex('config_transaksi_areas', ['id_config'])
    await queryInterface.addIndex('config_transaksi_areas', ['kode_plant'])
  },
  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('config_transaksi_areas')
    await queryInterface.dropTable('config_transaksis')
  }
}
