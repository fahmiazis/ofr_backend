const { picklaim } = require('../models')
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
  addPicklaim: async (req, res) => {
    try {
      const schema = joi.object({
        kode_plant: joi.string().required(),
        kode_dist: joi.string().required(),
        profit_center: joi.string().required(),
        area: joi.string().required(),
        area_sap: joi.string().allow(''),
        ksni: joi.string().allow(''),
        nni: joi.string().allow(''),
        nsi: joi.string().allow(''),
        mas: joi.string().allow(''),
        mcp: joi.string().allow(''),
        simba: joi.string().allow(''),
        lotte: joi.string().allow(''),
        mun: joi.string().allow(''),
        eiti: joi.string().allow(''),
        edot: joi.string().allow(''),
        meiji: joi.string().allow('')
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 404, false)
      } else {
        const findNamePicklaim = await picklaim.findOne({
          where: {
            kode_plant: { [Op.like]: `%${results.kode_plant}` }
          }
        })
        if (findNamePicklaim) {
          return response(res, 'kode_plant picklaim telah terdftar', {}, 404, false)
        } else {
          const createPicklaim = await picklaim.create(results)
          if (createPicklaim) {
            return response(res, 'success create picklaim')
          } else {
            return response(res, 'false create picklaim', {}, 404, false)
          }
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  updatePicklaim: async (req, res) => {
    try {
      const id = req.params.id
      const schema = joi.object({
        kode_plant: joi.string().required(),
        kode_dist: joi.string().required(),
        profit_center: joi.string().required(),
        area: joi.string().required(),
        area_sap: joi.string().allow(''),
        ksni: joi.string().allow(''),
        nni: joi.string().allow(''),
        nsi: joi.string().allow(''),
        mas: joi.string().allow(''),
        mcp: joi.string().allow(''),
        simba: joi.string().allow(''),
        lotte: joi.string().allow(''),
        mun: joi.string().allow(''),
        eiti: joi.string().allow(''),
        edot: joi.string().allow(''),
        meiji: joi.string().allow('')
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 404, false)
      } else {
        const findNamePicklaim = await picklaim.findOne({
          where: {
            kode_plant: { [Op.like]: `%${results.kode_plant}` },
            [Op.not]: {
              id: id
            }
          }
        })
        if (findNamePicklaim) {
          return response(res, 'kode_plant picklaim telah terdftar', {}, 404, false)
        } else {
          const findPicklaim = await picklaim.findByPk(id)
          if (findPicklaim) {
            const updatePicklaim = await findPicklaim.update(results)
            if (updatePicklaim) {
              return response(res, 'success create picklaim')
            } else {
              return response(res, 'false create picklaim', {}, 404, false)
            }
          } else {
            return response(res, 'false create picklaim', {}, 404, false)
          }
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  uploadMasterPicklaim: async (req, res) => {
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
          'KODE PLANT',
          'KODE DISTRIBUTION',
          'PROFIT CENTER',
          'NAMA AREA',
          'NAMA AREA SAP',
          'KSNI',
          'NNI',
          'NSI',
          'MAS',
          'MCP',
          'SIMBA',
          'LOTTE',
          'MUN',
          'EITI',
          'EDOT',
          'MEIJI'
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
              const dataPicklaim = rows[i]
              const select = await picklaim.findOne({
                where: {
                  [Op.and]: [
                    { kode_plant: { [Op.like]: `%${dataPicklaim[0]}%` } }
                  ]
                }
              })
              const data = {
                kode_plant: dataPicklaim[0],
                kode_dist: dataPicklaim[1],
                profit_center: dataPicklaim[2],
                area: dataPicklaim[3],
                area_sap: dataPicklaim[4],
                ksni: dataPicklaim[5],
                nni: dataPicklaim[6],
                nsi: dataPicklaim[7],
                mas: dataPicklaim[8],
                mcp: dataPicklaim[9],
                simba: dataPicklaim[10],
                lotte: dataPicklaim[11],
                mun: dataPicklaim[12],
                eiti: dataPicklaim[13],
                edot: dataPicklaim[14],
                meiji: dataPicklaim[15]
              }
              if (select) {
                const upbank = await select.update(data)
                if (upbank) {
                  arr.push(1)
                }
              } else {
                const createPicklaim = await picklaim.create(data)
                if (createPicklaim) {
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
  getPicklaim: async (req, res) => {
    try {
      // const kode = req.user.kode
      const findPicklaim = await picklaim.findAll()
      if (findPicklaim.length > 0) {
        return response(res, 'succes get picklaim', { result: findPicklaim, length: findPicklaim.length })
      } else {
        return response(res, 'failed get picklaim', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getAllPicklaim: async (req, res) => {
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
      const findPicklaim = await picklaim.findAndCountAll({
        where: {
          [Op.or]: [
            { kode_plant: { [Op.like]: `%${searchValue}%` } },
            { kode_dist: { [Op.like]: `%${searchValue}%` } },
            { profit_center: { [Op.like]: `%${searchValue}%` } },
            { area: { [Op.like]: `%${searchValue}%` } },
            { area_sap: { [Op.like]: `%${searchValue}%` } },
            { ksni: { [Op.like]: `%${searchValue}%` } },
            { nni: { [Op.like]: `%${searchValue}%` } },
            { nsi: { [Op.like]: `%${searchValue}%` } },
            { mas: { [Op.like]: `%${searchValue}%` } },
            { mcp: { [Op.like]: `%${searchValue}%` } },
            { simba: { [Op.like]: `%${searchValue}%` } },
            { lotte: { [Op.like]: `%${searchValue}%` } },
            { mun: { [Op.like]: `%${searchValue}%` } },
            { eiti: { [Op.like]: `%${searchValue}%` } },
            { edot: { [Op.like]: `%${searchValue}%` } },
            { meiji: { [Op.like]: `%${searchValue}%` } }
          ]
        },
        order: [[sortValue, 'ASC']],
        limit: limit,
        offset: (page - 1) * limit
      })
      const pageInfo = pagination('/picklaim/get', req.query, page, limit, findPicklaim.count)
      if (findPicklaim) {
        return response(res, 'succes get picklaim', { result: findPicklaim, pageInfo })
      } else {
        return response(res, 'failed get picklaim', { result: [], pageInfo })
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getDetailPicklaim: async (req, res) => {
    try {
      const id = req.params.id
      const findPicklaim = await picklaim.findByPk(id)
      if (findPicklaim) {
        return response(res, 'succes get detail picklaim', { result: findPicklaim })
      } else {
        return response(res, 'failed get picklaim', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  deletePicklaim: async (req, res) => {
    try {
      const id = req.params.id
      const findPicklaim = await picklaim.findByPk(id)
      if (findPicklaim) {
        const delPicklaim = await findPicklaim.destroy()
        if (delPicklaim) {
          return response(res, 'succes delete picklaim', { result: findPicklaim })
        } else {
          return response(res, 'failed destroy picklaim', {}, 404, false)
        }
      } else {
        return response(res, 'failed get picklaim', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  exportSqlPicklaim: async (req, res) => {
    try {
      const result = await picklaim.findAll()
      if (result) {
        const workbook = new excel.Workbook()
        const worksheet = workbook.addWorksheet()
        const arr = []
        const header = [
          'KODE PLANT',
          'KODE DISTRIBUTION',
          'PROFIT CENTER',
          'NAMA AREA',
          'NAMA AREA SAP',
          'KSNI',
          'NNI',
          'NSI',
          'MAS',
          'MCP',
          'SIMBA',
          'LOTTE',
          'MUN',
          'EITI',
          'EDOT',
          'MEIJI'
        ]
        const key = [
          'kode_plant',
          'kode_dist',
          'profit_center',
          'area',
          'area_sap',
          'ksni',
          'nni',
          'nsi',
          'mas',
          'mcp',
          'simba',
          'lotte',
          'mun',
          'eiti',
          'edot',
          'meiji'
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
          const name = new Date().getTime().toString().concat('-picklaim').concat('.xlsx')
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
      const findPicklaim = await picklaim.findAll()
      if (findPicklaim) {
        const temp = []
        for (let i = 0; i < findPicklaim.length; i++) {
          const findDel = await picklaim.findByPk(findPicklaim[i].id)
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
