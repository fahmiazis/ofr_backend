'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // SPV AR Center per area, approver ajuan AR Center setelah PIC ARC
    await queryInterface.addColumn('finances', 'spv_arc', {
      type: Sequelize.DataTypes.STRING
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('finances', 'spv_arc', {})
  }
}
