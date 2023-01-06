const { bank } = require('../models')
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

module.exports = {
  addBank: async (req, res) => {
    try {
      const schema = joi.object({
        name: joi.string().required(),
        digit: joi.string().required(),
        kode_bank: joi.string().required()
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 404, false)
      } else {
        const findNameBank = await bank.findOne({
          where: {
            [Op.or]: [
              { kode_bank: { [Op.like]: `%${results.kode_bank}` } },
              { name: { [Op.like]: `%${results.name}` } }
            ]
          }
        })
        if (findNameBank && (findNameBank.name === results.name || findNameBank.kode_bank === results.kode_bank)) {
          return response(res, 'nama bank telah terdftar', {}, 404, false)
        } else {
          const createBank = await bank.create(results)
          if (createBank) {
            return response(res, 'success create bank')
          } else {
            return response(res, 'false create bank', {}, 404, false)
          }
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  updateBank: async (req, res) => {
    try {
      const id = req.params.id
      const schema = joi.object({
        name: joi.string().required(),
        digit: joi.string().required(),
        kode_bank: joi.string().required()
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 404, false)
      } else {
        const findNameBank = await bank.findOne({
          where: {
            [Op.or]: [
              { kode_bank: { [Op.like]: `%${results.kode_bank}` } },
              { name: { [Op.like]: `%${results.name}` } }
            ],
            [Op.not]: {
              id: id
            }
          }
        })
        if (findNameBank && (findNameBank.name === results.name || findNameBank.kode_bank === results.kode_bank)) {
          return response(res, 'nama bank telah terdaftar', {}, 404, false)
        } else {
          const findBank = await bank.findByPk(id)
          if (findBank) {
            const updateBank = await findBank.update(results)
            if (updateBank) {
              return response(res, 'success create bank')
            } else {
              return response(res, 'false create bank', {}, 404, false)
            }
          } else {
            return response(res, 'false create bank', {}, 404, false)
          }
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  uploadMasterBank: async (req, res) => {
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
          const cek = ['NAMA BANK', 'JUMLAH DIGIT', 'KODE BANK']
          const valid = rows[0]
          for (let i = 0; i < cek.length; i++) {
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
              cost.push(`Nama bank ${a[0]} kode bank ${a[2]}`)
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
                const dataBank = rows[i]
                const select = await bank.findOne({
                  where: {
                    [Op.or]: [
                      { kode_bank: { [Op.like]: `%${dataBank[2]}%` } },
                      { name: { [Op.like]: `%${dataBank[0]}%` } }
                    ]
                  }
                })
                if (select) {
                  const data = {
                    name: dataBank[0],
                    digit: dataBank[1],
                    kode_bank: dataBank[2]
                  }
                  const upbank = await select.update(data)
                  if (upbank) {
                    arr.push(1)
                  }
                } else {
                  const data = {
                    name: dataBank[0],
                    digit: dataBank[1],
                    kode_bank: dataBank[2]
                  }
                  const createBank = await bank.create(data)
                  if (createBank) {
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
  getAllBank: async (req, res) => {
    try {
      const findBank = await bank.findAll()
      if (findBank.length > 0) {
        return response(res, 'succes get bank', { result: findBank, length: findBank.length })
      } else {
        return response(res, 'failed get bank', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getBank: async (req, res) => {
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
      const findBank = await bank.findAndCountAll({
        where: {
          [Op.or]: [
            { name: { [Op.like]: `%${searchValue}%` } },
            { digit: { [Op.like]: `%${searchValue}%` } }
          ]
        },
        order: [[sortValue, 'ASC']],
        limit: limit,
        offset: (page - 1) * limit
      })
      const pageInfo = pagination('/bank/get', req.query, page, limit, findBank.count)
      if (findBank.rows.length > 0) {
        return response(res, 'succes get bank', { result: findBank, pageInfo })
      } else {
        return response(res, 'failed get bank', { findBank }, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getDetailBank: async (req, res) => {
    try {
      const id = req.params.id
      const findBank = await bank.findByPk(id)
      if (findBank) {
        return response(res, 'succes get detail bank', { result: findBank })
      } else {
        return response(res, 'failed get bank', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  deleteBank: async (req, res) => {
    try {
      const id = req.params.id
      const findBank = await bank.findByPk(id)
      if (findBank) {
        const delBank = await findBank.destroy()
        if (delBank) {
          return response(res, 'succes delete bank', { result: findBank })
        } else {
          return response(res, 'failed destroy bank', {}, 404, false)
        }
      } else {
        return response(res, 'failed get bank', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  exportSqlBank: async (req, res) => {
    try {
      const result = await bank.findAll()
      if (result) {
        const workbook = new excel.Workbook()
        const worksheet = workbook.addWorksheet()
        const arr = []
        const header = ['NAMA BANK', 'JUMLAH DIGIT', 'KODE BANK']
        const key = ['name', 'digit']
        for (let i = 0; i < header.length; i++) {
          let temp = { header: header[i], key: key[i] }
          arr.push(temp)
          temp = {}
        }
        worksheet.columns = arr
        const cek = worksheet.addRows(result)
        if (cek) {
          const name = new Date().getTime().toString().concat('-bank').concat('.xlsx')
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
      const findBank = await bank.findAll()
      if (findBank) {
        const temp = []
        for (let i = 0; i < findBank.length; i++) {
          const findDel = await bank.findByPk(findBank[i].id)
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
