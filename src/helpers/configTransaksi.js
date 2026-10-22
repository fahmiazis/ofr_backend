const { config_transaksi, config_transaksi_area, finance } = require('../models')
const { Op } = require('sequelize')
const { isCoveredArc } = require('./arc')

// bila tabel/kolom belum dimigrasi jangan sampai memblokir pengajuan,
// cukup anggap belum ada konfigurasi
const findConfig = async (where = {}) => {
  try {
    return await config_transaksi.findAll({
      where,
      include: [{ model: config_transaksi_area, as: 'area', attributes: ['kode_plant'] }]
    })
  } catch (error) {
    console.log('config transaksi tidak dapat dibaca:', error.message)
    return []
  }
}

// area dengan config_only = 1 hanya boleh mengajukan jenis transaksi yang dikonfigurasi
const isConfigOnly = async (kodePlant) => {
  try {
    const findArea = await finance.findOne({ where: { kode_plant: kodePlant }, attributes: ['config_only'] })
    return findArea !== null && parseInt(findArea.config_only) === 1
  } catch (error) {
    console.log('config_only finance tidak dapat dibaca:', error.message)
    return false
  }
}

// tipe_akses 'arc' = jenis transaksi yang ditangani AR Center:
// hanya user AR Center yang boleh mengajukan untuk area yang di-cover AR Center,
// area lain yang tidak di-cover tetap boleh seperti 'all'
const allowArea = (config, kodePlant, covered) => {
  if (config.tipe_akses === 'arc') return !covered
  return config.tipe_akses !== 'area' || config.area.find(x => x.kode_plant === kodePlant) !== undefined
}

module.exports = {
  // filter where veriftax untuk jenis_transaksi yang boleh diajukan kode_plant ini:
  // - user AR Center: hanya jenis transaksi AR Center
  // - area biasa: jenis yang belum dikonfigurasi boleh, yang dibatasi area lain / AR Center tidak
  // - area config_only: hanya jenis yang dikonfigurasi (semua area / area ini)
  getFilterJenis: async (kodePlant, isArc = false) => {
    const listConfig = await findConfig()
    if (isArc) {
      const allowed = listConfig.filter(item => item.tipe_akses === 'arc').map(item => item.jenis_transaksi)
      return { jenis_transaksi: { [Op.in]: allowed.length > 0 ? allowed : [''] } }
    }
    const covered = await isCoveredArc(kodePlant)
    if (await isConfigOnly(kodePlant)) {
      const allowed = listConfig.filter(item => allowArea(item, kodePlant, covered)).map(item => item.jenis_transaksi)
      return { jenis_transaksi: { [Op.in]: allowed.length > 0 ? allowed : [''] } }
    }
    const blocked = listConfig.filter(item => !allowArea(item, kodePlant, covered)).map(item => item.jenis_transaksi)
    return blocked.length > 0 ? { jenis_transaksi: { [Op.notIn]: blocked } } : {}
  },
  isJenisAllowed: async (jenisTransaksi, kodePlant, isArc = false) => {
    const listConfig = await findConfig({ jenis_transaksi: jenisTransaksi })
    if (isArc) {
      return listConfig.length > 0 && listConfig[0].tipe_akses === 'arc'
    }
    if (listConfig.length === 0) {
      return !(await isConfigOnly(kodePlant))
    }
    return allowArea(listConfig[0], kodePlant, await isCoveredArc(kodePlant))
  }
}
