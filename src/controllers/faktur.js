const { faktur, shelfaktur } = require('../models')
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
const moment = require('moment')
const axios = require('axios')
const borderStyles = {
  top: { style: 'thin' },
  left: { style: 'thin' },
  bottom: { style: 'thin' },
  right: { style: 'thin' }
}

module.exports = {
  addFaktur: async (req, res) => {
    try {
      const schema = joi.object({
        no_faktur: joi.string().required(),
        tgl_faktur: joi.date().required(),
        npwp: joi.string().required(),
        nama: joi.string().required(),
        jumlah_dpp: joi.string().required(),
        jumlah_ppn: joi.string().required()
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 404, false)
      } else {
        const findNameFaktur = await faktur.findOne({
          where: {
            nama: { [Op.like]: `%${results.nama}` }
          }
        })
        if (findNameFaktur && (findNameFaktur.no_faktur === results.no_faktur)) {
          return response(res, 'no faktur telah terdftar', {}, 404, false)
        } else {
          const createFaktur = await faktur.create(results)
          if (createFaktur) {
            return response(res, 'success create faktur')
          } else {
            return response(res, 'false create faktur', {}, 404, false)
          }
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  updateFaktur: async (req, res) => {
    try {
      const id = req.params.id
      const schema = joi.object({
        no_faktur: joi.string().required(),
        tgl_faktur: joi.date().required(),
        npwp: joi.string().required(),
        nama: joi.string().required(),
        jumlah_dpp: joi.string().required(),
        jumlah_ppn: joi.string().required()
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 404, false)
      } else {
        const findNameFaktur = await faktur.findOne({
          where: {
            nama: { [Op.like]: `%${results.nama}` },
            [Op.not]: {
              id: id
            }
          }
        })
        if (findNameFaktur && (findNameFaktur.no_faktur === results.no_faktur)) {
          return response(res, 'no faktur telah terdftar', {}, 404, false)
        } else {
          const findFaktur = await faktur.findByPk(id)
          if (findFaktur) {
            const updateFaktur = await findFaktur.update(results)
            if (updateFaktur) {
              return response(res, 'success create faktur')
            } else {
              return response(res, 'false create faktur', {}, 404, false)
            }
          } else {
            return response(res, 'false create faktur', {}, 404, false)
          }
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  uploadMasterFaktur: async (req, res) => {
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
        const cek = ['NOMOR_FAKTUR', 'TANGGAL_FAKTUR', 'NPWP', 'NAMA', 'JUMLAH_DPP', 'JUMLAH_PPN']
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
            cost.push(`No faktur ${a[0]}`)
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
              const dataFaktur = rows[i]
              const select = await faktur.findOne({
                where: {
                  no_faktur: { [Op.like]: `%${dataFaktur[0]}%` }
                }
              })
              const data = {
                no_faktur: dataFaktur[0],
                tgl_faktur: dataFaktur[1],
                npwp: dataFaktur[2],
                nama: dataFaktur[3],
                jumlah_dpp: dataFaktur[4],
                jumlah_ppn: dataFaktur[5]
              }
              if (select) {
                const upbank = await select.update(data)
                if (upbank) {
                  arr.push(1)
                }
              } else {
                const createFaktur = await faktur.create(data)
                if (createFaktur) {
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
  getFaktur: async (req, res) => {
    try {
      // const nofaktur = req.params.faktur
      // const kode = req.user.kode
      const { npwp, noFaktur } = req.body
      if (npwp === undefined && noFaktur === undefined) {
        const findFaktur = await faktur.findAll({
          where: {
            status: null
          }
        })
        if (findFaktur.length > 0) {
          return response(res, 'succes get faktur', { result: findFaktur, length: findFaktur.length })
        } else {
          return response(res, 'failed get faktur', { result: findFaktur, length: findFaktur.length })
        }
      } else {
        const dataFind = npwp.replace(/[-' '.]/g, '')
        console.log(dataFind)
        const findFaktur = await faktur.findAll({
          where: {
            [Op.and]: [
              // dataFind === '' ? { [Op.not]: { id: null } } : { npwp: { [Op.like]: `%${dataFind}` } },
              { no_faktur: { [Op.like]: `%${noFaktur}` } }
            ]
          }
        })
        if (findFaktur.length > 0 && findFaktur[0].status === null) {
          const date1 = moment(findFaktur[0].tgl_faktur).format('M')
          const date2 = moment().format('M')
          const diffTime = Math.abs(date2 - date1)
          const diffMonth = Math.floor(diffTime)
          if (diffMonth > 3) {
            const findShel = await shelfaktur.findAll({
              where: {
                [Op.and]: [
                  { no_faktur: { [Op.like]: `%${noFaktur}` } }
                ]
              }
            })
            if (findShel.length > 0) {
              const data = {
                force: 1
              }
              const findData = await faktur.findByPk(findFaktur[0].id)
              if (findData) {
                const upFaktur = await findData.update(data)
                if (upFaktur) {
                  const findFinal = await faktur.findAll({
                    where: {
                      [Op.and]: [
                        { no_faktur: { [Op.like]: `%${noFaktur}` } }
                      ],
                      status: null
                    }
                  })
                  return response(res, 'succes get faktur', { result: findFinal, length: findFinal.length })
                }
              }
            } else {
              const findApi = await axios({
                method: 'get',
                url: `https://e-invoice.pinusmerahabadi.co.id/api/v1/invoice/${noFaktur}`,
                headers: {
                  'x-api-key': 'fEIoWslIEYpqtbzOdbTzq7p1C3SgHwn2gytQ3xCqFnsezSHdJxFkWjkbyuixGMkl'
                }
              }).then(response => { console.log(response); return (response) }).catch(err => { console.log(err); return (err) })
              if (findApi.status === 200) {
                const resdata = findApi.data.data
                const data = {
                  force: 1,
                  no_faktur: resdata.serial_number,
                  nama: resdata.seller,
                  jumlah_dpp: resdata.dpp.replace(/[^a-z0-9-]/g, ''),
                  jumlah_ppn: resdata.ppn.replace(/[^a-z0-9-]/g, ''),
                  tgl_faktur: resdata.date_invoice
                }
                const creFaktur = await faktur.create(data)
                if (creFaktur) {
                  const findFinal = await faktur.findAll({
                    where: {
                      [Op.and]: [
                        { no_faktur: { [Op.like]: `%${noFaktur}` } }
                      ],
                      status: null
                    }
                  })
                  return response(res, 'succes get faktur', { result: findFinal, length: findFinal.length })
                }
              } else {
                return response(res, 'failed get faktur', { result: findFaktur, length: findFaktur.length })
              }
            }
          } else {
            return response(res, 'succes get faktur', { result: findFaktur, length: findFaktur.length })
          }
        } else if (findFaktur.length === 0) {
          const findShel = await shelfaktur.findAll({
            where: {
              [Op.and]: [
                { no_faktur: { [Op.like]: `%${noFaktur}` } }
              ]
            }
          })
          if (findShel.length > 0) {
            const data = {
              force: 1,
              no_faktur: findShel[0].no_faktur,
              nama: findShel[0].nama,
              jumlah_dpp: findShel[0].jumlah_dpp.replace(/[^a-z0-9-]/g, ''),
              jumlah_ppn: findShel[0].jumlah_ppn.replace(/[^a-z0-9-]/g, ''),
              tgl_faktur: findShel[0].tgl_faktur
            }
            const upFaktur = await faktur.create(data)
            if (upFaktur) {
              const findFinal = await faktur.findAll({
                where: {
                  [Op.and]: [
                    { no_faktur: { [Op.like]: `%${noFaktur}` } }
                  ],
                  status: null
                }
              })
              return response(res, 'succes get faktur', { result: findFinal, length: findFinal.length })
            }
          } else {
            const findApi = await axios({
              method: 'get',
              url: `https://e-invoice.pinusmerahabadi.co.id/api/v1/invoice/${noFaktur}`,
              headers: {
                'x-api-key': 'fEIoWslIEYpqtbzOdbTzq7p1C3SgHwn2gytQ3xCqFnsezSHdJxFkWjkbyuixGMkl'
              }
            }).then(response => { console.log(response); return (response) }).catch(err => { console.log(err); return (err) })
            if (findApi.status === 200) {
              const resdata = findApi.data.data
              const data = {
                force: 1,
                no_faktur: resdata.serial_number,
                nama: resdata.seller,
                jumlah_dpp: resdata.dpp.replace(/[^a-z0-9-]/g, ''),
                jumlah_ppn: resdata.ppn.replace(/[^a-z0-9-]/g, ''),
                tgl_faktur: resdata.date_invoice
              }
              const creFaktur = await faktur.create(data)
              if (creFaktur) {
                const findFinal = await faktur.findAll({
                  where: {
                    [Op.and]: [
                      { no_faktur: { [Op.like]: `%${noFaktur}` } }
                    ],
                    status: null
                  }
                })
                return response(res, 'succes get faktur', { result: findFinal, length: findFinal.length })
              }
            } else {
              return response(res, 'failed get faktur', { result: findFaktur, length: findFaktur.length })
            }
          }
        } else {
          return response(res, 'failed get faktur', { result: findFaktur, length: findFaktur.length })
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getAllFaktur: async (req, res) => {
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
        const findLimit = await faktur.findAll()
        limit = findLimit.length
      } else {
        limit = parseInt(limit)
      }
      if (!page) {
        page = 1
      } else {
        page = parseInt(page)
      }
      const findFaktur = await faktur.findAndCountAll({
        where: {
          [Op.or]: [
            { nama: { [Op.like]: `%${searchValue}%` } },
            { npwp: { [Op.like]: `%${searchValue}%` } },
            { no_faktur: { [Op.like]: `%${searchValue}%` } },
            { tgl_faktur: { [Op.like]: `%${searchValue}%` } }
          ]
        },
        order: [[sortValue, 'DESC']],
        limit: limit,
        offset: (page - 1) * limit
      })
      const pageInfo = pagination('/faktur/get', req.query, page, limit, findFaktur.count)
      if (findFaktur) {
        return response(res, 'succes get faktur', { result: findFaktur, pageInfo })
      } else {
        return response(res, 'failed get faktur', { findFaktur }, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getDetailFaktur: async (req, res) => {
    try {
      const id = req.params.id
      const findFaktur = await faktur.findByPk(id)
      if (findFaktur) {
        return response(res, 'succes get detail faktur', { result: findFaktur })
      } else {
        return response(res, 'failed get faktur', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  deleteFaktur: async (req, res) => {
    try {
      const id = req.params.id
      const findFaktur = await faktur.findByPk(id)
      if (findFaktur) {
        const delFaktur = await findFaktur.destroy()
        if (delFaktur) {
          return response(res, 'succes delete faktur', { result: findFaktur })
        } else {
          return response(res, 'failed destroy faktur', {}, 404, false)
        }
      } else {
        return response(res, 'failed get faktur', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  exportSqlFaktur: async (req, res) => {
    try {
      const result = await faktur.findAll()
      if (result) {
        const workbook = new excel.Workbook()
        const worksheet = workbook.addWorksheet()
        const arr = []
        const header = ['NOMOR_FAKTUR', 'TANGGAL_FAKTUR', 'NPWP', 'NAMA', 'JUMLAH_DPP', 'JUMLAH_PPN']
        const key = ['no_faktur', 'tgl_faktur', 'npwp', 'nama', 'jumlah_dpp', 'jumlah_ppn']
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
          const name = new Date().getTime().toString().concat('-faktur').concat('.xlsx')
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
      const findFaktur = await faktur.findAll()
      if (findFaktur) {
        const temp = []
        for (let i = 0; i < findFaktur.length; i++) {
          const findDel = await faktur.findByPk(findFaktur[i].id)
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
  forceFaktur: async (req, res) => {
    try {
      const id = req.params.id
      const schema = joi.object({
        force: joi.number().required()
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 404, false)
      } else {
        const findFaktur = await faktur.findByPk(id)
        if (findFaktur) {
          const updateFaktur = await findFaktur.update(results)
          if (updateFaktur) {
            return response(res, 'success force faktur')
          } else {
            return response(res, 'false force faktur', {}, 404, false)
          }
        } else {
          return response(res, 'false force faktur', {}, 404, false)
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getShelFaktur: async (req, res) => {
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
        const findLimit = await shelfaktur.findAll()
        limit = findLimit.length
      } else {
        limit = parseInt(limit)
      }
      if (!page) {
        page = 1
      } else {
        page = parseInt(page)
      }
      const findFaktur = await shelfaktur.findAndCountAll({
        where: {
          [Op.or]: [
            { nama: { [Op.like]: `%${searchValue}%` } },
            // { npwp: { [Op.like]: `%${searchValue}%` } },
            { no_faktur: { [Op.like]: `%${searchValue}%` } },
            { tgl_faktur: { [Op.like]: `%${searchValue}%` } }
          ]
        },
        order: [[sortValue, 'DESC']],
        limit: limit,
        offset: (page - 1) * limit
      })
      const pageInfo = pagination('/faktur/shelfaktur', req.query, page, limit, findFaktur.count)
      if (findFaktur) {
        return response(res, 'succes get faktur', { result: findFaktur, pageInfo })
      } else {
        return response(res, 'failed get faktur', { findFaktur }, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  syncFaktur: async (req, res) => {
    try {
      const { date1, date2, faktur, type } = req.query
      const timeSync1 = moment().subtract(1, 'month').startOf('month').format('YYYY-MM-DD')
      const timeSync2 = moment().endOf('month').add(1, 'd').format('YYYY-MM-DD')
      const time1 = date1 === undefined || date1 === 'undefined' || date1 === null || date1 === 'null' ? timeSync1 : moment(date1).format('YYYY-MM-DD')
      const time2 = date2 === undefined || date2 === 'undefined' || date2 === null || date2 === 'null' ? timeSync2 : moment(date2).format('YYYY-MM-DD')
      // const cekfaktur = faktur === undefined || faktur === 'undefined' || faktur === null || faktur === 'null' || faktur === '' ? 'no' : 'yes'
      if (type === 'no') {
        const findApi = await axios({
          method: 'get',
          url: `https://e-invoice.pinusmerahabadi.co.id/api/v1/invoice/${faktur}`,
          headers: {
            'x-api-key': 'fEIoWslIEYpqtbzOdbTzq7p1C3SgHwn2gytQ3xCqFnsezSHdJxFkWjkbyuixGMkl'
          }
        }).then(response => { console.log('response'); return (response) }).catch(err => { console.log('err'); return (err) })
        console.log(findApi.status)
        if (findApi.status === 200 && findApi.data.data !== null) {
          const resdata = findApi.data.data
          const data = {
            no_faktur: resdata.serial_number,
            nama: resdata.seller,
            jumlah_dpp: resdata.dpp.replace(/[^a-z0-9-]/g, ''),
            jumlah_ppn: resdata.ppn.replace(/[^a-z0-9-]/g, ''),
            tgl_faktur: resdata.date_invoice
          }
          const creFaktur = await shelfaktur.create(data)
          if (creFaktur) {
            const findFinal = await shelfaktur.findAll({
              where: {
                [Op.and]: [
                  { no_faktur: { [Op.like]: `%${faktur}` } }
                ],
                status: null
              }
            })
            return response(res, 'succes get faktur', { result: findFinal, length: findFinal.length })
          }
        } else {
          return response(res, 'failed get faktur', { result: findApi.data, length: 0 }, 400, false)
        }
      } else {
        const getInvoice = await axios({
          method: 'get',
          url: `https://e-invoice.pinusmerahabadi.co.id/api/v1/invoice-ranges/${time1}/${time2}`,
          headers: {
            'x-api-key': 'fEIoWslIEYpqtbzOdbTzq7p1C3SgHwn2gytQ3xCqFnsezSHdJxFkWjkbyuixGMkl'
          }
        }).then(response => { console.log(response); return (response) }).catch(err => { console.log(err); return (err) })
        if (getInvoice.status === 200 && getInvoice.data.data.length > 0) {
          const temp = []
          const dataInvoice = getInvoice.data.data
          for (let i = 0; i < dataInvoice.length; i++) {
            const findData = await shelfaktur.findOne({
              where: {
                no_faktur: dataInvoice[i].serial_number
              }
            })
            if (findData) {
              temp.push(findData)
            } else {
              const data = {
                no_faktur: dataInvoice[i].serial_number,
                nama: dataInvoice[i].seller,
                jumlah_dpp: dataInvoice[i].dpp.replace(/[^a-z0-9-]/g, ''),
                jumlah_ppn: dataInvoice[i].ppn.replace(/[^a-z0-9-]/g, ''),
                tgl_faktur: dataInvoice[i].date_invoice,
                data: dataInvoice[i].toString()
              }
              const createData = await shelfaktur.create(data)
              if (createData) {
                temp.push(createData)
              }
            }
          }
          if (temp.length > 0) {
            return response(res, getInvoice.message, { result: getInvoice.data })
          } else {
            return response(res, getInvoice.message, { result: getInvoice.data })
          }
        } else {
          return response(res, 'failed get data', { getInvoice }, 400, false)
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  deleteRawFaktur: async (req, res) => {
    try {
      const schema = joi.object({
        list: joi.array()
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 404, false)
      } else {
        const temp = []
        const list = results.list
        for (let i = 0; i < list.length; i++) {
          const findId = await faktur.findByPk(list[i].id)
          if (findId) {
            const deleteId = await findId.destroy()
            if (deleteId) {
              temp.push(findId)
            }
          }
        }
        if (temp.length > 0) {
          return response(res, 'succes delete raw faktur', { temp })
        } else {
          return response(res, 'gagal delete raw faktur', { temp })
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  }
}
