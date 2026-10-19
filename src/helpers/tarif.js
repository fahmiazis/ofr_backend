const { Op } = require('sequelize')

module.exports = {
  // tarif aktif: end_period kosong atau belum lewat tanggalnya
  activeEnd: () => ({ [Op.or]: { [Op.is]: null, [Op.gt]: new Date() } }),
  // tarif non active: end_period sudah lewat
  inactiveEnd: () => ({ [Op.lte]: new Date() }),
  // nilai persen dari excel: sel format persen terbaca pecahan (2% -> 0.02),
  // teks "2%" / angka > 1 dianggap sudah persen
  toPersen: (val) => {
    if (val === null || val === undefined || val === '') return '0%'
    if (typeof val === 'number') {
      return `${parseFloat((val <= 1 ? val * 100 : val).toFixed(6))}%`
    }
    const angka = parseFloat(String(val).replace('%', '').replace(',', '.'))
    return isNaN(angka) ? '0%' : `${parseFloat(angka.toFixed(6))}%`
  },
  // tanggal dari excel (Date / dd-mm-yyyy / yyyy-mm-dd), kosong = null
  toDate: (val) => {
    if (val === null || val === undefined || val === '' || val === '-') return null
    if (val instanceof Date) return isNaN(val.getTime()) ? null : val
    const moment = require('moment')
    // sel excel tanggal tanpa format date terbaca serial number (hari sejak 1899-12-30)
    if (typeof val === 'number') return val > 0 ? moment.utc('1899-12-30').add(Math.round(val), 'days').toDate() : null
    const tgl = moment(String(val).trim(), ['D-M-YYYY', 'D/M/YYYY', 'D MMMM YYYY', 'YYYY-MM-DD', moment.ISO_8601], true)
    return tgl.isValid() ? tgl.toDate() : null
  }
}
