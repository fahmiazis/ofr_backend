const { mapping_arc, user, finance, sequelize } = require('../models')
const { Op } = require('sequelize')
const joi = require('joi')
const fs = require('fs')
const multer = require('multer')
const readXlsxFile = require('read-excel-file/node')
const response = require('../helpers/response')
const { pagination } = require('../helpers/pagination')
const uploadMaster = require('../helpers/uploadMaster')
const { LEVEL_SPV_ARC } = require('../helpers/arc')

const schemaMapping = joi.object({
  username: joi.string().required(),
  areas: joi.array().items(joi.string()).min(1).required()
})

const schemaSpv = joi.object({
  areas: joi.array().items(joi.string()).min(1).required(),
  spv_arc: joi.string().allow('', null)
})

const headerMaster = ['KODE PLANT', 'PROFIT CENTER', 'AREA', 'PIC ARC', 'EMAIL']

const includeMapping = [
  { model: user, as: 'user', attributes: ['id', 'username', 'fullname', 'email', 'level'] },
  { model: finance, as: 'finance', attributes: ['kode_plant', 'area', 'profit_center'] }
]

const cleanText = (val) => `${val === null || val === undefined ? '' : val}`.trim()

const hapusFile = (dokumen) => fs.unlink(dokumen, (err) => { if (err) console.log(err.message) })

// gabungkan baris mapping menjadi 1 baris per user AR Center
const groupUser = (listMap) => {
  const result = []
  listMap.forEach(item => {
    let cek = result.find(x => x.username === item.username)
    if (!cek) {
      cek = {
        username: item.username,
        fullname: item.user ? item.user.fullname : null,
        email: item.user ? item.user.email : null,
        level: item.user ? item.user.level : null,
        areas: []
      }
      result.push(cek)
    }
    cek.areas.push({
      id: item.id,
      kode_plant: item.kode_plant,
      area: item.finance ? item.finance.area : null,
      profit_center: item.finance ? item.finance.profit_center : null
    })
  })
  return result.sort((a, b) => `${a.fullname || a.username}`.localeCompare(`${b.fullname || b.username}`))
}

module.exports = {
  getMapping: async (req, res) => {
    try {
      let { limit, page, search } = req.query
      const searchValue = (typeof search === 'object' ? Object.values(search)[0] : (search || '')).toLowerCase()
      limit = limit === 'all' ? 10000 : (parseInt(limit) || 10)
      page = parseInt(page) || 1
      const listMap = await mapping_arc.findAll({ include: includeMapping, order: [['kode_plant', 'ASC']] })
      const listUser = groupUser(listMap).filter(item => searchValue === '' ||
        [item.username, item.fullname, item.email].some(x => `${x || ''}`.toLowerCase().includes(searchValue)) ||
        item.areas.some(x => `${x.kode_plant} ${x.area || ''} ${x.profit_center || ''}`.toLowerCase().includes(searchValue))
      )
      const rows = listUser.slice((page - 1) * limit, page * limit)
      const pageInfo = pagination('/arc/get', req.query, page, limit, listUser.length)
      return response(res, 'success get mapping arc', { result: { rows, count: listUser.length }, pageInfo })
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  // pilihan form: user level area (5), user SPV ARC + daftar area master finance
  getOptions: async (req, res) => {
    try {
      const users = await user.findAll({
        where: { level: 5 },
        attributes: ['username', 'fullname', 'email', 'kode_plant'],
        order: [['fullname', 'ASC']]
      })
      const spv = await user.findAll({
        where: { level: LEVEL_SPV_ARC },
        attributes: ['username', 'fullname', 'email'],
        order: [['fullname', 'ASC']]
      })
      const areas = await finance.findAll({
        attributes: ['kode_plant', 'area', 'profit_center', 'region'],
        order: [['area', 'ASC']]
      })
      return response(res, 'success get option mapping arc', { users, spv, areas })
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  // simpan seluruh area untuk 1 user (area yang tidak dipilih dihapus)
  saveMapping: async (req, res) => {
    try {
      const { value: results, error } = schemaMapping.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 400, false)
      }
      const areas = [...new Set(results.areas)]
      const findUser = await user.findOne({ where: { username: results.username } })
      if (!findUser) {
        return response(res, 'User tidak ditemukan di master user', {}, 400, false)
      }
      const findArea = await finance.findAll({ where: { kode_plant: areas }, attributes: ['kode_plant'] })
      if (findArea.length !== areas.length) {
        return response(res, 'Terdapat area yang tidak terdaftar di master finance', {}, 400, false)
      }
      await sequelize.transaction(async (t) => {
        await mapping_arc.destroy({
          where: { username: results.username, kode_plant: { [Op.notIn]: areas } },
          transaction: t
        })
        const listAda = await mapping_arc.findAll({ where: { username: results.username }, transaction: t })
        const listBaru = areas.filter(kode => listAda.find(x => x.kode_plant === kode) === undefined)
        if (listBaru.length > 0) {
          await mapping_arc.bulkCreate(
            listBaru.map(kode => ({ username: results.username, kode_plant: kode })),
            { transaction: t }
          )
        }
      })
      return response(res, 'success save mapping arc')
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  // area yang di-cover AR Center beserta SPV ARC-nya (kolom spv_arc master finance)
  getSpv: async (req, res) => {
    try {
      const listMap = await mapping_arc.findAll({ attributes: ['kode_plant', 'username'] })
      const listKode = [...new Set(listMap.map(x => x.kode_plant))]
      const result = listKode.length === 0
        ? []
        : await finance.findAll({
          where: { kode_plant: listKode },
          attributes: ['id', 'kode_plant', 'area', 'profit_center', 'spv_arc', 'rom', 'nom'],
          order: [['area', 'ASC']]
        })
      const rows = result.map(item => ({
        ...item.toJSON(),
        jumlah_pic: listMap.filter(x => x.kode_plant === item.kode_plant).length
      }))
      return response(res, 'success get spv arc', { result: rows })
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  saveSpv: async (req, res) => {
    try {
      const { value: results, error } = schemaSpv.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 400, false)
      }
      const spvArc = results.spv_arc || null
      if (spvArc !== null) {
        const findSpv = await user.findOne({ where: { fullname: spvArc, level: LEVEL_SPV_ARC } })
        if (!findSpv) {
          return response(res, 'SPV ARC tidak ditemukan di master user', {}, 400, false)
        }
      }
      await finance.update({ spv_arc: spvArc }, { where: { kode_plant: [...new Set(results.areas)] } })
      return response(res, 'success save spv arc')
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  deleteMapping: async (req, res) => {
    try {
      const { username } = req.params
      const count = await mapping_arc.destroy({ where: { username } })
      if (count === 0) {
        return response(res, 'Mapping tidak ditemukan', {}, 404, false)
      }
      return response(res, 'success delete mapping arc')
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  // upload file "DATA TOKO COVER ARC": KODE PLANT | PROFIT CENTER | AREA | PIC ARC | EMAIL
  // user dicocokkan lewat email, mapping yang sudah ada dilewati (tidak menghapus mapping lama)
  uploadMapping: async (req, res) => {
    uploadMaster(req, res, async function (err) {
      try {
        if (err instanceof multer.MulterError) {
          return response(res, err.message, {}, 500, false)
        } else if (err) {
          return response(res, err.message, {}, 401, false)
        }
        if (!req.files || req.files.length === 0) {
          return response(res, 'File master tidak ditemukan', {}, 400, false)
        }
        const dokumen = `assets/masters/${req.files[0].filename}`
        const rows = await readXlsxFile(dokumen)
        const header = (rows[0] || []).map(x => cleanText(x).toUpperCase())
        if (headerMaster.some((x, i) => header[i] !== x)) {
          hapusFile(dokumen)
          return response(res, `Format kolom harus: ${headerMaster.join(', ')}`, {}, 400, false)
        }
        const dataRows = rows.slice(1)
          .map((x, i) => ({ baris: i + 2, kode_plant: cleanText(x[0]), email: cleanText(x[4]).toLowerCase(), nama: cleanText(x[3]) }))
          .filter(x => x.kode_plant !== '' && x.email !== '')

        const listEmail = [...new Set(dataRows.map(x => x.email))]
        const listKode = [...new Set(dataRows.map(x => x.kode_plant))]
        if (dataRows.length === 0) {
          hapusFile(dokumen)
          return response(res, 'File tidak berisi data mapping', {}, 400, false)
        }
        const listUser = await user.findAll({
          where: { email: listEmail },
          attributes: ['username', 'email', 'level']
        })
        const listArea = await finance.findAll({
          where: { kode_plant: listKode },
          attributes: ['kode_plant']
        })
        const listAda = await mapping_arc.findAll({ attributes: ['username', 'kode_plant'] })

        const gagal = []
        const baru = []
        let lewati = 0
        dataRows.forEach(item => {
          const findUser = listUser.filter(x => `${x.email}`.toLowerCase() === item.email)
          if (findUser.length !== 1) {
            gagal.push({ ...item, alasan: findUser.length === 0 ? 'Email tidak ada di master user' : 'Email dipakai lebih dari 1 user' })
          } else if (parseInt(findUser[0].level) !== 5) {
            gagal.push({ ...item, alasan: 'User bukan level area (5)' })
          } else if (listArea.find(x => x.kode_plant === item.kode_plant) === undefined) {
            gagal.push({ ...item, alasan: 'Kode plant tidak ada di master finance' })
          } else {
            const data = { username: findUser[0].username, kode_plant: item.kode_plant }
            const cek = [...listAda, ...baru].find(x => x.username === data.username && x.kode_plant === data.kode_plant)
            if (cek) {
              lewati++
            } else {
              baru.push(data)
            }
          }
        })
        if (baru.length > 0) {
          await mapping_arc.bulkCreate(baru)
        }
        hapusFile(dokumen)
        return response(res, 'successfully upload mapping arc', { tambah: baru.length, lewati, gagal })
      } catch (error) {
        return response(res, error.message, {}, 500, false)
      }
    })
  }
}
