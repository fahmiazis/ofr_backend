'use strict'

// index untuk kolom yang dipakai join / filter di list klaim & operasional.
// sebelumnya tabel hanya punya PRIMARY, sehingga join ttds (no_transaksi) dll full scan.
const listIndex = [
  { table: 'ttds', column: 'no_transaksi' },
  { table: 'klaims', column: 'no_transaksi' },
  { table: 'klaims', column: 'no_pembayaran' },
  { table: 'klaims', column: 'kode_plant' },
  { table: 'klaims', column: 'status_transaksi' },
  { table: 'klaims', column: 'start_klaim' },
  { table: 'fakturkls', column: 'klaimId' },
  { table: 'outlets', column: 'klaimId' },
  { table: 'ops', column: 'no_transaksi' },
  { table: 'ops', column: 'no_pembayaran' },
  { table: 'ops', column: 'kode_plant' },
  { table: 'ops', column: 'status_transaksi' },
  { table: 'ops', column: 'start_ops' },
  { table: 'bbms', column: 'transId' },
  { table: 'finances', column: 'kode_plant' },
  { table: 'depos', column: 'kode_plant' },
  { table: 'picklaims', column: 'kode_plant' },
  { table: 'klirings', column: 'nama_singkat' },
  { table: 'veriftaxes', column: 'gl_account' }
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
