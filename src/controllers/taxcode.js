const { taxcode } = require('../models')
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
  addTaxcode: async (req, res) => {
    try {
      const schema = joi.object({
        tax_code: joi.string().required(),
        tax_type: joi.string().required(),
        keterangan: joi.string().required(),
        stat_npwp: joi.string().required(),
        kode_obpajak: joi.string().required(),
        tax_objdesc: joi.string().required(),
        pph: joi.string().required(),
        income: joi.string().allow(''),
        tax_base: joi.string().required(),
        tarif_asis: joi.string().required(),
        transaksi: joi.string().required()
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 404, false)
      } else {
        const findNameTaxcode = await taxcode.findOne({
          where: {
            tax_code: { [Op.like]: `%${results.tax_code}` }
          }
        })
        if (findNameTaxcode) {
          return response(res, 'tax_code taxcode telah terdftar', {}, 404, false)
        } else {
          const createTaxcode = await taxcode.create(results)
          if (createTaxcode) {
            return response(res, 'success create taxcode')
          } else {
            return response(res, 'false create taxcode', {}, 404, false)
          }
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  updateTaxcode: async (req, res) => {
    try {
      const id = req.params.id
      const schema = joi.object({
        tax_code: joi.string().required(),
        tax_type: joi.string().required(),
        keterangan: joi.string().required(),
        stat_npwp: joi.string().required(),
        kode_obpajak: joi.string().required(),
        tax_objdesc: joi.string().required(),
        pph: joi.string().required(),
        income: joi.string().allow(''),
        tax_base: joi.string().required(),
        tarif_asis: joi.string().required(),
        transaksi: joi.string().required()
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 404, false)
      } else {
        const findNameTaxcode = await taxcode.findOne({
          where: {
            tax_code: { [Op.like]: `%${results.tax_code}` },
            [Op.not]: {
              id: id
            }
          }
        })
        if (findNameTaxcode) {
          return response(res, 'tax_code taxcode telah terdftar', {}, 404, false)
        } else {
          const findTaxcode = await taxcode.findByPk(id)
          if (findTaxcode) {
            const updateTaxcode = await findTaxcode.update(results)
            if (updateTaxcode) {
              return response(res, 'success create taxcode')
            } else {
              return response(res, 'false create taxcode', {}, 404, false)
            }
          } else {
            return response(res, 'false create taxcode', {}, 404, false)
          }
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  uploadMasterTaxcode: async (req, res) => {
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
        const cek = ['Tax Type', 'Tax Code', 'KETERANGAN TAX TYPE', 'NPWP/NON NPWP', 'Kode Objek Pajak', 'Tax Object Description', 'PPH Pasal', 'Bruto Biaya/Income', 'Tax Base', 'TARIF AS IS', 'TRANSAKSI']
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
            kode.push(`${a[1]}`)
            cost.push(`tax kode ${a[1]}`)
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
              const dataTaxcode = rows[i]
              const select = await taxcode.findOne({
                where: {
                  [Op.and]: [
                    { tax_code: { [Op.like]: `%${dataTaxcode[0]}%` } }
                  ]
                }
              })
              const data = {
                tax_code: dataTaxcode[1],
                tax_type: dataTaxcode[0],
                keterangan: dataTaxcode[2],
                stat_npwp: dataTaxcode[3],
                kode_obpajak: dataTaxcode[4],
                tax_objdesc: dataTaxcode[5],
                pph: dataTaxcode[6],
                income: dataTaxcode[7],
                tax_base: dataTaxcode[8],
                tarif_asis: dataTaxcode[9],
                transaksi: dataTaxcode[10]
              }
              if (select) {
                const upbank = await select.update(data)
                if (upbank) {
                  arr.push(1)
                }
              } else {
                const createTaxcode = await taxcode.create(data)
                if (createTaxcode) {
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
  getTaxcode: async (req, res) => {
    try {
      // const kode = req.user.kode
      const findTaxcode = await taxcode.findAll()
      if (findTaxcode.length > 0) {
        return response(res, 'succes get taxcode', { result: findTaxcode, length: findTaxcode.length })
      } else {
        return response(res, 'failed get taxcode', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getAllTaxcode: async (req, res) => {
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
      const findTaxcode = await taxcode.findAndCountAll({
        where: {
          [Op.or]: [
            { tax_code: { [Op.like]: `%${searchValue}%` } },
            { tax_type: { [Op.like]: `%${searchValue}%` } },
            { keterangan: { [Op.like]: `%${searchValue}%` } },
            { stat_npwp: { [Op.like]: `%${searchValue}%` } },
            { kode_obpajak: { [Op.like]: `%${searchValue}%` } },
            { tax_objdesc: { [Op.like]: `%${searchValue}%` } },
            { pph: { [Op.like]: `%${searchValue}%` } }
          ]
        },
        order: [[sortValue, 'ASC']],
        limit: limit,
        offset: (page - 1) * limit
      })
      const pageInfo = pagination('/taxcode/get', req.query, page, limit, findTaxcode.count)
      if (findTaxcode) {
        return response(res, 'succes get taxcode', { result: findTaxcode, pageInfo })
      } else {
        return response(res, 'failed get taxcode', { result: [], pageInfo })
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getDetailTaxcode: async (req, res) => {
    try {
      const id = req.params.id
      const findTaxcode = await taxcode.findByPk(id)
      if (findTaxcode) {
        return response(res, 'succes get detail taxcode', { result: findTaxcode })
      } else {
        return response(res, 'failed get taxcode', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  deleteTaxcode: async (req, res) => {
    try {
      const id = req.params.id
      const findTaxcode = await taxcode.findByPk(id)
      if (findTaxcode) {
        const delTaxcode = await findTaxcode.destroy()
        if (delTaxcode) {
          return response(res, 'succes delete taxcode', { result: findTaxcode })
        } else {
          return response(res, 'failed destroy taxcode', {}, 404, false)
        }
      } else {
        return response(res, 'failed get taxcode', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  exportSqlTaxcode: async (req, res) => {
    try {
      const result = await taxcode.findAll()
      if (result) {
        const workbook = new excel.Workbook()
        const worksheet = workbook.addWorksheet()
        const arr = []
        const header = ['KODE PLANT', 'PC', 'REGION', 'INISIAL', 'PIC CONSOLE', 'NO REK SPENDING CARD', 'NO REK ZBA', 'NO REK BANK COLL', 'LIVE/NON LIVE', 'GL KK LIVE/ NON LIVE']
        const key = ['tax_code', 'tax_type', 'stat_npwp', 'kode_obpajak', 'tax_objdesc', 'pph', 'income', 'tax_base', 'tarif_asis', 'transaksi']
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
          const name = new Date().getTime().toString().concat('-taxcode').concat('.xlsx')
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
      const findTaxcode = await taxcode.findAll()
      if (findTaxcode) {
        const temp = []
        for (let i = 0; i < findTaxcode.length; i++) {
          const findDel = await taxcode.findByPk(findTaxcode[i].id)
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
