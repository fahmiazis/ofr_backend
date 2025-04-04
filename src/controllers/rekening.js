const { rekening, depo } = require('../models')
const joi = require('joi')
const { Op } = require('sequelize')
const response = require('../helpers/response')
const fs = require('fs')
const { pagination } = require('../helpers/pagination')
const uploadMaster = require('../helpers/uploadMaster')
const readXlsxFile = require('read-excel-file/node')
const multer = require('multer')
const excel = require('exceljs')
const vs = require('fs-extra')
const { APP_URL } = process.env
const borderStyles = {
  top: { style: 'thin' },
  left: { style: 'thin' },
  bottom: { style: 'thin' },
  right: { style: 'thin' }
}

module.exports = {
  addRek: async (req, res) => {
    try {
      const schema = joi.object({
        kode_plant: joi.string().required(),
        no_rekening: joi.string().required(),
        type: joi.string().required(),
        bank: joi.string().required()
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 404, false)
      } else {
        const findRek = await rekening.findOne({
          where: {
            [Op.and]: [
              { kode_plant: { [Op.like]: `%${results.kode_plant}%` } },
              { type: { [Op.like]: `%${results.bank}%` } }
            ]
          }
        })
        if (findRek) {
          return response(res, 'nama rekening telah terdftar', {}, 404, false)
        } else {
          const createRek = await rekening.create(results)
          if (createRek) {
            return response(res, 'success create rekening')
          } else {
            return response(res, 'false create rekening', {}, 404, false)
          }
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  updateRek: async (req, res) => {
    try {
      const id = req.params.id
      const schema = joi.object({
        kode_plant: joi.string().required(),
        no_rekening: joi.string().required(),
        type: joi.string().required(),
        bank: joi.string().required()
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 404, false)
      } else {
        const findRek = await rekening.findOne({
          where: {
            [Op.and]: [
              { kode_plant: { [Op.like]: `%${results.kode_plant}%` } },
              { type: { [Op.like]: `%${results.bank}%` } }
            ],
            [Op.not]: {
              id: id
            }
          }
        })
        if (findRek) {
          return response(res, 'nama rekening telah terdaftar', {}, 404, false)
        } else {
          const findRek = await rekening.findByPk(id)
          if (findRek) {
            const updateRek = await findRek.update(results)
            if (updateRek) {
              return response(res, 'success update rekening')
            } else {
              return response(res, 'false update rekening', {}, 404, false)
            }
          } else {
            return response(res, 'false update rekening', {}, 404, false)
          }
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  uploadMasterRek: async (req, res) => {
    const level = req.user.level
    if (level === 1) {
      uploadMaster(req, res, async function (err) {
        try {
          if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_UNEXPECTED_FILE' && req.files.length === 0) {
              console.log(err.code === 'LIMIT_UNEXPECTED_FILE' && req.files.length > 0)
              return response(res, 'fieldname doesnt match', {}, 500, false)
            }
            return response(res, err.message, {}, 500, false)
          } else if (err) {
            return response(res, err.message, {}, 401, false)
          }
          const dokumen = `assets/masters/${req.files[0].filename}`
          const rows = await readXlsxFile(dokumen)
          const count = []
          const cek = ['KODE PLANT', 'NOMOR REKENING', 'TIPE REKENING', 'NAMA BANK']
          const valid = rows[0]
          for (let i = 0; i < cek.length; i++) {
            if (valid[i] === cek[i]) {
              count.push(1)
            }
          }
          if (count.length === cek.length) {
            const cost = []
            const kode = []
            for (let i = 1; i < rows.length; i++) {
              const a = rows[i]
              kode.push(`${a[0]}`)
              cost.push(`Kode plant ${a[0]}`)
            }
            const result = []
            const dupCost = {}

            cost.forEach(item => {
              if (!dupCost[item]) { dupCost[item] = 0 }
              dupCost[item] += 1
            })

            for (const prop in dupCost) {
              if (dupCost[prop] >= 2) {
                result.push(prop)
              }
            }

            if (result.length > 0) {
              return response(res, 'there is duplication in your file master', { result }, 404, false)
            } else {
              const arr = []
              rows.shift()
              for (let i = 0; i < rows.length; i++) {
                const dataRek = rows[i]
                const select = await rekening.findOne({
                  where: {
                    [Op.and]: [
                      { kode_plant: { [Op.like]: `%${dataRek[0]}%` } },
                      { type: { [Op.like]: `%${dataRek[2]}%` } }
                    ]
                  }
                })
                const data = {
                  kode_plant: dataRek[0],
                  no_rekening: dataRek[1],
                  type: dataRek[2],
                  bank: dataRek[3]
                }
                if (select) {
                  const upbank = await select.update(data)
                  if (upbank) {
                    arr.push(1)
                  }
                } else {
                  const createRek = await rekening.create(data)
                  if (createRek) {
                    arr.push(1)
                  }
                }
              }
              if (arr.length > 0) {
                fs.unlink(dokumen, function (err) {
                  if (err) throw err
                  console.log('success')
                })
                return response(res, 'successfully upload file master')
              } else {
                fs.unlink(dokumen, function (err) {
                  if (err) throw err
                  console.log('success')
                })
                return response(res, 'failed to upload file', {}, 404, false)
              }
            }
          } else {
            fs.unlink(dokumen, function (err) {
              if (err) throw err
              console.log('success')
            })
            return response(res, 'Failed to upload master file, please use the template provided', {}, 400, false)
          }
        } catch (error) {
          return response(res, error.message, {}, 500, false)
        }
      })
    } else {
      return response(res, "You're not super administrator", {}, 404, false)
    }
  },
  getAllRek: async (req, res) => {
    try {
      const kode = req.user.kode
      const { tipe } = req.query
      if (tipe === 'all') {
        const findRek = await rekening.findAll({
          include: [{
            model: depo,
            as: 'depo'
          }]
        })
        if (findRek.length > 0) {
          return response(res, 'succes get rekening', { result: findRek, length: findRek.length })
        } else {
          return response(res, 'failed get rekening', {}, 404, false)
        }
      } else {
        const findRek = await rekening.findAll({
          where: {
            kode_plant: { [Op.like]: `%${kode}%` }
          },
          include: [{
            model: depo,
            as: 'depo'
          }]
        })
        if (findRek.length > 0) {
          return response(res, 'succes get rekening', { result: findRek, length: findRek.length })
        } else {
          return response(res, 'failed get rekening', {}, 404, false)
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getRek: async (req, res) => {
    try {
      let { limit, page, search, sort } = req.query
      let searchValue = ''
      let sortValue = ''
      if (typeof search === 'object') {
        searchValue = Object.values(search)[0]
      } else {
        searchValue = search || ''
      }
      if (typeof sort === 'object') {
        sortValue = Object.values(sort)[0]
      } else {
        sortValue = sort || 'id'
      }
      if (!limit) {
        limit = 10
      } else if (limit === 'all') {
        const findLimit = await rekening.findAll()
        limit = findLimit.length
      } else {
        limit = parseInt(limit)
      }
      if (!page) {
        page = 1
      } else {
        page = parseInt(page)
      }
      const findRek = await rekening.findAndCountAll({
        where: {
          [Op.or]: [
            { kode_plant: { [Op.like]: `%${searchValue}%` } },
            { no_rekening: { [Op.like]: `%${searchValue}%` } },
            { type: { [Op.like]: `%${searchValue}%` } },
            { bank: { [Op.like]: `%${searchValue}%` } }
          ]
        },
        order: [[sortValue, 'ASC']],
        limit: limit,
        offset: (page - 1) * limit
      })
      const pageInfo = pagination('/rekening/get', req.query, page, limit, findRek.count)
      if (findRek.rows.length > 0) {
        return response(res, 'succes get rekening', { result: findRek, pageInfo })
      } else {
        return response(res, 'failed get rekening', { findRek }, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getDetailRek: async (req, res) => {
    try {
      const id = req.params.id
      const findRek = await rekening.findByPk(id)
      if (findRek) {
        return response(res, 'succes get detail rekening', { result: findRek })
      } else {
        return response(res, 'failed get rekening', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  deleteRek: async (req, res) => {
    try {
      const id = req.params.id
      const findRek = await rekening.findByPk(id)
      if (findRek) {
        const delRek = await findRek.destroy()
        if (delRek) {
          return response(res, 'succes delete rekening', { result: findRek })
        } else {
          return response(res, 'failed destroy rekening', {}, 404, false)
        }
      } else {
        return response(res, 'failed get rekening', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  exportSqlRek: async (req, res) => {
    try {
      const result = await rekening.findAll()
      if (result) {
        const workbook = new excel.Workbook()
        const worksheet = workbook.addWorksheet()
        const arr = []
        const header = ['KODE PLANT', 'NOMOR REKENING', 'TIPE REKENING', 'NAMA BANK']
        const key = ['kode_plant', 'no_rekening', 'type', 'bank']
        for (let i = 0; i < header.length; i++) {
          let temp = { header: header[i], key: key[i] }
          arr.push(temp)
          temp = {}
        }
        worksheet.columns = arr
        worksheet.addRows(result)
        worksheet.eachRow({ includeEmpty: true }, function (row, rowNumber) {
          row.eachCell({ includeEmpty: true }, function (cell, colNumber) {
            cell.border = borderStyles
          })
        })

        worksheet.columns.forEach(column => {
          const lengths = column.values.map(v => v.toString().length)
          const maxLength = Math.max(...lengths.filter(v => typeof v === 'number'))
          column.width = maxLength + 5
        })
        const cek = [1]
        if (cek.length > 0) {
          const name = new Date().getTime().toString().concat('-rekening').concat('.xlsx')
          await workbook.xlsx.writeFile(name)
          vs.move(name, `assets/exports/${name}`, function (err) {
            if (err) {
              throw err
            }
            console.log('success')
          })
          return response(res, 'success', { link: `${APP_URL}/download/${name}` })
        } else {
          return response(res, 'failed create file', {}, 404, false)
        }
      } else {
        return response(res, 'failed', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  deleteAll: async (req, res) => {
    try {
      const findRek = await rekening.findAll()
      if (findRek) {
        const temp = []
        for (let i = 0; i < findRek.length; i++) {
          const findDel = await rekening.findByPk(findRek[i].id)
          if (findDel) {
            await findDel.destroy()
            temp.push(1)
          }
        }
        if (temp.length > 0) {
          return response(res, 'success delete all', { total: temp.length })
        } else {
          return response(res, 'failed delete all', {}, 404, false)
        }
      } else {
        return response(res, 'failed delete all', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  }
}
