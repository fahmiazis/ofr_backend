const { finance } = require('../models')
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
  addFinance: async (req, res) => {
    try {
      const schema = joi.object({
        kode_plant: joi.string().required(),
        profit_center: joi.string().required(),
        region: joi.string().required(),
        inisial: joi.string().required(),
        pic_console: joi.string().required(),
        rek_spending: joi.string().required(),
        rek_zba: joi.string().required(),
        rek_bankcoll: joi.string().required(),
        rekening: joi.string().allow(''),
        type_live: joi.string().required(),
        gl_kk: joi.string().required()
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 404, false)
      } else {
        const findNameFinance = await finance.findOne({
          where: {
            kode_plant: { [Op.like]: `%${results.kode_plant}` }
          }
        })
        if (findNameFinance) {
          return response(res, 'kode_plant finance telah terdftar', {}, 404, false)
        } else {
          const createFinance = await finance.create(results)
          if (createFinance) {
            return response(res, 'success create finance')
          } else {
            return response(res, 'false create finance', {}, 404, false)
          }
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  updateFinance: async (req, res) => {
    try {
      const id = req.params.id
      const schema = joi.object({
        kode_plant: joi.string().required(),
        profit_center: joi.string().required(),
        region: joi.string().required(),
        inisial: joi.string().required(),
        pic_console: joi.string().required(),
        rek_spending: joi.string().required(),
        rek_zba: joi.string().required(),
        rek_bankcoll: joi.string().required(),
        rekening: joi.string().allow(''),
        type_live: joi.string().required(),
        gl_kk: joi.string().required()
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 404, false)
      } else {
        const findNameFinance = await finance.findOne({
          where: {
            kode_plant: { [Op.like]: `%${results.kode_plant}` },
            [Op.not]: {
              id: id
            }
          }
        })
        if (findNameFinance) {
          return response(res, 'kode_plant finance telah terdftar', {}, 404, false)
        } else {
          const findFinance = await finance.findByPk(id)
          if (findFinance) {
            const updateFinance = await findFinance.update(results)
            if (updateFinance) {
              return response(res, 'success create finance')
            } else {
              return response(res, 'false create finance', {}, 404, false)
            }
          } else {
            return response(res, 'false create finance', {}, 404, false)
          }
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  uploadMasterFinance: async (req, res) => {
    const level = req.user.level // eslint-disable-line
    // if (level === 1) {
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
        const cek = ['KODE PLANT', 'PC', 'REGION', 'INISIAL', 'PIC CONSOLE', 'NO REK SPENDING CARD', 'NO REK ZBA', 'NO REK BANK COLL', 'LIVE/NON LIVE', 'GL KK LIVE/ NON LIVE']
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
            cost.push(`kode ${a[0]}`)
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
              const dataFinance = rows[i]
              const select = await finance.findOne({
                where: {
                  [Op.and]: [
                    { kode_plant: { [Op.like]: `%${dataFinance[0]}%` } }
                  ]
                }
              })
              const data = {
                kode_plant: dataFinance[0],
                profit_center: dataFinance[1],
                region: dataFinance[2],
                inisial: dataFinance[3],
                pic_console: dataFinance[4],
                rek_spending: dataFinance[5],
                rek_zba: dataFinance[6],
                rek_bankcoll: dataFinance[7],
                type_live: dataFinance[8],
                gl_kk: dataFinance[9]
              }
              if (select) {
                const upbank = await select.update(data)
                if (upbank) {
                  arr.push(1)
                }
              } else {
                const createFinance = await finance.create(data)
                if (createFinance) {
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
    // } else {
    //   return response(res, "You're not super administrator", {}, 404, false)
    // }
  },
  getFinance: async (req, res) => {
    try {
      // const kode = req.user.kode
      const findFinance = await finance.findAll()
      if (findFinance.length > 0) {
        return response(res, 'succes get finance', { result: findFinance, length: findFinance.length })
      } else {
        return response(res, 'failed get finance', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getAllFinance: async (req, res) => {
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
      const findFinance = await finance.findAndCountAll({
        where: {
          [Op.or]: [
            { kode_plant: { [Op.like]: `%${searchValue}%` } },
            { profit_center: { [Op.like]: `%${searchValue}%` } },
            { region: { [Op.like]: `%${searchValue}%` } },
            { inisial: { [Op.like]: `%${searchValue}%` } },
            { pic_console: { [Op.like]: `%${searchValue}%` } },
            { rek_spending: { [Op.like]: `%${searchValue}%` } }
          ]
        },
        order: [[sortValue, 'ASC']],
        limit: limit,
        offset: (page - 1) * limit
      })
      const pageInfo = pagination('/finance/get', req.query, page, limit, findFinance.count)
      if (findFinance) {
        return response(res, 'succes get finance', { result: findFinance, pageInfo })
      } else {
        return response(res, 'failed get finance', { result: [], pageInfo })
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getDetailFinance: async (req, res) => {
    try {
      const id = req.params.id
      const findFinance = await finance.findByPk(id)
      if (findFinance) {
        return response(res, 'succes get detail finance', { result: findFinance })
      } else {
        return response(res, 'failed get finance', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  deleteFinance: async (req, res) => {
    try {
      const id = req.params.id
      const findFinance = await finance.findByPk(id)
      if (findFinance) {
        const delFinance = await findFinance.destroy()
        if (delFinance) {
          return response(res, 'succes delete finance', { result: findFinance })
        } else {
          return response(res, 'failed destroy finance', {}, 404, false)
        }
      } else {
        return response(res, 'failed get finance', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  exportSqlFinance: async (req, res) => {
    try {
      const result = await finance.findAll()
      if (result) {
        const workbook = new excel.Workbook()
        const worksheet = workbook.addWorksheet()
        const arr = []
        const header = ['KODE PLANT', 'PC', 'REGION', 'INISIAL', 'PIC CONSOLE', 'NO REK SPENDING CARD', 'NO REK ZBA', 'NO REK BANK COLL', 'LIVE/NON LIVE', 'GL KK LIVE/ NON LIVE']
        const key = ['kode_plant', 'profit_center', 'region', 'inisial', 'pic_console', 'rek_spending', 'rek_zba', 'rek_bankcoll', 'type_live', 'gl_kk']
        for (let i = 0; i < header.length; i++) {
          let temp = { header: header[i], key: key[i] }
          arr.push(temp)
          temp = {}
        }
        worksheet.columns = arr
        const cek = worksheet.addRows(result)
        if (cek) {
          const name = new Date().getTime().toString().concat('-finance').concat('.xlsx')
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
      const findFinance = await finance.findAll()
      if (findFinance) {
        const temp = []
        for (let i = 0; i < findFinance.length; i++) {
          const findDel = await finance.findByPk(findFinance[i].id)
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
