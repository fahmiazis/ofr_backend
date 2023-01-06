'use strict'
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('docusers', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      desc: {
        type: Sequelize.STRING
      },
      jenis_dok: {
        type: Sequelize.STRING
      },
      divisi: {
        type: Sequelize.STRING
      },
      no_transaksi: {
        type: Sequelize.STRING
      },
      path: {
        type: Sequelize.STRING
      },
      status: {
        type: Sequelize.STRING
      },
      reason: {
        type: Sequelize.STRING
      },
      jenis_form: {
        type: Sequelize.STRING
      },
      tipe: {
        type: Sequelize.STRING
      },
      periode: {
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
    await queryInterface.dropTable('docusers')
  }
}
