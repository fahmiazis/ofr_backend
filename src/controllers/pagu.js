const { pagu, finance } = require('../models')
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
  addPagu: async (req, res) => {
    try {
      const schema = joi.object({
        profit_center: joi.string().required(),
        area: joi.string().required(),
        pagu: joi.string().required()
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 404, false)
      } else {
        const findNamePagu = await pagu.findOne({
          where: {
            profit_center: { [Op.like]: `%${results.profit_center}` }
          }
        })
        if (findNamePagu && (findNamePagu.profit_center === results.profit_center)) {
          return response(res, 'nama pagu telah terdftar', {}, 404, false)
        } else {
          const createPagu = await pagu.create(results)
          if (createPagu) {
            return response(res, 'success create pagu')
          } else {
            return response(res, 'false create pagu', {}, 404, false)
          }
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  updatePagu: async (req, res) => {
    try {
      const id = req.params.id
      const schema = joi.object({
        profit_center: joi.string().required(),
        area: joi.string().required(),
        pagu: joi.string().required()
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 404, false)
      } else {
        const findNamePagu = await pagu.findOne({
          where: {
            profit_center: { [Op.like]: `%${results.profit_center}` },
            [Op.not]: {
              id: id
            }
          }
        })
        if (findNamePagu && (findNamePagu.profit_center === results.profit_center)) {
          return response(res, 'nama pagu telah terdftar', {}, 404, false)
        } else {
          const findPagu = await pagu.findByPk(id)
          if (findPagu) {
            const updatePagu = await findPagu.update(results)
            if (updatePagu) {
              return response(res, 'success create pagu')
            } else {
              return response(res, 'false create pagu', {}, 404, false)
            }
          } else {
            return response(res, 'false create pagu', {}, 404, false)
          }
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  uploadMasterPagu: async (req, res) => {
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
          const cek = ['PROFIT CENTER', 'AREA', 'PAGU']
          const valid = rows[0]
          for (let i = 0; i < cek.length; i++) {
            console.log(valid[i] === cek[i])
            if (valid[i] === cek[i]) {
              count.push(1)
            }
          }
          console.log(count.length)
          if (count.length === cek.length) {
            const cost = []
            const kode = []
            for (let i = 1; i < rows.length; i++) {
              const a = rows[i]
              kode.push(`${a[0]}`)
              cost.push(`Profit center ${a[0]}`)
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
                const dataPagu = rows[i]
                const select = await pagu.findOne({
                  where: {
                    profit_center: { [Op.like]: `%${dataPagu[0]}%` }
                  }
                })
                if (select) {
                  const data = {
                    profit_center: dataPagu[0],
                    area: dataPagu[1],
                    pagu: dataPagu[2]
                  }
                  const upbank = await select.update(data)
                  if (upbank) {
                    arr.push(1)
                  }
                } else {
                  const data = {
                    profit_center: dataPagu[0],
                    area: dataPagu[1],
                    pagu: dataPagu[2]
                  }
                  const createPagu = await pagu.create(data)
                  if (createPagu) {
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
  getPagu: async (req, res) => {
    try {
      const kode = req.user.kode
      const findDepo = await finance.findOne({
        where: {
          kode_plant: { [Op.like]: `%${kode}` }
        }
      })
      if (findDepo) {
        return response(res, 'succes get tarif', { result: findDepo })
      } else {
        return response(res, 'failed get tarif', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getAllPagu: async (req, res) => {
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
      } else {
        limit = parseInt(limit)
      }
      if (!page) {
        page = 1
      } else {
        page = parseInt(page)
      }
      const findPagu = await pagu.findAndCountAll({
        where: {
          [Op.or]: [
            { pagu: { [Op.like]: `%${searchValue}%` } },
            { area: { [Op.like]: `%${searchValue}%` } },
            { profit_center: { [Op.like]: `%${searchValue}%` } }
          ]
        },
        order: [[sortValue, 'ASC']],
        limit: limit,
        offset: (page - 1) * limit
      })
      const pageInfo = pagination('/pagu/get', req.query, page, limit, findPagu.count)
      if (findPagu) {
        return response(res, 'succes get pagu', { result: findPagu, pageInfo })
      } else {
        return response(res, 'failed get pagu', { findPagu }, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getDetailPagu: async (req, res) => {
    try {
      const id = req.params.id
      const findPagu = await pagu.findByPk(id)
      if (findPagu) {
        return response(res, 'succes get detail pagu', { result: findPagu })
      } else {
        return response(res, 'failed get pagu', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  deletePagu: async (req, res) => {
    try {
      const id = req.params.id
      const findPagu = await pagu.findByPk(id)
      if (findPagu) {
        const delPagu = await findPagu.destroy()
        if (delPagu) {
          return response(res, 'succes delete pagu', { result: findPagu })
        } else {
          return response(res, 'failed destroy pagu', {}, 404, false)
        }
      } else {
        return response(res, 'failed get pagu', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  exportSqlPagu: async (req, res) => {
    try {
      const result = await pagu.findAll()
      if (result) {
        const workbook = new excel.Workbook()
        const worksheet = workbook.addWorksheet()
        const arr = []
        const header = ['PROFIT CENTER', 'AREA', 'PAGU']
        const key = ['profit_center', 'area', 'pagu']
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
          const name = new Date().getTime().toString().concat('-pagu').concat('.xlsx')
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
      const findPagu = await pagu.findAll()
      if (findPagu) {
        const temp = []
        for (let i = 0; i < findPagu.length; i++) {
          const findDel = await pagu.findByPk(findPagu[i].id)
          if (findDel) {
            await findDel.destroy()
            temp.push(1)
          }
        }
        if (temp.length > 0) {
          return response(res, 'success delete all', {}, 404, false)
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
