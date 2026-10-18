'use strict'

// index untuk kolom yang dipakai detail / tracking / dokumen / notif transaksi
const listIndex = [
  { table: 'docusers', column: 'no_transaksi' },
  { table: 'resmails', column: 'no_transaksi' },
  { table: 'reservoirs', column: 'no_transaksi' },
  { table: 'fakturs', column: 'no_faktur' },
  { table: 'notifs', column: 'createdAt' },
  { table: 'kpps', column: 'profit_center' },
  { table: 'glikks', column: 'profit_center' },
  { table: 'users', column: 'kode_plant' }
]

const indexName = (item) => `idx_${item.table}_${item.column}`

module.exports = {
  async up (queryInterface, Sequelize) {
    for (const item of listIndex) {
      const exist = await queryInterface.showIndex(item.table)
      if (!exist.find(x => x.name === indexName(item))) {
        await queryInterface.addIndex(item.table, [item.column], { name: indexName(item) })
      }
    }
  },

  async down (queryInterface, Sequelize) {
    for (const item of listIndex) {
      const exist = await queryInterface.showIndex(item.table)
      if (exist.find(x => x.name === indexName(item))) {
        await queryInterface.removeIndex(item.table, indexName(item))
      }
    }
  }
}
