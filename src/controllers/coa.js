const { coa, veriftax, depo } = require('../models')
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
  addCoa: async (req, res) => {
    try {
      const schema = joi.object({
        no_coa: joi.string().required(),
        nama_coa: joi.string().required(),
        nama_subcoa: joi.string().required(),
        tipe: joi.string().required()
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 404, false)
      } else {
        const findNameCoa = await coa.findOne({
          where: {
            nama_subcoa: { [Op.like]: `%${results.nama_subcoa}` }
          }
        })
        if (findNameCoa && (findNameCoa.nama_coa === results.nama_coa || findNameCoa.no_coa === results.no_coa)) {
          return response(res, 'nama coa telah terdftar', {}, 404, false)
        } else {
          const createCoa = await coa.create(results)
          if (createCoa) {
            return response(res, 'success create coa')
          } else {
            return response(res, 'false create coa', {}, 404, false)
          }
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  updateCoa: async (req, res) => {
    try {
      const id = req.params.id
      const schema = joi.object({
        no_coa: joi.string().required(),
        nama_coa: joi.string().required(),
        nama_subcoa: joi.string().required(),
        tipe: joi.string().required()
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 404, false)
      } else {
        const findNameCoa = await coa.findOne({
          where: {
            nama_subcoa: { [Op.like]: `%${results.nama_subcoa}` },
            [Op.not]: {
              id: id
            }
          }
        })
        if (findNameCoa && (findNameCoa.nama_coa === results.nama_coa || findNameCoa.no_coa === results.no_coa)) {
          return response(res, 'nama coa telah terdftar', {}, 404, false)
        } else {
          const findCoa = await coa.findByPk(id)
          if (findCoa) {
            const updateCoa = await findCoa.update(results)
            if (updateCoa) {
              return response(res, 'success create coa')
            } else {
              return response(res, 'false create coa', {}, 404, false)
            }
          } else {
            return response(res, 'false create coa', {}, 404, false)
          }
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  uploadMasterCoa: async (req, res) => {
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
          const cek = ['NO COA', 'NAMA COA', 'NAMA SUB COA', 'TIPE COA']
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
              cost.push(`Nama Sub Coa ${a[2]} dan No Coa ${a[0]}`)
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
                const dataCoa = rows[i]
                const select = await coa.findOne({
                  where: {
                    [Op.and]: [
                      { no_coa: { [Op.like]: `%${dataCoa[0]}%` } },
                      { nama_subcoa: { [Op.like]: `%${dataCoa[2]}%` } }
                    ]
                  }
                })
                if (select) {
                  const data = {
                    no_coa: dataCoa[0],
                    nama_coa: dataCoa[1],
                    nama_subcoa: dataCoa[2],
                    tipe: dataCoa[3]
                  }
                  const upbank = await select.update(data)
                  if (upbank) {
                    arr.push(1)
                  }
                } else {
                  const data = {
                    no_coa: dataCoa[0],
                    nama_coa: dataCoa[1],
                    nama_subcoa: dataCoa[2],
                    tipe: dataCoa[3]
                  }
                  const createCoa = await coa.create(data)
                  if (createCoa) {
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
  getCoa: async (req, res) => {
    try {
      const tipe = req.params.tipe
      const kode = req.user.kode
      const listGl = [52010402, 524112, 55050009, 548519, 63050009, 52010401, 524111]
      const listPma = [52010402, 524112, 55050009, 548519, 63050009, 52010401, 524111]
      const listKasbon = [54010201, 55010102, 55030001, 55030002, 55010302]
      if (tipe === 'ikk') {
        const findDepo = await depo.findOne({
          where: {
            kode_plant: { [Op.like]: `%${kode}` }
          }
        })
        if (findDepo) {
          const findTarif = await veriftax.findAll({
            where: {
              [Op.and]: [
                { system: { [Op.like]: `%${findDepo.status_area}` } },
                { grouping: { [Op.like]: '%NON KASBON' } }
              ]
            },
            group: ['gl_account']
          })
          if (findTarif.length > 0) {
            const findAllTarif = await veriftax.findAll({
              where: {
                system: { [Op.like]: `%${findDepo.status_area}` }
              }
            })
            if (findAllTarif.length > 0) {
              return response(res, 'succes get tarif', { result: findTarif, length: findAllTarif, listGl, listPma })
            } else {
              return response(res, 'failed get tarif3', {}, 404, false)
            }
          } else {
            return response(res, 'failed get tarif2', {}, 404, false)
          }
        } else {
          return response(res, 'failed get tarif1', {}, 404, false)
        }
      } else if (tipe === 'kasbon') {
        const dataAll = []
        const data = []
        for (let i = 0; i < listKasbon.length; i++) {
          const findTarif = await veriftax.findAll({
            where: {
              gl_account: { [Op.like]: `%${listKasbon[i]}` }
            },
            group: ['gl_account']
          })
          if (findTarif.length > 0) {
            const findAllTarif = await veriftax.findAll({
              where: {
                gl_account: { [Op.like]: `%${listKasbon[i]}` }
              }
            })
            if (findAllTarif.length > 0) {
              data.push(findTarif[0])
              for (let j = 0; j < findAllTarif.length; j++) {
                dataAll.push(findAllTarif[j])
              }
            }
          }
        }
        if (dataAll.length > 0) {
          return response(res, 'succes get tarif', { result: data, length: dataAll, listGl, listPma })
        } else {
          return response(res, 'failed get tarif3', {}, 404, false)
        }
      } else if (tipe === 'ops') {
        const findDepo = await depo.findOne({
          where: {
            kode_plant: { [Op.like]: `%${kode}` }
          }
        })
        if (findDepo) {
          const findTarif = await veriftax.findAll({
            where: {
              system: { [Op.like]: `%${findDepo.status_area}` }
            },
            group: ['gl_account']
          })
          if (findTarif.length > 0) {
            const findAllTarif = await veriftax.findAll({
              where: {
                system: { [Op.like]: `%${findDepo.status_area}` }
              }
            })
            if (findAllTarif.length > 0) {
              return response(res, 'succes get tarif', { result: findTarif, length: findAllTarif, listGl, listPma })
            } else {
              return response(res, 'failed get tarif3', {}, 404, false)
            }
          } else {
            return response(res, 'failed get tarif2', {}, 404, false)
          }
        } else {
          return response(res, 'failed get tarif1', {}, 404, false)
        }
      } else {
        const findCoa = await coa.findAll({
          where: {
            tipe: { [Op.like]: `%${tipe}` }
          }
        })
        if (findCoa.length > 0) {
          return response(res, 'succes get coa', { result: findCoa, length: findCoa.length, listGl })
        } else {
          return response(res, 'failed get coa', {}, 404, false)
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getAllCoa: async (req, res) => {
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
      const findCoa = await coa.findAndCountAll({
        where: {
          [Op.or]: [
            { no_coa: { [Op.like]: `%${searchValue}%` } },
            { nama_coa: { [Op.like]: `%${searchValue}%` } },
            { nama_subcoa: { [Op.like]: `%${searchValue}%` } }
          ]
        },
        order: [[sortValue, 'ASC']],
        limit: limit,
        offset: (page - 1) * limit
      })
      const pageInfo = pagination('/coa/get', req.query, page, limit, findCoa.count)
      if (findCoa.rows.length > 0) {
        return response(res, 'succes get coa', { result: findCoa, pageInfo })
      } else {
        return response(res, 'failed get coa', { findCoa }, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getDetailCoa: async (req, res) => {
    try {
      const id = req.params.id
      const findCoa = await coa.findByPk(id)
      if (findCoa) {
        return response(res, 'succes get detail coa', { result: findCoa })
      } else {
        return response(res, 'failed get coa', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  deleteCoa: async (req, res) => {
    try {
      const id = req.params.id
      const findCoa = await coa.findByPk(id)
      if (findCoa) {
        const delCoa = await findCoa.destroy()
        if (delCoa) {
          return response(res, 'succes delete coa', { result: findCoa })
        } else {
          return response(res, 'failed destroy coa', {}, 404, false)
        }
      } else {
        return response(res, 'failed get coa', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  exportSqlCoa: async (req, res) => {
    try {
      const result = await coa.findAll()
      if (result) {
        const workbook = new excel.Workbook()
        const worksheet = workbook.addWorksheet()
        const arr = []
        const header = ['NO COA', 'NAMA COA', 'NAMA SUB COA', 'TIPE COA']
        const key = ['no_coa', 'nama_coa', 'nama_subcoa', 'tipe']
        for (let i = 0; i < header.length; i++) {
          let temp = { header: header[i], key: key[i] }
          arr.push(temp)
          temp = {}
        }
        worksheet.columns = arr
        const cek = worksheet.addRows(result)
        if (cek) {
          const name = new Date().getTime().toString().concat('-coa').concat('.xlsx')
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
      const findCoa = await coa.findAll()
      if (findCoa) {
        const temp = []
        for (let i = 0; i < findCoa.length; i++) {
          const findDel = await coa.findByPk(findCoa[i].id)
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
