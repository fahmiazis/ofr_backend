const { kpp, depo } = require('../models')
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
  addKpp: async (req, res) => {
    try {
      const schema = joi.object({
        profit_center: joi.string().required(),
        area: joi.string().required(),
        system: joi.string().required(),
        npwp: joi.string().required()
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 404, false)
      } else {
        const findKpp = await kpp.findOne({
          where: {
            profit_center: { [Op.like]: `%${results.profit_center}` }
          }
        })
        if (findKpp) {
          return response(res, 'nama kpp telah terdftar', {}, 404, false)
        } else {
          const createKpp = await kpp.create(results)
          if (createKpp) {
            return response(res, 'success create kpp')
          } else {
            return response(res, 'false create kpp', {}, 404, false)
          }
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  updateKpp: async (req, res) => {
    try {
      const id = req.params.id
      const schema = joi.object({
        profit_center: joi.string().required(),
        area: joi.string().required(),
        system: joi.string().required(),
        npwp: joi.string().required()
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 404, false)
      } else {
        const findKpp = await kpp.findOne({
          where: {
            profit_center: { [Op.like]: `%${results.profit_center}` },
            [Op.not]: {
              id: id
            }
          }
        })
        if (findKpp) {
          return response(res, 'nama kpp telah terdaftar', {}, 404, false)
        } else {
          const findKpp = await kpp.findByPk(id)
          if (findKpp) {
            const updateKpp = await findKpp.update(results)
            if (updateKpp) {
              return response(res, 'success update kpp')
            } else {
              return response(res, 'false update kpp', {}, 404, false)
            }
          } else {
            return response(res, 'false update kpp', {}, 404, false)
          }
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  uploadMasterKpp: async (req, res) => {
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
          const cek = ['SYSTEM', 'PROFIT CENTER', 'NAMA AREA', 'NPWP']
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
              kode.push(`${a[1]}`)
              cost.push(`Profit center ${a[1]}`)
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
                const dataKpp = rows[i]
                const select = await kpp.findOne({
                  where: {
                    profit_center: { [Op.like]: `%${dataKpp[1]}%` }
                  }
                })
                const data = {
                  profit_center: dataKpp[1],
                  area: dataKpp[2],
                  system: dataKpp[0],
                  npwp: dataKpp[3]
                }
                if (select) {
                  const upbank = await select.update(data)
                  if (upbank) {
                    arr.push(1)
                  }
                } else {
                  const createKpp = await kpp.create(data)
                  if (createKpp) {
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
  getAllKpp: async (req, res) => {
    try {
      const kode = req.user.kode
      const findDep = await depo.findOne({
        where: {
          kode_plant: { [Op.like]: `%${kode}%` }
        }
      })
      if (findDep) {
        const findKpp = await kpp.findAll({
          where: {
            profit_center: { [Op.like]: `%${findDep.profit_center}%` }
          }
        })
        if (findKpp.length > 0) {
          return response(res, 'succes get kpp', { result: findKpp, length: findKpp.length })
        } else {
          return response(res, 'failed get kpp', {}, 404, false)
        }
      } else {
        return response(res, 'failed get kpp', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getKpp: async (req, res) => {
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
      const findKpp = await kpp.findAndCountAll({
        where: {
          [Op.or]: [
            { profit_center: { [Op.like]: `%${searchValue}%` } },
            { area: { [Op.like]: `%${searchValue}%` } },
            { system: { [Op.like]: `%${searchValue}%` } },
            { npwp: { [Op.like]: `%${searchValue}%` } }
          ]
        },
        order: [[sortValue, 'ASC']],
        limit: limit,
        offset: (page - 1) * limit
      })
      const pageInfo = pagination('/kpp/get', req.query, page, limit, findKpp.count)
      if (findKpp.rows.length > 0) {
        return response(res, 'succes get kpp', { result: findKpp, pageInfo })
      } else {
        return response(res, 'failed get kpp', { findKpp }, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getDetailKpp: async (req, res) => {
    try {
      const id = req.params.id
      const findKpp = await kpp.findByPk(id)
      if (findKpp) {
        return response(res, 'succes get detail kpp', { result: findKpp })
      } else {
        return response(res, 'failed get kpp', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  deleteKpp: async (req, res) => {
    try {
      const id = req.params.id
      const findKpp = await kpp.findByPk(id)
      if (findKpp) {
        const delKpp = await findKpp.destroy()
        if (delKpp) {
          return response(res, 'succes delete kpp', { result: findKpp })
        } else {
          return response(res, 'failed destroy kpp', {}, 404, false)
        }
      } else {
        return response(res, 'failed get kpp', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  exportSqlKpp: async (req, res) => {
    try {
      const result = await kpp.findAll()
      if (result) {
        const workbook = new excel.Workbook()
        const worksheet = workbook.addWorksheet()
        const arr = []
        const header = ['SYSTEM', 'PROFIT CENTER', 'NAMA AREA', 'NPWP']
        const key = ['system', 'profit_center', 'area', 'npwp']
        for (let i = 0; i < header.length; i++) {
          let temp = { header: header[i], key: key[i] }
          arr.push(temp)
          temp = {}
        }
        worksheet.columns = arr
        const cek = worksheet.addRows(result)
        if (cek) {
          const name = new Date().getTime().toString().concat('-kpp').concat('.xlsx')
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
      const findKpp = await kpp.findAll()
      if (findKpp) {
        const temp = []
        for (let i = 0; i < findKpp.length; i++) {
          const findDel = await kpp.findByPk(findKpp[i].id)
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
