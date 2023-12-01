'use strict'
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('outlets', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      klaimId: {
        type: Sequelize.INTEGER
      },
      no_transaksi: {
        type: Sequelize.STRING
      },
      kode_plant: {
        type: Sequelize.STRING
      },
      nilai_ajuan: {
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
      nama_ktp: {
        type: Sequelize.STRING
      },
      no_ktp: {
        type: Sequelize.STRING
      },
      no_dn: {
        type: Sequelize.STRING
      },
      status: {
        type: Sequelize.INTEGER
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
    await queryInterface.dropTable('outlets')
  }
}
