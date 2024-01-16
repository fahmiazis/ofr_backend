const { veriftax, depo } = require('../models')
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
  addTarif: async (req, res) => {
    try {
      const schema = joi.object({
        system: joi.string().required(),
        gl_account: joi.string().required(),
        gl_name: joi.string().required(),
        jenis_transaksi: joi.string().required(),
        type_transaksi: joi.string().required(),
        jenis_pph: joi.string().required(),
        grouping: joi.string().required(),
        po: joi.string().required(),
        status_npwp: joi.string().required(),
        status_ident: joi.string().required(),
        tarif_pph: joi.string().required(),
        dpp_nongrossup: joi.string().required(),
        dpp_grossup: joi.string().required(),
        tax_type: joi.string().required(),
        tax_code: joi.string().required()
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 404, false)
      } else {
        const findTarif = await veriftax.findOne({
          where: {
            gl_account: { [Op.like]: `%${results.gl_account}` },
            jenis_transaksi: { [Op.like]: `%${results.jenis_transaksi}` },
            type_transaksi: { [Op.like]: `%${results.type_transaksi}` },
            status_npwp: { [Op.like]: `%${results.type_transaksi}` }
          }
        })
        if (findTarif) {
          return response(res, 'data telah terdftar', {}, 404, false)
        } else {
          const createTarif = await veriftax.create(results)
          if (createTarif) {
            return response(res, 'success create tarif')
          } else {
            return response(res, 'false create tarif', {}, 404, false)
          }
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  updateTarif: async (req, res) => {
    try {
      const id = req.params.id
      const schema = joi.object({
        system: joi.string().required(),
        gl_account: joi.string().required(),
        gl_name: joi.string().required(),
        jenis_transaksi: joi.string().required(),
        type_transaksi: joi.string().required(),
        jenis_pph: joi.string().required(),
        grouping: joi.string().required(),
        po: joi.string().required(),
        status_npwp: joi.string().required(),
        status_ident: joi.string().required(),
        tarif_pph: joi.string().required(),
        dpp_nongrossup: joi.string().required(),
        dpp_grossup: joi.string().required(),
        tax_type: joi.string().required(),
        tax_code: joi.string().required()
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 404, false)
      } else {
        const findTarif = await veriftax.findOne({
          where: {
            gl_account: { [Op.like]: `%${results.gl_account}` },
            jenis_transaksi: { [Op.like]: `%${results.jenis_transaksi}` },
            type_transaksi: { [Op.like]: `%${results.type_transaksi}` },
            status_npwp: { [Op.like]: `%${results.status_npwp}` },
            [Op.not]: {
              id: id
            }
          }
        })
        if (findTarif) {
          return response(res, 'data telah terdaftar', {}, 404, false)
        } else {
          const findTarif = await veriftax.findByPk(id)
          if (findTarif) {
            const updateTarif = await findTarif.update(results)
            if (updateTarif) {
              return response(res, 'success update tarif')
            } else {
              return response(res, 'false update tarif', {}, 404, false)
            }
          } else {
            return response(res, 'false update tarif', {}, 404, false)
          }
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  uploadMasterTarif: async (req, res) => {
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
        const cek = [
          'SAP/SCYLLA',
          'GL Account',
          'GL Jurnal',
          'GL Name',
          'Jenis Transaksi',
          'PO/NON PO',
          'Grouping',
          'OP/BADAN',
          'Jenis PPh',
          'NPWP/NIK',
          'WHT Tax Type',
          'WHT Tax Code',
          'Tarif PPh',
          'Tarif DPP Non Grossup',
          'Tarif DPP Grossup'
        ]
        const valid = rows[0]
        for (let i = 0; i < cek.length; i++) {
          console.log(valid[i], cek[i])
          console.log(valid[i] === cek[i])
          if (valid[i] === cek[i]) {
            count.push(1)
          }
        }
        if (count.length === cek.length) {
          const cost = []
          const kode = []
          for (let i = 1; i < rows.length; i++) {
            // const a = rows[i]
            kode.push(`${[i]}`)
            cost.push(`Kode plant ${[i]}`)
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
              const dataTarif = rows[i]
              const select = await veriftax.findOne({
                where: {
                  gl_account: { [Op.like]: `%${dataTarif[1]}` },
                  jenis_transaksi: { [Op.like]: `%${dataTarif[4]}` },
                  type_transaksi: { [Op.like]: `%${dataTarif[7]}` },
                  status_npwp: { [Op.like]: `%${dataTarif[9]}` }
                }
              })
              const data = {
                system: dataTarif[0],
                gl_account: dataTarif[1],
                gl_jurnal: dataTarif[2],
                gl_name: dataTarif[3],
                jenis_transaksi: dataTarif[4],
                po: dataTarif[5],
                grouping: dataTarif[6],
                type_transaksi: dataTarif[7],
                jenis_pph: dataTarif[8],
                status_npwp: dataTarif[9],
                tax_type: dataTarif[10],
                tax_code: dataTarif[11],
                tarif_pph: parseFloat(dataTarif[12]) + '%',
                dpp_nongrossup: parseFloat(dataTarif[13]) + '%',
                dpp_grossup: parseFloat(dataTarif[14]) + '%'
              }
              if (select) {
                const upverif = await select.update(data)
                if (upverif) {
                  arr.push(1)
                }
              } else {
                const createTarif = await veriftax.create(data)
                if (createTarif) {
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
  getAllTarif: async (req, res) => {
    try {
      const kode = req.user.kode
      const findDepo = await depo.findOne({
        where: {
          kode_plant: { [Op.like]: `%${kode}` }
        }
      })
      if (findDepo) {
        const findTarif = await veriftax.findAll()
        if (findTarif.length > 0) {
          return response(res, 'succes get tarif', { result: findTarif, length: findTarif.length })
        } else {
          return response(res, 'failed get tarif', {}, 404, false)
        }
      } else {
        const findTarif = await veriftax.findAll()
        if (findTarif.length > 0) {
          return response(res, 'succes get tarif', { result: findTarif, length: findTarif.length })
        } else {
          return response(res, 'failed get tarif', {}, 404, false)
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getTarif: async (req, res) => {
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
      const findTarif = await veriftax.findAndCountAll({
        where: {
          [Op.or]: [
            { system: { [Op.like]: `%${searchValue}%` } },
            { gl_account: { [Op.like]: `%${searchValue}%` } },
            { gl_name: { [Op.like]: `%${searchValue}%` } },
            { jenis_transaksi: { [Op.like]: `%${searchValue}%` } },
            { type_transaksi: { [Op.like]: `%${searchValue}%` } },
            { jenis_pph: { [Op.like]: `%${searchValue}%` } },
            { status_npwp: { [Op.like]: `%${searchValue}%` } },
            { tax_type: { [Op.like]: `%${searchValue}%` } },
            { tax_code: { [Op.like]: `%${searchValue}%` } },
            { grouping: { [Op.like]: `%${searchValue}` } },
            { po: { [Op.like]: `%${searchValue}` } }
          ]
        },
        order: [[sortValue, 'ASC']],
        limit: limit,
        offset: (page - 1) * limit
      })
      const pageInfo = pagination('/tarif/get', req.query, page, limit, findTarif.count)
      if (findTarif) {
        return response(res, 'succes get tarif', { result: findTarif, pageInfo })
      } else {
        return response(res, 'failed get tarif', { findTarif }, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getDetailTarif: async (req, res) => {
    try {
      const id = req.params.id
      const findTarif = await veriftax.findByPk(id)
      if (findTarif) {
        return response(res, 'succes get detail tarif', { result: findTarif })
      } else {
        return response(res, 'failed get tarif', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  deleteTarif: async (req, res) => {
    try {
      const id = req.params.id
      const findTarif = await veriftax.findByPk(id)
      if (findTarif) {
        const delTarif = await findTarif.destroy()
        if (delTarif) {
          return response(res, 'succes delete tarif', { result: findTarif })
        } else {
          return response(res, 'failed destroy tarif', {}, 404, false)
        }
      } else {
        return response(res, 'failed get tarif', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  exportSqlTarif: async (req, res) => {
    try {
      const result = await veriftax.findAll()
      if (result) {
        const workbook = new excel.Workbook()
        const worksheet = workbook.addWorksheet()
        const arr = []
        const header = ['SAP/REDPINE', 'GL Account', 'GL Jurnal', 'GL Name', 'Jenis Transaksi', 'PO/NON PO', 'Grouping', 'OP/BADAN', 'Jenis PPh', 'NPWP/NIK', 'WHT Tax Type', 'WHT Tax Code', 'Tarif PPh', 'Tarif DPP Non Grossup', 'Tarif DPP Grossup']
        const key = ['system', 'gl_account', 'gl_name', 'jenis_transaksi', 'po', 'grouping', 'type_transaksi', 'jenis_pph', 'status_npwp', 'tax_type', 'tax_code', 'tarif_pph', 'dpp_nongrossup', 'dpp_grossup']
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
          const name = new Date().getTime().toString().concat('-tarif').concat('.xlsx')
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
      // const findTarif = await veriftax.findAll({
      //   where: {
      //     [Op.not]: { grouping: null }
      //   }
      // })
      const findTarif = await veriftax.findAll()
      if (findTarif) {
        const temp = []
        for (let i = 0; i < findTarif.length; i++) {
          const findDel = await veriftax.findByPk(findTarif[i].id)
          if (findDel) {
            await findDel.destroy()
            temp.push(1)
          }
        }
        if (temp.length > 0) {
          return response(res, 'success delete all')
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
