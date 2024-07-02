const { vendor } = require('../models')
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
  addVendor: async (req, res) => {
    try {
      const schema = joi.object({
        nama: joi.string().required(),
        no_npwp: joi.string().required(),
        no_ktp: joi.string().required(),
        alamat: joi.string().required(),
        jenis_vendor: joi.string().required()
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 404, false)
      } else {
        const findNameVendor = await vendor.findOne({
          where: {
            nama: { [Op.like]: `%${results.nama}` }
          }
        })
        if (findNameVendor && (findNameVendor.alamat === results.alamat)) {
          return response(res, 'nama vendor telah terdftar', {}, 404, false)
        } else {
          const createVendor = await vendor.create(results)
          if (createVendor) {
            return response(res, 'success create vendor')
          } else {
            return response(res, 'false create vendor', {}, 404, false)
          }
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  updateVendor: async (req, res) => {
    try {
      const id = req.params.id
      const schema = joi.object({
        nama: joi.string().required(),
        no_npwp: joi.string().required(),
        no_ktp: joi.string().required(),
        alamat: joi.string().required()
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 404, false)
      } else {
        const findNameVendor = await vendor.findOne({
          where: {
            nama: { [Op.like]: `%${results.nama}` },
            [Op.not]: {
              id: id
            }
          }
        })
        if (findNameVendor && (findNameVendor.alamat === results.alamat)) {
          return response(res, 'nama vendor telah terdftar', {}, 404, false)
        } else {
          const findVendor = await vendor.findByPk(id)
          if (findVendor) {
            const updateVendor = await findVendor.update(results)
            if (updateVendor) {
              return response(res, 'success create vendor')
            } else {
              return response(res, 'false create vendor', {}, 404, false)
            }
          } else {
            return response(res, 'false create vendor', {}, 404, false)
          }
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  uploadMasterVendor: async (req, res) => {
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
        const cek = ['NAMA', 'NO NPWP', 'NO KTP', 'ALAMAT', 'JENIS VENDOR']
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
            cost.push(`Nama ${a[0]} ${i} dan alamat ${a[3]}`)
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
              const dataVendor = rows[i]
              const select = await vendor.findOne({
                where: {
                  [Op.and]: [
                    { nama: { [Op.like]: `%${dataVendor[0]}%` } },
                    { no_npwp: { [Op.like]: `%${dataVendor[1]}%` } },
                    { no_ktp: { [Op.like]: `%${dataVendor[2]}%` } },
                    { alamat: { [Op.like]: `%${dataVendor[3]}%` } }
                  ]
                }
              })
              const data = {
                nama: dataVendor[0],
                no_npwp: dataVendor[1],
                no_ktp: dataVendor[2],
                alamat: dataVendor[3],
                jenis_vendor: dataVendor[4]
              }
              if (select) {
                const upbank = await select.update(data)
                if (upbank) {
                  arr.push(1)
                }
              } else {
                const createVendor = await vendor.create(data)
                if (createVendor) {
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
  getVendor: async (req, res) => {
    try {
      // const kode = req.user.kode
      const { noIdent } = req.body
      const dataFind = noIdent === undefined || noIdent === null ? '' : noIdent.replace(/[-' '.]/g, '')
      if (noIdent !== undefined) {
        const findVendor = await vendor.findAll({
          where: {
            [Op.or]: [
              { no_npwp: { [Op.like]: `%${dataFind}%` } },
              { no_ktp: { [Op.like]: `%${dataFind}%` } }
            ]
          }
        })
        if (findVendor.length > 0) {
          return response(res, 'succes get vendor', { result: findVendor, length: findVendor.length })
        } else {
          return response(res, 'failed get vendor', {}, 404, false)
        }
      } else {
        const findVendor = await vendor.findAll()
        if (findVendor.length > 0) {
          return response(res, 'succes get vendor', { result: findVendor, length: findVendor.length })
        } else {
          return response(res, 'failed get vendor', {}, 404, false)
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getAllVendor: async (req, res) => {
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
      const findVendor = await vendor.findAndCountAll({
        where: {
          [Op.or]: [
            { nama: { [Op.like]: `%${searchValue}%` } },
            { no_npwp: { [Op.like]: `%${searchValue}%` } },
            { no_ktp: { [Op.like]: `%${searchValue}%` } },
            { alamat: { [Op.like]: `%${searchValue}%` } }
          ]
        },
        order: [[sortValue, 'DESC']],
        limit: limit,
        offset: (page - 1) * limit
      })
      const pageInfo = pagination('/vendor/get', req.query, page, limit, findVendor.count)
      if (findVendor) {
        return response(res, 'succes get vendor', { result: findVendor, pageInfo })
      } else {
        return response(res, 'failed get vendor', { result: [], pageInfo })
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getDetailVendor: async (req, res) => {
    try {
      const id = req.params.id
      const findVendor = await vendor.findByPk(id)
      if (findVendor) {
        return response(res, 'succes get detail vendor', { result: findVendor })
      } else {
        return response(res, 'failed get vendor', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  deleteVendor: async (req, res) => {
    try {
      const id = req.params.id
      const findVendor = await vendor.findByPk(id)
      if (findVendor) {
        const delVendor = await findVendor.destroy()
        if (delVendor) {
          return response(res, 'succes delete vendor', { result: findVendor })
        } else {
          return response(res, 'failed destroy vendor', {}, 404, false)
        }
      } else {
        return response(res, 'failed get vendor', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  exportSqlVendor: async (req, res) => {
    try {
      const result = await vendor.findAll()
      if (result) {
        const workbook = new excel.Workbook()
        const worksheet = workbook.addWorksheet()
        const arr = []
        const header = ['NAMA', 'NO NPWP', 'NO KTP', 'ALAMAT', 'JENIS VENDOR']
        const key = ['nama', 'no_npwp', 'no_ktp', 'alamat', 'jenis_vendor']
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
          const name = new Date().getTime().toString().concat('-vendor').concat('.xlsx')
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
      const findVendor = await vendor.findAll()
      if (findVendor) {
        const temp = []
        for (let i = 0; i < findVendor.length; i++) {
          const findDel = await vendor.findByPk(findVendor[i].id)
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
  },
  updateSpar: async (req, res) => {
    try {
      const findVendor = await vendor.findAll()
      if (findVendor.length > 0) {
        const cek = []
        for (let i = 0; i < findVendor.length; i++) {
          const dataNik = findVendor[i].no_ktp
          const dataNpwp = findVendor[i].no_npwp

          const nikFin = dataNik.replace(/[^a-z0-9-]/g, '')
          const npwpRep = dataNpwp.replace(/[^a-z0-9-]/g, '')
          const npwpFin = npwpRep.replace('-', '')

          if (dataNik === 'TIDAK ADA') {
            const data = {
              no_ktp: dataNik,
              no_npwp: npwpFin
            }
            const findData = await vendor.findByPk(findVendor[i].id)
            if (findData) {
              await findData.update(data)
              cek.push(findData)
            }
          } else if (dataNpwp === 'TIDAK ADA') {
            const data = {
              no_ktp: nikFin,
              no_npwp: dataNpwp
            }
            const findData = await vendor.findByPk(findVendor[i].id)
            if (findData) {
              await findData.update(data)
              cek.push(findData)
            }
          } else {
            const data = {
              no_ktp: nikFin,
              no_npwp: npwpFin
            }
            const findData = await vendor.findByPk(findVendor[i].id)
            if (findData) {
              await findData.update(data)
              cek.push(findData)
            }
          }
        }
        if (cek.length) {
          return response(res, 'success update sparator all', { cek })
        } else {
          return response(res, 'failed update sparator all', {}, 404, false)
        }
      } else {
        return response(res, 'failed update sparator all', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  }
}
