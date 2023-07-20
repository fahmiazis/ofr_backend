const { reason } = require('../models')
const joi = require('joi')
const { Op } = require('sequelize')
const response = require('../helpers/response')
const { pagination } = require('../helpers/pagination')
// const fs = require('fs')
// const uploadMaster = require('../helpers/uploadMaster')
// const readXlsxFile = require('read-excel-file/node')
// const multer = require('multer')
// const excel = require('exceljs')
// const vs = require('fs-extra')
// const { APP_URL } = process.env

module.exports = {
  addReason: async (req, res) => {
    try {
      const schema = joi.object({
        desc: joi.string().required(),
        route: joi.string().required()
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 404, false)
      } else {
        const findName = await reason.findOne({
          where: {
            desc: { [Op.like]: `%${results.desc}` }
          }
        })
        if (findName && (findName.desc === results.desc)) {
          return response(res, 'reason telah terdftar', {}, 404, false)
        } else {
          const createReason = await reason.create(results)
          if (createReason) {
            return response(res, 'success create reason')
          } else {
            return response(res, 'failed create reason', {}, 404, false)
          }
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  updateReason: async (req, res) => {
    try {
      const id = req.params.id
      const schema = joi.object({
        desc: joi.string().required(),
        route: joi.string().required()
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 404, false)
      } else {
        const findName = await reason.findOne({
          where: {
            desc: { [Op.like]: `%${results.desc}` },
            [Op.not]: {
              id: id
            }
          }
        })
        if (findName && (findName.desc === results.desc)) {
          return response(res, 'nama reason telah terdaftar', {}, 404, false)
        } else {
          const findReason = await reason.findByPk(id)
          if (findReason) {
            const updateReason = await findReason.update(results)
            if (updateReason) {
              return response(res, 'success create reason')
            } else {
              return response(res, 'failed create reason', {}, 404, false)
            }
          } else {
            return response(res, 'failed create reason', {}, 404, false)
          }
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getAllReason: async (req, res) => {
    try {
      const arrReason = [
        { id: 'open', desc: 'realisasi lebih besar dari nilai pengajuan awal' },
        { id: 'close', desc: 'realisasi lebih kecil dari nilai pengajuan awal' }
      ]
      const findReason = await reason.findAll()
      if (findReason.length > 0) {
        return response(res, 'succes get reason', { result: findReason, arrReason, length: findReason.length })
      } else {
        return response(res, 'failed get reason', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getReason: async (req, res) => {
    try {
      let { limit, page, search, sort } = req.query
      const arrReason = [
        { id: 'open', desc: 'realisasi lebih besar dari nilai pengajuan awal' },
        { id: 'close', desc: 'realisasi lebih kecil dari nilai pengajuan awal' }
      ]
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
      const findReason = await reason.findAndCountAll({
        where: {
          [Op.or]: [
            { desc: { [Op.like]: `%${searchValue}%` } }
          ]
        },
        order: [[sortValue, 'ASC']],
        limit: limit,
        offset: (page - 1) * limit
      })
      const pageInfo = pagination('/reason/get', req.query, page, limit, findReason.count)
      if (findReason.rows.length > 0) {
        return response(res, 'succes get reason', { result: findReason, arrReason, pageInfo })
      } else {
        return response(res, 'failed get reason', { findReason }, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getDetailReason: async (req, res) => {
    try {
      const id = req.params.id
      const findReason = await reason.findByPk(id)
      if (findReason) {
        return response(res, 'succes get detail reason', { result: findReason })
      } else {
        return response(res, 'failed get reason', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  deleteReason: async (req, res) => {
    try {
      const id = req.params.id
      const findReason = await reason.findByPk(id)
      if (findReason) {
        const delReason = await findReason.destroy()
        if (delReason) {
          return response(res, 'succes delete reason', { result: findReason })
        } else {
          return response(res, 'failed destroy reason', {}, 404, false)
        }
      } else {
        return response(res, 'failed get reason', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  deleteAll: async (req, res) => {
    try {
      const findReason = await reason.findAll()
      if (findReason) {
        const temp = []
        for (let i = 0; i < findReason.length; i++) {
          const findDel = await reason.findByPk(findReason[i].id)
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
