const { reservoir, depo, klaim, ikk, ops } = require('../models')
// const joi = require('joi')
const { Op } = require('sequelize')
const response = require('../helpers/response')
const { pagination } = require('../helpers/pagination')
const moment = require('moment')
// const fs = require('fs')
// const uploadMaster = require('../helpers/uploadMaster')
// const readXlsxFile = require('read-excel-file/node')
// const multer = require('multer')
// const excel = require('exceljs')
// const vs = require('fs-extra')
// const { APP_URL } = process.env

module.exports = {
  getAllReser: async (req, res) => {
    try {
      const kode = req.user.kode
      const findDep = await depo.findOne({
        where: {
          kode_plant: { [Op.like]: `%${kode}%` }
        }
      })
      if (findDep) {
        const findReser = await reservoir.findAll({
          where: {
            kode_plant: { [Op.like]: `%${findDep.kode_plant}%` }
          }
        })
        if (findReser.length > 0) {
          return response(res, 'succes get reservoir', { result: findReser, length: findReser.length })
        } else {
          return response(res, 'failed get reservoir', {}, 404, false)
        }
      } else {
        return response(res, 'failed get reservoir', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getReser: async (req, res) => {
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
      const findReser = await reservoir.findAndCountAll({
        where: {
          [Op.or]: [
            { no_transaksi: { [Op.like]: `%${searchValue}%` } },
            { kode_plant: { [Op.like]: `%${searchValue}%` } },
            { transaksi: { [Op.like]: `%${searchValue}%` } },
            { tipe: { [Op.like]: `%${searchValue}%` } },
            { status: { [Op.like]: `%${searchValue}%` } }
          ]
        },
        order: [[sortValue, 'DESC']],
        limit: limit,
        offset: (page - 1) * limit
      })
      const pageInfo = pagination('/reservoir/get', req.query, page, limit, findReser.count)
      if (findReser) {
        return response(res, 'succes get reservoir', { result: findReser, pageInfo })
      } else {
        return response(res, 'failed get reservoir', { findReser }, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getDetailReser: async (req, res) => {
    try {
      const id = req.params.id
      const findReser = await reservoir.findByPk(id)
      if (findReser) {
        return response(res, 'succes get detail reservoir', { result: findReser })
      } else {
        return response(res, 'failed get reservoir', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  deleteReser: async (req, res) => {
    try {
      const id = req.params.id
      const findReser = await reservoir.findByPk(id)
      if (findReser) {
        const delReser = await findReser.destroy()
        if (delReser) {
          return response(res, 'succes delete reservoir', { result: findReser })
        } else {
          return response(res, 'failed destroy reservoir', {}, 404, false)
        }
      } else {
        return response(res, 'failed get reservoir', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  deleteAll: async (req, res) => {
    try {
      const findReser = await reservoir.findAll()
      if (findReser) {
        const temp = []
        for (let i = 0; i < findReser.length; i++) {
          const findDel = await reservoir.findByPk(findReser[i].id)
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
  genTrans: async (req, res) => {
    try {
      const findIkk = await ikk.findAll({
        where: {
          [Op.not]: { no_transaksi: null }
        },
        group: ['no_transaksi']
      })
      const findOps = await ops.findAll({
        where: {
          [Op.not]: { no_transaksi: null }
        },
        group: ['no_transaksi']
      })
      const findKlaim = await klaim.findAll({
        where: {
          [Op.not]: { no_transaksi: null }
        },
        group: ['no_transaksi']
      })
      if (findIkk && findOps && findKlaim) {
        const temp = []
        for (let i = 0; i < findIkk.length; i++) {
          const data = {
            no_transaksi: findIkk[i].no_transaksi,
            kode_plant: findIkk[i].kode_plant,
            transaksi: 'ikk',
            tipe: 'area',
            status: findIkk[i].status_transaksi === 1 ? 'expired' : 'used',
            createdAt: findIkk[i].start_ikk
          }
          const findData = await reservoir.findOne({
            where: {
              no_transaksi: findIkk[i].no_transaksi
            }
          })
          if (findData) {
            console.log(findData)
          } else {
            const creData = await reservoir.create(data)
            temp.push(creData)
          }
        }
        for (let i = 0; i < findOps.length; i++) {
          const data = {
            no_transaksi: findOps[i].no_transaksi,
            kode_plant: findOps[i].kode_plant,
            transaksi: 'ops',
            tipe: 'area',
            status: findOps[i].status_transaksi === 1 ? 'expired' : 'used',
            createdAt: findOps[i].start_ops
          }
          const findData = await reservoir.findOne({
            where: {
              no_transaksi: findOps[i].no_transaksi
            }
          })
          if (findData) {
            console.log(findData)
          } else {
            const creData = await reservoir.create(data)
            temp.push(creData)
          }
        }
        for (let i = 0; i < findKlaim.length; i++) {
          const data = {
            no_transaksi: findKlaim[i].no_transaksi,
            kode_plant: findKlaim[i].kode_plant,
            transaksi: 'klaim',
            tipe: 'area',
            status: findKlaim[i].status_transaksi === 1 ? 'expired' : 'used',
            createdAt: findKlaim[i].start_klaim
          }
          const findData = await reservoir.findOne({
            where: {
              no_transaksi: findKlaim[i].no_transaksi
            }
          })
          if (findData) {
            console.log(findData)
          } else {
            const creData = await reservoir.create(data)
            temp.push(creData)
          }
        }
        if (temp.length > 0) {
          return response(res, 'success input no transaksi')
        } else {
          return response(res, 'semua no transaksi telah terinput')
        }
      } else {
        return response(res, 'failed generate no transaksi', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  genPemb: async (req, res) => {
    try {
      const findIkk = await ikk.findAll({
        where: {
          [Op.not]: { no_pembayaran: null }
        },
        group: ['no_pembayaran']
      })
      const findOps = await ops.findAll({
        where: {
          [Op.not]: { no_pembayaran: null }
        },
        group: ['no_pembayaran']
      })
      const findKlaim = await klaim.findAll({
        where: {
          [Op.not]: { no_pembayaran: null }
        },
        group: ['no_pembayaran']
      })
      if (findIkk && findOps && findKlaim) {
        const temp = []
        for (let i = 0; i < findIkk.length; i++) {
          const data = {
            no_transaksi: findIkk[i].no_pembayaran,
            transaksi: 'ikk',
            tipe: 'ho',
            status: 'used',
            createdAt: findIkk[i].tgl_sublist
          }
          const findData = await reservoir.findOne({
            where: {
              no_transaksi: findIkk[i].no_pembayaran
            }
          })
          if (findData) {
            console.log(findData)
          } else {
            const creData = await reservoir.create(data)
            temp.push(creData)
          }
        }
        for (let i = 0; i < findOps.length; i++) {
          const data = {
            no_transaksi: findOps[i].no_pembayaran,
            transaksi: 'ops',
            tipe: 'ho',
            status: 'used',
            createdAt: findOps[i].tgl_sublist
          }
          const findData = await reservoir.findOne({
            where: {
              no_transaksi: findOps[i].no_pembayaran
            }
          })
          if (findData) {
            console.log(findData)
          } else {
            const creData = await reservoir.create(data)
            temp.push(creData)
          }
        }
        for (let i = 0; i < findKlaim.length; i++) {
          const data = {
            no_transaksi: findKlaim[i].no_pembayaran,
            transaksi: 'klaim',
            tipe: 'ho',
            status: 'used',
            createdAt: findKlaim[i].tgl_sublist
          }
          const findData = await reservoir.findOne({
            where: {
              no_transaksi: findKlaim[i].no_pembayaran
            }
          })
          if (findData) {
            console.log(findData)
          } else {
            const creData = await reservoir.create(data)
            temp.push(creData)
          }
        }
        if (temp.length > 0) {
          return response(res, 'success input no transaksi')
        } else {
          return response(res, 'semua no transaksi telah terinput')
        }
      } else {
        return response(res, 'failed generate no transaksi', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getTimeReser: async (req, res) => {
    try {
      const time = moment().subtract(5, 'd').format('DD MMMM YYYY')
      const time2 = moment().subtract(1, 'd').format('DD MMMM YYYY')
      const findData = await reservoir.findAll({
        where: {
          status: 'used',
          createdAt: {
            [Op.gte]: time,
            [Op.lte]: time2
          }
        }
      })
      if (findData.length > 0) {
        return response(res, 'get data reser', { findData, count: findData.length })
      } else {
        return response(res, 'get data reser failed', {}, 400, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  }
}
