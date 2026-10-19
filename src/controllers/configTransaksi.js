const { config_transaksi, config_transaksi_area, veriftax, finance, sequelize } = require('../models')
const { Op } = require('sequelize')
const joi = require('joi')
const response = require('../helpers/response')
const { pagination } = require('../helpers/pagination')
const { activeEnd } = require('../helpers/tarif')

const schemaConfig = joi.object({
  jenis_transaksi: joi.string().required(),
  tipe_akses: joi.string().valid('all', 'area').required(),
  keterangan: joi.string().allow('', null),
  areas: joi.array().items(joi.string()).default([])
})

const includeArea = [{
  model: config_transaksi_area,
  as: 'area',
  attributes: ['id', 'kode_plant'],
  include: [{ model: finance, as: 'finance', attributes: ['kode_plant', 'area', 'profit_center'] }]
}]

// validasi body + simpan area (dipakai add & update)
const prosesSimpan = async (req, res, id) => {
  const { value: results, error } = schemaConfig.validate(req.body)
  if (error) {
    return response(res, 'Error', { error: error.message }, 400, false)
  }
  const areas = [...new Set(results.areas)]
  if (results.tipe_akses === 'area' && areas.length === 0) {
    return response(res, 'Pilih minimal 1 area untuk akses area tertentu', {}, 400, false)
  }
  const findTarif = await veriftax.findOne({ where: { jenis_transaksi: results.jenis_transaksi } })
  if (!findTarif) {
    return response(res, 'Jenis transaksi tidak ditemukan di master tarif', {}, 400, false)
  }
  const findSame = await config_transaksi.findOne({
    where: {
      jenis_transaksi: results.jenis_transaksi,
      ...(id ? { id: { [Op.ne]: id } } : {})
    }
  })
  if (findSame) {
    return response(res, 'Jenis transaksi sudah dikonfigurasi', {}, 400, false)
  }
  if (areas.length > 0) {
    const findArea = await finance.findAll({ where: { kode_plant: areas }, attributes: ['kode_plant'] })
    if (findArea.length !== areas.length) {
      return response(res, 'Terdapat area yang tidak terdaftar di master finance', {}, 400, false)
    }
  }

  const dataSave = {
    jenis_transaksi: results.jenis_transaksi,
    tipe_akses: results.tipe_akses,
    keterangan: results.keterangan || null
  }
  const result = await sequelize.transaction(async (t) => {
    let config
    if (id) {
      config = await config_transaksi.findByPk(id, { transaction: t })
      if (!config) return null
      await config.update(dataSave, { transaction: t })
    } else {
      config = await config_transaksi.create(dataSave, { transaction: t })
    }
    await config_transaksi_area.destroy({ where: { id_config: config.id }, transaction: t })
    if (results.tipe_akses === 'area') {
      await config_transaksi_area.bulkCreate(
        areas.map(kode => ({ id_config: config.id, kode_plant: kode })),
        { transaction: t }
      )
    }
    return config
  })
  if (!result) {
    return response(res, 'Konfigurasi tidak ditemukan', {}, 404, false)
  }
  const detail = await config_transaksi.findByPk(result.id, { include: includeArea })
  return response(res, id ? 'success update config transaksi' : 'success add config transaksi', { result: detail })
}

module.exports = {
  addConfig: async (req, res) => {
    try {
      return await prosesSimpan(req, res)
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  updateConfig: async (req, res) => {
    try {
      return await prosesSimpan(req, res, req.params.id)
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getConfig: async (req, res) => {
    try {
      let { limit, page, search } = req.query
      const searchValue = typeof search === 'object' ? Object.values(search)[0] : (search || '')
      limit = limit === 'all' ? 10000 : (parseInt(limit) || 10)
      page = parseInt(page) || 1
      let where = {}
      if (searchValue !== '') {
        // search juga dari GL account / GL name master tarif
        const findGl = await veriftax.findAll({
          where: {
            [Op.or]: [
              { gl_account: { [Op.like]: `%${searchValue}%` } },
              { gl_name: { [Op.like]: `%${searchValue}%` } }
            ]
          },
          attributes: ['jenis_transaksi'],
          group: ['jenis_transaksi']
        })
        where = {
          [Op.or]: [
            { jenis_transaksi: { [Op.like]: `%${searchValue}%` } },
            { keterangan: { [Op.like]: `%${searchValue}%` } },
            ...(findGl.length > 0 ? [{ jenis_transaksi: findGl.map(x => x.jenis_transaksi) }] : [])
          ]
        }
      }
      const result = await config_transaksi.findAndCountAll({
        where,
        include: includeArea,
        order: [['jenis_transaksi', 'ASC']],
        limit,
        offset: (page - 1) * limit,
        distinct: true
      })
      // lengkapi dengan GL dari master tarif untuk ditampilkan
      const listJenis = result.rows.map(item => item.jenis_transaksi)
      const listGl = listJenis.length === 0 ? [] : await veriftax.findAll({
        where: { jenis_transaksi: listJenis, end_period: activeEnd() },
        attributes: ['jenis_transaksi', 'gl_account', 'gl_name', 'system', 'grouping'],
        group: ['jenis_transaksi', 'gl_account', 'gl_name', 'system', 'grouping']
      })
      const rows = result.rows.map(item => ({
        ...item.toJSON(),
        tarif: listGl.filter(x => x.jenis_transaksi === item.jenis_transaksi)
      }))
      const pageInfo = pagination('/configtrans/get', req.query, page, limit, result.count)
      return response(res, 'success get config transaksi', { result: { rows, count: result.count }, pageInfo })
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  // pilihan untuk form: jenis transaksi aktif dari master tarif + daftar area master finance
  getOptions: async (req, res) => {
    try {
      const listTarif = await veriftax.findAll({
        where: { end_period: activeEnd() },
        attributes: ['jenis_transaksi', 'gl_account', 'gl_name', 'system', 'grouping'],
        group: ['jenis_transaksi', 'gl_account', 'gl_name', 'system', 'grouping'],
        order: [['jenis_transaksi', 'ASC']]
      })
      const jenis = []
      listTarif.forEach(item => {
        if (!item.jenis_transaksi) return
        const cek = jenis.find(x => x.jenis_transaksi === item.jenis_transaksi)
        const tarif = { gl_account: item.gl_account, gl_name: item.gl_name, system: item.system, grouping: item.grouping }
        if (cek) {
          cek.tarif.push(tarif)
        } else {
          jenis.push({ jenis_transaksi: item.jenis_transaksi, tarif: [tarif] })
        }
      })
      const areas = await finance.findAll({
        attributes: ['kode_plant', 'area', 'profit_center', 'region'],
        order: [['area', 'ASC']]
      })
      return response(res, 'success get option config transaksi', { jenis, areas })
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  deleteConfig: async (req, res) => {
    try {
      const { id } = req.params
      const findConfig = await config_transaksi.findByPk(id)
      if (!findConfig) {
        return response(res, 'Konfigurasi tidak ditemukan', {}, 404, false)
      }
      await sequelize.transaction(async (t) => {
        await config_transaksi_area.destroy({ where: { id_config: id }, transaction: t })
        await findConfig.destroy({ transaction: t })
      })
      return response(res, 'success delete config transaksi')
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  }
}
