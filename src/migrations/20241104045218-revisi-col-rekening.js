'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    queryInterface.renameColumn('rekenings', 'rek_spending', 'no_rekening')
    queryInterface.renameColumn('rekenings', 'rek_zba', 'type')
    queryInterface.renameColumn('rekenings', 'rek_bankcol', 'bank')
  },

  async down (queryInterface, Sequelize) {
    queryInterface.renameColumn('rekenings', 'no_rekening', 'rek_spending')
    queryInterface.renameColumn('rekenings', 'type', 'rek_zba')
    queryInterface.renameColumn('rekenings', 'bank', 'rek_bankcol')
  }
}
