const { glikk } = require('../models')
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
  addGlikk: async (req, res) => {
    try {
      const schema = joi.object({
        kode_dist: joi.string().required(),
        profit_center: joi.string().required(),
        area: joi.string().required(),
        system: joi.string().required(),
        gl_account: joi.string().required(),
        gl_name: joi.string().required()
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 404, false)
      } else {
        const findNameGlikk = await glikk.findOne({
          where: {
            profit_center: { [Op.like]: `%${results.profit_center}` }
          }
        })
        if (findNameGlikk && (findNameGlikk.profit_center === results.profit_center || findNameGlikk.kode_dist === results.kode_dist)) {
          return response(res, 'nama glikk telah terdftar', {}, 404, false)
        } else {
          const createGlikk = await glikk.create(results)
          if (createGlikk) {
            return response(res, 'success create glikk')
          } else {
            return response(res, 'false create glikk', {}, 404, false)
          }
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  updateGlikk: async (req, res) => {
    try {
      const id = req.params.id
      const schema = joi.object({
        kode_dist: joi.string().required(),
        profit_center: joi.string().required(),
        area: joi.string().required(),
        system: joi.string().required(),
        gl_account: joi.string().required(),
        gl_name: joi.string().required()
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 404, false)
      } else {
        const findNameGlikk = await glikk.findOne({
          where: {
            profit_center: { [Op.like]: `%${results.profit_center}` },
            [Op.not]: {
              id: id
            }
          }
        })
        if (findNameGlikk && (findNameGlikk.profit_center === results.profit_center || findNameGlikk.kode_dist === results.kode_dist)) {
          return response(res, 'nama glikk telah terdftar', {}, 404, false)
        } else {
          const findGlikk = await glikk.findByPk(id)
          if (findGlikk) {
            const updateGlikk = await findGlikk.update(results)
            if (updateGlikk) {
              return response(res, 'success create glikk')
            } else {
              return response(res, 'false create glikk', {}, 404, false)
            }
          } else {
            return response(res, 'false create glikk', {}, 404, false)
          }
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  uploadMasterGlikk: async (req, res) => {
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
          const cek = [
            'KODE DIST',
            'PROFIT CENTER',
            'NAMA AREA',
            'SAP/SCYLLA',
            'GL Account',
            'GL Name'
          ]
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
              cost.push(`profit center ${a[1]} dan gl Account ${a[4]}`)
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
                const dataGlikk = rows[i]
                const select = await glikk.findOne({
                  where: {
                    [Op.and]: [
                      { kode_dist: { [Op.like]: `%${dataGlikk[0]}%` } },
                      { profit_center: { [Op.like]: `%${dataGlikk[1]}%` } }
                    ]
                  }
                })
                const data = {
                  kode_dist: dataGlikk[0],
                  profit_center: dataGlikk[1],
                  area: dataGlikk[2],
                  system: dataGlikk[3],
                  gl_account: dataGlikk[4],
                  gl_name: dataGlikk[5]
                }
                if (select) {
                  const upbank = await select.update(data)
                  if (upbank) {
                    arr.push(1)
                  }
                } else {
                  const createGlikk = await glikk.create(data)
                  if (createGlikk) {
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
  getGlikk: async (req, res) => {
    try {
      const findGlikk = await glikk.findAll()
      if (findGlikk.length > 0) {
        return response(res, 'succes get glikk', { result: findGlikk, length: findGlikk.length })
      } else {
        return response(res, 'failed get glikk', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getAllGlikk: async (req, res) => {
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
        const findLimit = await glikk.findAll()
        limit = findLimit.length
      } else {
        limit = parseInt(limit)
      }
      if (!page) {
        page = 1
      } else {
        page = parseInt(page)
      }
      const findGlikk = await glikk.findAndCountAll({
        where: {
          [Op.or]: [
            { kode_dist: { [Op.like]: `%${searchValue}%` } },
            { profit_center: { [Op.like]: `%${searchValue}%` } },
            { area: { [Op.like]: `%${searchValue}%` } }
          ]
        },
        order: [[sortValue, 'ASC']],
        limit: limit,
        offset: (page - 1) * limit
      })
      const pageInfo = pagination('/glikk/get', req.query, page, limit, findGlikk.count)
      if (findGlikk.rows.length > 0) {
        return response(res, 'succes get glikk', { result: findGlikk, pageInfo })
      } else {
        return response(res, 'failed get glikk', { findGlikk }, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getDetailGlikk: async (req, res) => {
    try {
      const id = req.params.id
      const findGlikk = await glikk.findByPk(id)
      if (findGlikk) {
        return response(res, 'succes get detail glikk', { result: findGlikk })
      } else {
        return response(res, 'failed get glikk', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  deleteGlikk: async (req, res) => {
    try {
      const id = req.params.id
      const findGlikk = await glikk.findByPk(id)
      if (findGlikk) {
        const delGlikk = await findGlikk.destroy()
        if (delGlikk) {
          return response(res, 'succes delete glikk', { result: findGlikk })
        } else {
          return response(res, 'failed destroy glikk', {}, 404, false)
        }
      } else {
        return response(res, 'failed get glikk', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  exportSqlGlikk: async (req, res) => {
    try {
      const result = await glikk.findAll()
      if (result) {
        const workbook = new excel.Workbook()
        const worksheet = workbook.addWorksheet()
        const arr = []
        const header = [
          'KODE DIST',
          'PROFIT CENTER',
          'NAMA AREA',
          'SAP/SCYLLA',
          'GL Account',
          'GL Name'
        ]
        const key = ['kode_dist', 'profit_center', 'area', 'system', 'gl_account', 'gl_name']
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
          const name = new Date().getTime().toString().concat('-glikk').concat('.xlsx')
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
      const findGlikk = await glikk.findAll()
      if (findGlikk) {
        const temp = []
        for (let i = 0; i < findGlikk.length; i++) {
          const findDel = await glikk.findByPk(findGlikk[i].id)
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
