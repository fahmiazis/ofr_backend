'use strict'

// tabel ops sudah melewati batas row size InnoDB (8126 byte) karena 51 kolom VARCHAR(255) latin1
// selalu disimpan inline, sehingga kolom baru apa pun gagal ditambahkan.
// - teks bebas / nama -> TEXT (disimpan off-page, data tidak terpotong)
// - kode, angka, flag yang pasti pendek -> VARCHAR(100)
// - kolom ber-index (no_transaksi, no_pembayaran, kode_plant) tidak diubah
const kolomText = [
  'keterangan', 'reason', 'alamat_vendor', 'sub_coa', 'nama_tujuan',
  'nama_ktp', 'nama_vendor', 'nama_coa', 'nama_npwp'
]
const kolomPendek = [
  'cost_center', 'area', 'no_coa', 'nilai_ajuan', 'bank_tujuan', 'norek_ajuan', 'tujuan_tf', 'tiperek',
  'no_npwp', 'no_ktp', 'tax_type', 'tax_code', 'menu_rev', 'no_faktur', 'dpp', 'ppn', 'nilai_buku',
  'nilai_utang', 'nilai_vendor', 'nilai_bayar', 'jenis_pph', 'jenis_vendor', 'penanggung_pajak',
  'type_transaksi', 'typeniknpwp', 'type_kasbon', 'type_po', 'no_po', 'nilai_po', 'nilai_pr',
  'people_reject', 'nilai_verif', 'type_nilaiverif', 'new_ident', 'pph', 'status_approve',
  'menu_proses', 'bank_transfer', 'stat_kasbon'
]
const panjangPendek = 100

const getKolom = async (queryInterface) => {
  const [rows] = await queryInterface.sequelize.query(
    "SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'ops'"
  )
  return rows
}

module.exports = {
  async up (queryInterface, Sequelize) {
    const listKolom = await getKolom(queryInterface)
    const cari = (nama) => listKolom.find(x => x.COLUMN_NAME === nama)
    const ubahText = kolomText.filter(nama => cari(nama) && cari(nama).DATA_TYPE === 'varchar')
    const ubahPendek = kolomPendek.filter(nama => cari(nama) && cari(nama).DATA_TYPE === 'varchar' && parseInt(cari(nama).CHARACTER_MAXIMUM_LENGTH) > panjangPendek)
    if (ubahText.length === 0 && ubahPendek.length === 0) return

    // sql_mode tidak strict: data lebih panjang akan terpotong diam-diam, jadi cek dulu
    if (ubahPendek.length > 0) {
      const select = ubahPendek.map(nama => `MAX(CHAR_LENGTH(\`${nama}\`)) AS \`${nama}\``).join(', ')
      const [[maxIsi]] = await queryInterface.sequelize.query(`SELECT ${select} FROM ops`)
      const kepanjangan = ubahPendek.filter(nama => parseInt(maxIsi[nama] || 0) > panjangPendek)
      if (kepanjangan.length > 0) {
        throw new Error(`Data ops lebih dari ${panjangPendek} karakter di kolom: ${kepanjangan.map(nama => `${nama} (${maxIsi[nama]})`).join(', ')}`)
      }
    }

    // 1 ALTER supaya tabel hanya di-rebuild sekali
    const listUbah = [
      ...ubahText.map(nama => `MODIFY \`${nama}\` TEXT NULL`),
      ...ubahPendek.map(nama => `MODIFY \`${nama}\` VARCHAR(${panjangPendek}) NULL`)
    ]
    await queryInterface.sequelize.query(`ALTER TABLE ops ${listUbah.join(', ')}`)
  },

  async down (queryInterface, Sequelize) {
    const listKolom = await getKolom(queryInterface)
    const listUbah = [...kolomText, ...kolomPendek]
      .filter(nama => listKolom.find(x => x.COLUMN_NAME === nama))
      .map(nama => `MODIFY \`${nama}\` VARCHAR(255) NULL`)
    if (listUbah.length > 0) {
      await queryInterface.sequelize.query(`ALTER TABLE ops ${listUbah.join(', ')}`)
    }
  }
}
