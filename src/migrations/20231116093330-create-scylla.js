'use strict'
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('scyllas', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      kd_reg: {
        type: Sequelize.STRING
      },
      region: {
        type: Sequelize.STRING
      },
      kd_sap2: {
        type: Sequelize.STRING
      },
      kode_plant: {
        type: Sequelize.STRING
      },
      kode_depo: {
        type: Sequelize.STRING
      },
      initial_depo: {
        type: Sequelize.STRING
      },
      nm_depo: {
        type: Sequelize.STRING
      },
      area: {
        type: Sequelize.STRING
      },
      channel: {
        type: Sequelize.STRING
      },
      status: {
        type: Sequelize.STRING
      },
      system: {
        type: Sequelize.STRING
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
    await queryInterface.dropTable('scyllas')
  }
}
