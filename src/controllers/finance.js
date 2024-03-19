const { finance, depo } = require('../models')
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
  addFinance: async (req, res) => {
    try {
      const schema = joi.object({
        kode_plant: joi.string().required(),
        profit_center: joi.string().required(),
        region: joi.string().required(),
        inisial: joi.string().required(),
        rek_spending: joi.string().required(),
        rek_zba: joi.string().required(),
        rek_bankcoll: joi.string().required(),
        rekening: joi.string().allow(''),
        type_live: joi.string().required(),
        gl_kk: joi.string().required(),
        area: joi.string().required(),
        pagu: joi.string().required(),
        pic_finance: joi.string().required(),
        spv_finance: joi.string().required(),
        spv2_finance: joi.string().required(),
        asman_finance: joi.string().required(),
        manager_finance: joi.string().required(),
        pic_tax: joi.string().required(),
        spv_tax: joi.string().required(),
        asman_tax: joi.string().required(),
        manager_tax: joi.string().required(),
        aos: joi.string().required(),
        rom: joi.string().required(),
        bm: joi.string().required(),
        nom: joi.string().required(),
        rbm: joi.string().required()
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
        rek_spending: joi.string().required(),
        rek_zba: joi.string().required(),
        rek_bankcoll: joi.string().required(),
        rekening: joi.string().allow(''),
        type_live: joi.string().required(),
        gl_kk: joi.string().required(),
        area: joi.string().required(),
        pagu: joi.string().required(),
        pic_finance: joi.string().required(),
        spv_finance: joi.string().required(),
        spv2_finance: joi.string().required(),
        asman_finance: joi.string().required(),
        manager_finance: joi.string().required(),
        pic_tax: joi.string().required(),
        spv_tax: joi.string().required(),
        asman_tax: joi.string().required(),
        manager_tax: joi.string().required(),
        aos: joi.string().required(),
        rom: joi.string().required(),
        bm: joi.string().required(),
        nom: joi.string().required(),
        rbm: joi.string().required()
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
        const cek = ['KODE PLANT', 'PROFIT/COST CENTER', 'NAMA AREA', 'REGION', 'INISIAL', 'NO REK SPENDING CARD', 'NO REK ZBA', 'NO REK BANK COLL', 'PAGU IKK', 'SISTEM AREA', 'PIC CONSOLE', 'SPV FINANCE 1', 'SPV FINANCE 2', 'ASST MGR FIN', 'MGR FIN', 'PIC TAX', 'SPV TAX', 'ASMEN TAX', 'MGR TAX', 'AOS', 'ROM', 'BM', 'NOM', 'RBM', 'CHANNEL']
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
                area: dataFinance[2],
                region: dataFinance[3],
                inisial: dataFinance[4],
                rek_spending: dataFinance[5],
                rek_zba: dataFinance[6],
                rek_bankcoll: dataFinance[7],
                pagu: dataFinance[8],
                type_live: dataFinance[9],
                gl_kk: dataFinance[9] === 'LIVE SAP' ? '11010105' : '11010704',
                pic_finance: dataFinance[10],
                spv_finance: dataFinance[11],
                spv2_finance: dataFinance[12],
                asman_finance: dataFinance[13],
                manager_finance: dataFinance[14],
                pic_tax: dataFinance[15],
                spv_tax: dataFinance[16],
                asman_tax: dataFinance[17],
                manager_tax: dataFinance[18],
                aos: dataFinance[19],
                rom: dataFinance[20],
                bm: dataFinance[21],
                nom: dataFinance[22],
                rbm: dataFinance[23],
                channel: dataFinance[24]
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
  getAllRek: async (req, res) => {
    try {
      const kode = req.user.kode
      const { tipe } = req.query
      if (tipe === 'all') {
        const findRek = await finance.findAll({
          include: [{
            model: depo,
            as: 'depo'
          }]
        })
        if (findRek.length > 0) {
          return response(res, 'succes get rekening', { result: findRek, length: findRek.length })
        } else {
          return response(res, 'failed get rekening', {}, 404, false)
        }
      } else {
        console.log(kode)
        const findRek = await finance.findAll({
          where: {
            kode_plant: kode
          }
        })
        if (findRek.length > 0) {
          return response(res, 'succes get rekening', { result: findRek, length: findRek.length })
        } else {
          return response(res, 'failed get rekeningsss', {}, 404, false)
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
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
            { rek_spending: { [Op.like]: `%${searchValue}%` } },
            { rek_zba: { [Op.like]: `%${searchValue}%` } },
            { rek_bankcoll: { [Op.like]: `%${searchValue}%` } },
            { rekening: { [Op.like]: `%${searchValue}%` } },
            { type_live: { [Op.like]: `%${searchValue}%` } },
            { gl_kk: { [Op.like]: `%${searchValue}%` } },
            { area: { [Op.like]: `%${searchValue}%` } },
            { pagu: { [Op.like]: `%${searchValue}%` } },
            { pic_finance: { [Op.like]: `%${searchValue}%` } },
            { spv_finance: { [Op.like]: `%${searchValue}%` } },
            { spv2_finance: { [Op.like]: `%${searchValue}%` } },
            { asman_finance: { [Op.like]: `%${searchValue}%` } },
            { manager_finance: { [Op.like]: `%${searchValue}%` } },
            { pic_tax: { [Op.like]: `%${searchValue}%` } },
            { spv_tax: { [Op.like]: `%${searchValue}%` } },
            { asman_tax: { [Op.like]: `%${searchValue}%` } },
            { manager_tax: { [Op.like]: `%${searchValue}%` } },
            { aos: { [Op.like]: `%${searchValue}%` } },
            { rom: { [Op.like]: `%${searchValue}%` } },
            { bm: { [Op.like]: `%${searchValue}%` } },
            { nom: { [Op.like]: `%${searchValue}%` } },
            { rbm: { [Op.like]: `%${searchValue}%` } }
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
      const level = req.user.level
      const kode = req.user.kode
      const cost = req.user.name
      if (level === 5 || level === 9) {
        const result = await finance.findOne({ where: { kode_plant: level === 5 ? kode : cost } })
        if (result) {
          return response(res, 'succes get detail depo', { result })
        } else {
          return response(res, 'failed get detail depo', {}, 404, false)
        }
      } else {
        const findFinance = await finance.findByPk(id)
        if (findFinance) {
          return response(res, 'succes get detail finance', { result: findFinance })
        } else {
          return response(res, 'failed get finance', {}, 404, false)
        }
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
        const header = ['KODE PLANT', 'PROFIT/COST CENTER', 'NAMA AREA', 'REGION', 'INISIAL', 'NO REK SPENDING CARD', 'NO REK ZBA', 'NO REK BANK COLL', 'PAGU IKK', 'SISTEM AREA', 'PIC CONSOLE', 'SPV FINANCE 1', 'SPV FINANCE 2', 'ASST MGR FIN', 'MGR FIN', 'PIC TAX', 'SPV TAX', 'ASMEN TAX', 'MGR TAX', 'AOS', 'ROM', 'BM', 'NOM', 'RBM', 'CHANNEL']
        const key = [
          'kode_plant',
          'profit_center',
          'area',
          'region',
          'inisial',
          'rek_spending',
          'rek_zba',
          'rek_bankcoll',
          'pagu',
          'type_live',
          'pic_finance',
          'spv_finance',
          'spv2_finance',
          'asman_finance',
          'manager_finance',
          'pic_tax',
          'spv_tax',
          'asman_tax',
          'manager_tax',
          'aos',
          'rom',
          'bm',
          'nom',
          'rbm',
          'channel'
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
          return response(res, 'failed create file finance', {}, 404, false)
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
  },
  updateChannel: async (req, res) => {
    try {
      const findFin = await finance.findAll({
        include: [
          {
            model: depo,
            as: 'depo'
          }
        ]
      })
      if (findFin.length > 0) {
        const cek = []
        for (let i = 0; i < findFin.length; i++) {
          const data = findFin[i]
          const cekCan = data.area.split(' ')[data.area.split(' ').length - 1]
          if (data.depo !== undefined && data.depo !== null) {
            const findData = await finance.findByPk(data.id)
            const send = {
              channel: data.depo.channel === undefined || data.depo.channel === null ? null : data.depo.channel
            }
            if (findData) {
              await findData.update(send)
              cek.push(findData)
            }
          } else {
            const findData = await finance.findByPk(data.id)
            const send = {
              channel: cekCan === 'MT' ? 'MT' : 'GT'
            }
            if (findData) {
              await findData.update(send)
              cek.push(findData)
            }
          }
        }
        if (cek.length > 0) {
          return response(res, 'success update channel', { result: cek })
        } else {
          return response(res, 'failed update channel', { result: cek }, 400, false)
        }
      } else {
        return response(res, 'failed update channel', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  }
}
