'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // ROM approver ajuan AR Central per area, berbeda dengan ROM area (kolom rom)
    const desc = await queryInterface.describeTable('finances')
    if (!desc.rom_arc) {
      await queryInterface.addColumn('finances', 'rom_arc', {
        type: Sequelize.DataTypes.STRING
      })
    }
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('finances', 'rom_arc', {})
  }
}
