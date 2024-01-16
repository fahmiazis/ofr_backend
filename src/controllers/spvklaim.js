const { spvklaim } = require('../models')
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
  addSpvklaim: async (req, res) => {
    try {
      const schema = joi.object({
        pic_klaim: joi.string().required(),
        spv_klaim: joi.string().required(),
        manager_klaim: joi.string().required()
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 404, false)
      } else {
        const findNameSpvklaim = await spvklaim.findOne({
          where: {
            pic_klaim: { [Op.like]: `%${results.pic_klaim}` }
          }
        })
        if (findNameSpvklaim) {
          return response(res, 'pic_klaim spvklaim telah terdftar', {}, 404, false)
        } else {
          const createSpvklaim = await spvklaim.create(results)
          if (createSpvklaim) {
            return response(res, 'success create spvklaim')
          } else {
            return response(res, 'false create spvklaim', {}, 404, false)
          }
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  updateSpvklaim: async (req, res) => {
    try {
      const id = req.params.id
      const schema = joi.object({
        pic_klaim: joi.string().required(),
        spv_klaim: joi.string().required(),
        manager_klaim: joi.string().required()
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 404, false)
      } else {
        const findNameSpvklaim = await spvklaim.findOne({
          where: {
            pic_klaim: { [Op.like]: `%${results.pic_klaim}` },
            [Op.not]: {
              id: id
            }
          }
        })
        if (findNameSpvklaim) {
          return response(res, 'pic_klaim spvklaim telah terdftar', {}, 404, false)
        } else {
          const findSpvklaim = await spvklaim.findByPk(id)
          if (findSpvklaim) {
            const updateSpvklaim = await findSpvklaim.update(results)
            if (updateSpvklaim) {
              return response(res, 'success create spvklaim')
            } else {
              return response(res, 'false create spvklaim', {}, 404, false)
            }
          } else {
            return response(res, 'false create spvklaim', {}, 404, false)
          }
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  uploadMasterSpvklaim: async (req, res) => {
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
          'PIC KLAIM',
          'SPV KLAIM',
          'MANAGER KLAIM'
        ]
        const valid = rows[0]
        for (let i = 0; i < cek.length; i++) {
          console.log(valid[i], cek[i])
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
              const dataSpvklaim = rows[i]
              const select = await spvklaim.findOne({
                where: {
                  [Op.and]: [
                    { pic_klaim: { [Op.like]: `%${dataSpvklaim[0]}%` } }
                  ]
                }
              })
              const data = {
                pic_klaim: dataSpvklaim[0],
                spv_klaim: dataSpvklaim[1],
                manager_klaim: dataSpvklaim[2]
              }
              if (select) {
                const upbank = await select.update(data)
                if (upbank) {
                  arr.push(1)
                }
              } else {
                const createSpvklaim = await spvklaim.create(data)
                if (createSpvklaim) {
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
  getSpvklaim: async (req, res) => {
    try {
      // const kode = req.user.kode
      const findSpvklaim = await spvklaim.findAll()
      if (findSpvklaim.length > 0) {
        return response(res, 'succes get spvklaim', { result: findSpvklaim, length: findSpvklaim.length })
      } else {
        return response(res, 'failed get spvklaim', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getAllSpvklaim: async (req, res) => {
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
      const findSpvklaim = await spvklaim.findAndCountAll({
        where: {
          [Op.or]: [
            { pic_klaim: { [Op.like]: `%${searchValue}%` } },
            { spv_klaim: { [Op.like]: `%${searchValue}%` } },
            { manager_klaim: { [Op.like]: `%${searchValue}%` } }
          ]
        },
        order: [[sortValue, 'ASC']],
        limit: limit,
        offset: (page - 1) * limit
      })
      const pageInfo = pagination('/spvklaim/get', req.query, page, limit, findSpvklaim.count)
      if (findSpvklaim) {
        return response(res, 'succes get spvklaim', { result: findSpvklaim, pageInfo })
      } else {
        return response(res, 'failed get spvklaim', { result: [], pageInfo })
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getDetailSpvklaim: async (req, res) => {
    try {
      const id = req.params.id
      const findSpvklaim = await spvklaim.findByPk(id)
      if (findSpvklaim) {
        return response(res, 'succes get detail spvklaim', { result: findSpvklaim })
      } else {
        return response(res, 'failed get spvklaim', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  deleteSpvklaim: async (req, res) => {
    try {
      const id = req.params.id
      const findSpvklaim = await spvklaim.findByPk(id)
      if (findSpvklaim) {
        const delSpvklaim = await findSpvklaim.destroy()
        if (delSpvklaim) {
          return response(res, 'succes delete spvklaim', { result: findSpvklaim })
        } else {
          return response(res, 'failed destroy spvklaim', {}, 404, false)
        }
      } else {
        return response(res, 'failed get spvklaim', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  exportSqlSpvklaim: async (req, res) => {
    try {
      const result = await spvklaim.findAll()
      if (result) {
        const workbook = new excel.Workbook()
        const worksheet = workbook.addWorksheet()
        const arr = []
        const header = [
          'PIC KLAIM',
          'SPV KLAIM',
          'MANAGER KLAIM'
        ]
        const key = [
          'pic_klaim',
          'spv_klaim',
          'manager_klaim'
        ]
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
          const name = new Date().getTime().toString().concat('-spvklaim').concat('.xlsx')
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
      const findSpvklaim = await spvklaim.findAll()
      if (findSpvklaim) {
        const temp = []
        for (let i = 0; i < findSpvklaim.length; i++) {
          const findDel = await spvklaim.findByPk(findSpvklaim[i].id)
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
