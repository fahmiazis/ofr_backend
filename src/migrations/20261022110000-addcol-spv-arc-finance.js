'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // SPV AR Central per area, approver ajuan AR Central setelah PIC ARC
    await queryInterface.addColumn('finances', 'spv_arc', {
      type: Sequelize.DataTypes.STRING
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('finances', 'spv_arc', {})
  }
}
