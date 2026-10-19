'use strict'

const kolom = ['tarif_pph', 'dpp_nongrossup', 'dpp_grossup']

// nilai persen hasil upload excel tersimpan sebagai pecahan (100% -> 1%, 98% -> 0.98%),
// nilai <= 1 dikali 100, nilai > 1 (input manual seperti 100%) sudah benar
const toPersen = (val, kali) => {
  const angka = parseFloat(String(val).replace('%', '').replace(',', '.'))
  if (isNaN(angka)) return val
  const hasil = kali ? (angka <= 1 ? angka * 100 : angka) : angka / 100
  return `${parseFloat(hasil.toFixed(6))}%`
}

const proses = async (queryInterface, kali) => {
  const [rows] = await queryInterface.sequelize.query(`SELECT id, ${kolom.join(', ')} FROM veriftaxes`)
  for (const row of rows) {
    const data = {}
    kolom.forEach(item => {
      if (row[item] !== null && row[item] !== '') {
        const baru = toPersen(row[item], kali)
        if (baru !== row[item]) data[item] = baru
      }
    })
    if (Object.keys(data).length > 0) {
      await queryInterface.bulkUpdate('veriftaxes', data, { id: row.id })
    }
  }
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface) {
    await proses(queryInterface, true)
  },

  async down (queryInterface) {
    await proses(queryInterface, false)
  }
}
