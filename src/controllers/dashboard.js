const { sequelize } = require('../models')
const { QueryTypes } = require('sequelize')
const response = require('../helpers/response')
const moment = require('moment')

const listTransaksi = ['klaim', 'operasional', 'kasbon', 'ikk']

// prioritas status per baris; satu no_transaksi bisa terdiri dari beberapa baris,
// status transaksi diambil dari prioritas terkecil (rejected > finished > revisi > in progress)
const prioStatus = `CASE
  WHEN status_transaksi = 0 THEN 1
  WHEN status_transaksi IN (7, 8) THEN 2
  WHEN status_reject = 1 THEN 3
  ELSE 4
END`

const getPeriode = (query) => {
  const { year, months } = query
  if (year !== undefined && /^\d{4}$/.test(year)) {
    return {
      start: moment(`${year}-01-01`).startOf('year'),
      end: moment(`${year}-01-01`).endOf('year')
    }
  }
  const jumlah = Math.min(Math.max(parseInt(months) || 6, 1), 36)
  return {
    start: moment().subtract(jumlah, 'months').startOf('day'),
    end: moment().endOf('day')
  }
}

module.exports = {
  // GET /dashboard/status?months=6 atau ?year=2025
  getStatusTransaksi: async (req, res) => {
    try {
      const { start, end } = getPeriode(req.query)
      const replacements = {
        start: start.format('YYYY-MM-DD HH:mm:ss'),
        end: end.format('YYYY-MM-DD HH:mm:ss')
      }
      const filterRow = 'no_transaksi IS NOT NULL AND createdAt BETWEEN :start AND :end'

      const rows = await sequelize.query(`
        SELECT
          transaksi,
          COUNT(*) AS totalData,
          SUM(kategori = 'finished') AS finished,
          SUM(kategori = 'in_progress') AS inProgress,
          SUM(kategori = 'rejected') AS rejected,
          SUM(kategori = 'revisi') AS revisi
        FROM (
          SELECT
            transaksi,
            no_transaksi,
            CASE MIN(prio)
              WHEN 1 THEN 'rejected'
              WHEN 2 THEN 'finished'
              WHEN 3 THEN 'revisi'
              ELSE 'in_progress'
            END AS kategori
          FROM (
            SELECT 'klaim' AS transaksi, no_transaksi, ${prioStatus} AS prio
            FROM klaims WHERE ${filterRow}

            UNION ALL

            SELECT 'operasional' AS transaksi, no_transaksi, ${prioStatus} AS prio
            FROM ops WHERE ${filterRow} AND (type_kasbon IS NULL OR type_kasbon <> 'kasbon')

            UNION ALL

            SELECT 'kasbon' AS transaksi, no_transaksi, ${prioStatus} AS prio
            FROM ops WHERE ${filterRow} AND type_kasbon = 'kasbon'

            UNION ALL

            SELECT 'ikk' AS transaksi, no_transaksi, ${prioStatus} AS prio
            FROM ikks WHERE ${filterRow}
          ) AS all_rows
          GROUP BY transaksi, no_transaksi
        ) AS per_transaksi
        GROUP BY transaksi
      `, {
        replacements,
        type: QueryTypes.SELECT
      })

      // pastikan semua jenis transaksi ada di hasil walau datanya kosong
      const result = listTransaksi.map(transaksi => {
        const item = rows.find(x => x.transaksi === transaksi) || {}
        return {
          transaksi,
          totalData: parseInt(item.totalData || 0),
          finished: parseInt(item.finished || 0),
          inProgress: parseInt(item.inProgress || 0),
          rejected: parseInt(item.rejected || 0),
          revisi: parseInt(item.revisi || 0)
        }
      })

      return response(res, 'get dashboard success', {
        result,
        periode: { start: replacements.start, end: replacements.end }
      })
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  }
}
