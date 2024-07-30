const { kliring } = require('../models')
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
  addKliring: async (req, res) => {
    try {
      const schema = joi.object({
        nama: joi.string().required(),
        nama_singkat: joi.string().required(),
        bic: joi.string().required(),
        sandi_bank: joi.string().required(),
        sandi_usaha: joi.string().required(),
        sandi_kliring: joi.string().required()
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 404, false)
      } else {
        const findNameKliring = await kliring.findOne({
          where: {
            nama: { [Op.like]: `%${results.nama}` }
          }
        })
        if (findNameKliring) {
          return response(res, 'nama kliring telah terdftar', {}, 404, false)
        } else {
          const createKliring = await kliring.create(results)
          if (createKliring) {
            return response(res, 'success create kliring')
          } else {
            return response(res, 'false create kliring', {}, 404, false)
          }
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  updateKliring: async (req, res) => {
    try {
      const id = req.params.id
      const schema = joi.object({
        nama: joi.string().required(),
        nama_singkat: joi.string().required(),
        bic: joi.string().required(),
        sandi_bank: joi.string().required(),
        sandi_usaha: joi.string().required(),
        sandi_kliring: joi.string().required()
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 404, false)
      } else {
        const findNameKliring = await kliring.findOne({
          where: {
            nama: { [Op.like]: `%${results.nama}` },
            [Op.not]: {
              id: id
            }
          }
        })
        if (findNameKliring) {
          return response(res, 'nama kliring telah terdftar', {}, 404, false)
        } else {
          const findKliring = await kliring.findByPk(id)
          if (findKliring) {
            const updateKliring = await findKliring.update(results)
            if (updateKliring) {
              return response(res, 'success create kliring')
            } else {
              return response(res, 'false create kliring', {}, 404, false)
            }
          } else {
            return response(res, 'false create kliring', {}, 404, false)
          }
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  uploadMasterKliring: async (req, res) => {
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
        const cek = ['NAMA PESERTA', 'NAMA SINGKAT', 'BIC PESERTA', 'SANDI BANK', 'SANDI JENIS USAHA', 'SANDI KLIRING KANTOR PUSAT']
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
            cost.push(`Nama ${a[0]}`)
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
              const dataKliring = rows[i]
              const select = await kliring.findOne({
                where: {
                  [Op.and]: [
                    { nama: { [Op.like]: `%${dataKliring[0]}%` } }
                  ]
                }
              })
              const data = {
                nama: dataKliring[0],
                nama_singkat: dataKliring[1],
                bic: dataKliring[2],
                sandi_bank: dataKliring[3],
                sandi_usaha: dataKliring[4],
                sandi_kliring: dataKliring[5]
              }
              if (select) {
                const upbank = await select.update(data)
                if (upbank) {
                  arr.push(1)
                }
              } else {
                const createKliring = await kliring.create(data)
                if (createKliring) {
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
  getKliring: async (req, res) => {
    try {
      // const kode = req.user.kode
      const findKliring = await kliring.findAll()
      if (findKliring.length > 0) {
        return response(res, 'succes get kliring', { result: findKliring, length: findKliring.length })
      } else {
        return response(res, 'failed get kliring', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getAllKliring: async (req, res) => {
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
        const findLimit = await kliring.findAll()
        limit = findLimit.length
      } else {
        limit = parseInt(limit)
      }
      if (!page) {
        page = 1
      } else {
        page = parseInt(page)
      }
      const findKliring = await kliring.findAndCountAll({
        where: {
          [Op.or]: [
            { nama: { [Op.like]: `%${searchValue}%` } },
            { nama_singkat: { [Op.like]: `%${searchValue}%` } },
            { bic: { [Op.like]: `%${searchValue}%` } },
            { sandi_bank: { [Op.like]: `%${searchValue}%` } },
            { sandi_usaha: { [Op.like]: `%${searchValue}%` } },
            { sandi_kliring: { [Op.like]: `%${searchValue}%` } }
          ]
        },
        order: [[sortValue, 'ASC']],
        limit: limit,
        offset: (page - 1) * limit
      })
      const pageInfo = pagination('/kliring/get', req.query, page, limit, findKliring.count)
      if (findKliring) {
        return response(res, 'succes get kliring', { result: findKliring, pageInfo })
      } else {
        return response(res, 'failed get kliring', { result: [], pageInfo })
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getDetailKliring: async (req, res) => {
    try {
      const id = req.params.id
      const findKliring = await kliring.findByPk(id)
      if (findKliring) {
        return response(res, 'succes get detail kliring', { result: findKliring })
      } else {
        return response(res, 'failed get kliring', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  deleteKliring: async (req, res) => {
    try {
      const id = req.params.id
      const findKliring = await kliring.findByPk(id)
      if (findKliring) {
        const delKliring = await findKliring.destroy()
        if (delKliring) {
          return response(res, 'succes delete kliring', { result: findKliring })
        } else {
          return response(res, 'failed destroy kliring', {}, 404, false)
        }
      } else {
        return response(res, 'failed get kliring', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  exportSqlKliring: async (req, res) => {
    try {
      const result = await kliring.findAll()
      if (result) {
        const workbook = new excel.Workbook()
        const worksheet = workbook.addWorksheet()
        const arr = []
        const header = ['NAMA PESERTA', 'NAMA SINGKAT', 'BIC PESERTA', 'SANDI BANK', 'SANDI JENIS USAHA', 'SANDI KLIRING KANTOR PUSAT']
        const key = ['nama', 'nama_singkat', 'bic', 'sandi_bank', 'sandi_usaha', 'sandi_kliring']
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
          const name = new Date().getTime().toString().concat('-kliring').concat('.xlsx')
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
      const findKliring = await kliring.findAll()
      if (findKliring) {
        const temp = []
        for (let i = 0; i < findKliring.length; i++) {
          const findDel = await kliring.findByPk(findKliring[i].id)
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
