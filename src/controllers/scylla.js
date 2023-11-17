const joi = require('joi')
const { scylla } = require('../models')
const { pagination } = require('../helpers/pagination')
const response = require('../helpers/response')
const { Op } = require('sequelize')
const readXlsxFile = require('read-excel-file/node')
const multer = require('multer')
const uploadMaster = require('../helpers/uploadMaster')
const fs = require('fs')
const excel = require('exceljs')
const vs = require('fs-extra')
const { APP_URL } = process.env

module.exports = {
  createScylla: async (req, res) => {
    try {
      const level = req.user.level
      const schema = joi.object({
        kd_reg: joi.string().required(),
        region: joi.string().required(),
        kd_sap2: joi.string().required(),
        kode_plant: joi.string().required(),
        kode_depo: joi.string().required(),
        initial_depo: joi.string().required(),
        nm_depo: joi.string().required(),
        area: joi.string().required(),
        channel: joi.string().required(),
        status: joi.string().required(),
        system: joi.string().required()
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 401, false)
      } else {
        if (level === 1) {
          const result = await scylla.findAll({ where: { kode_plant: results.kode_plant } })
          if (result.length > 0) {
            return response(res, 'kode plant already use', {}, 404, false)
          } else {
            const result = await scylla.create(results)
            if (result) {
              return response(res, 'succesfully add depo', { result })
            } else {
              return response(res, 'failed to add depo', {}, 404, false)
            }
          }
        } else {
          return response(res, "you're not super administrator", {}, 404, false)
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  updateScylla: async (req, res) => {
    try {
      const level = req.user.level
      const id = req.params.id
      const schema = joi.object({
        kd_reg: joi.string().required(),
        region: joi.string().required(),
        kd_sap2: joi.string().required(),
        kode_plant: joi.string().required(),
        kode_depo: joi.string().required(),
        initial_depo: joi.string().required(),
        nm_depo: joi.string().required(),
        area: joi.string().required(),
        channel: joi.string().required(),
        status: joi.string().required(),
        system: joi.string().required()
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 401, false)
      } else {
        if (level === 1) {
          const result = await scylla.findAll({ where: { kode_plant: results.kode_plant, [Op.not]: { id: id } } })
          if (result.length > 0) {
            return response(res, 'kode plant already use', {}, 404, false)
          } else {
            const result = await scylla.findByPk(id)
            if (result) {
              await result.update(results)
              return response(res, 'succesfully update depo', { result })
            } else {
              return response(res, 'failed to update depo', {}, 404, false)
            }
          }
        } else {
          return response(res, "you're not super administrator", {}, 404, false)
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  deleteScylla: async (req, res) => {
    try {
      const level = req.user.level
      const id = req.params.id
      if (level === 1) {
        const result = await scylla.findByPk(id)
        if (result) {
          await result.destroy()
          return response(res, 'succesfully delete depo', { result })
        } else {
          return response(res, 'failed to delete depo', {}, 404, false)
        }
      } else {
        return response(res, "you're not super administrator", {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getScylla: async (req, res) => {
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
      const result = await scylla.findAndCountAll({
        where: {
          [Op.or]: [
            { kode_plant: { [Op.like]: `%${searchValue}%` } }
          ]
        },
        order: [[sortValue, 'ASC']],
        limit: limit,
        offset: (page - 1) * limit
      })
      const pageInfo = pagination('/scylla/get', req.query, page, limit, result.count)
      if (result) {
        return response(res, 'list users', { result, pageInfo })
      } else {
        return response(res, 'failed to get user', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getDetailScylla: async (req, res) => {
    try {
      const id = req.params.id
      const level = req.user.level
      const kode = req.user.kode
      const cost = req.user.name
      if (level === 5 || level === 9) {
        const result = await scylla.findOne({ where: { kode_plant: level === 5 ? kode : cost } })
        if (result) {
          return response(res, 'succes get detail depo', { result })
        } else {
          return response(res, 'failed get detail depo', {}, 404, false)
        }
      } else {
        const result = await scylla.findByPk(id)
        if (result) {
          return response(res, 'succes get detail depo', { result })
        } else {
          return response(res, 'failed get detail depo', {}, 404, false)
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  uploadMasterScylla: async (req, res) => {
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
            'kd_reg',
            'region',
            'kd_sap2',
            'id_plan',
            'kd_depo',
            'initial_depo',
            'nm_depo',
            'area',
            'channel',
            'status',
            'system'
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
            const plant = []
            const cost = []
            const sap1 = []
            const sap2 = []
            for (let i = 1; i < rows.length; i++) {
              const a = rows[i]
              plant.push(`Kode Plant ${a[3]}`)
            }
            const object = {}
            const result = []
            const dupCost = {}
            const dupSap1 = {}
            const dupSap2 = {}

            cost.forEach(item => {
              if (!dupCost[item]) { dupCost[item] = 0 }
              dupCost[item] += 1
            })

            for (const prop in dupCost) {
              if (dupCost[prop] >= 2) {
                result.push(prop)
              }
            }

            sap1.forEach(item => {
              if (!dupSap1[item]) { dupSap1[item] = 0 }
              dupSap1[item] += 1
            })

            for (const prop in dupSap1) {
              if (dupSap1[prop] >= 2) {
                result.push(prop)
              }
            }

            sap2.forEach(item => {
              if (!dupSap2[item]) { dupSap2[item] = 0 }
              dupSap2[item] += 1
            })

            for (const prop in dupSap2) {
              if (dupSap2[prop] >= 2) {
                result.push(prop)
              }
            }

            plant.forEach(item => {
              if (!object[item]) { object[item] = 0 }
              object[item] += 1
            })

            for (const prop in object) {
              if (object[prop] >= 2) {
                result.push(prop)
              }
            }
            if (result.length > 0) {
              return response(res, 'there is duplication in your file master', { result }, 404, false)
            } else {
              const arr = []
              rows.shift()
              for (let i = 0; i < rows.length; i++) {
                const dataScylla = rows[i]
                const select = await scylla.findOne({
                  where: {
                    kode_plant: { [Op.like]: `%${dataScylla[3]}%` }
                  }
                })
                const data = {
                  kd_reg: dataScylla[0],
                  region: dataScylla[1],
                  kd_sap2: dataScylla[2],
                  kode_plant: dataScylla[3],
                  kode_depo: dataScylla[4],
                  initial_depo: dataScylla[5],
                  nm_depo: dataScylla[6],
                  area: dataScylla[7],
                  channel: dataScylla[8],
                  status: dataScylla[9],
                  system: dataScylla[10]
                }
                if (select) {
                  const updepo = await select.update(data)
                  if (updepo) {
                    arr.push(1)
                  }
                } else {
                  const createScylla = await scylla.create(data)
                  if (createScylla) {
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
  exportSqlScylla: async (req, res) => {
    try {
      const result = await scylla.findAll()
      if (result) {
        const workbook = new excel.Workbook()
        const worksheet = workbook.addWorksheet()
        const arr = []
        const header = [
          'kd_reg',
          'region',
          'kd_sap2',
          'id_plan',
          'kd_depo',
          'initial_depo',
          'nm_depo',
          'area',
          'channel',
          'status',
          'system'
        ]
        const key = [
          'kd_reg',
          'region',
          'kd_sap2',
          'kode_plant',
          'kode_depo',
          'initial_depo',
          'nm_depo',
          'area',
          'channel',
          'status',
          'system'
        ]
        for (let i = 0; i < header.length; i++) {
          let temp = { header: header[i], key: key[i] }
          arr.push(temp)
          temp = {}
        }
        worksheet.columns = arr
        const cek = worksheet.addRows(result)
        if (cek) {
          const name = new Date().getTime().toString().concat('-depo').concat('.xlsx')
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
      const findData = await scylla.findAll()
      if (findData.length > 0) {
        const temp = []
        for (let i = 0; i < findData.length; i++) {
          const findId = await scylla.findByPk(findData[i].id)
          if (findId) {
            await findId.destroy()
            temp.push(1)
          }
        }
        if (temp.length > 0) {
          return response(res, 'success delete data scylla')
        } else {
          return response(res, 'success delete data false')
        }
      } else {
        return response(res, 'success delete data false')
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  }
}
