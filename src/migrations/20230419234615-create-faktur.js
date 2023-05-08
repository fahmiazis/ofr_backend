'use strict'
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('fakturs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      no_faktur: {
        type: Sequelize.STRING
      },
      tgl_faktur: {
        type: Sequelize.DATE
      },
      npwp: {
        type: Sequelize.STRING
      },
      nama: {
        type: Sequelize.STRING
      },
      jumlah_dpp: {
        type: Sequelize.STRING
      },
      jumlah_ppn: {
        type: Sequelize.STRING
      },
      status: {
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
    await queryInterface.dropTable('fakturs')
  }
}
