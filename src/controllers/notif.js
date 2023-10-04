const { notif, ikk, klaim, ops, role } = require('../models')
const { Op } = require('sequelize')
const response = require('../helpers/response')
const { pagination } = require('../helpers/pagination')

module.exports = {
  addNotif: async (req, res) => {
    try {
      const level = req.user.level
      const { nameTo, no, tipe, jenis, menu, proses, route } = req.body
      const findRole = await role.findOne({
        where: {
          level: level
        }
      })
      if (findRole) {
        const transaksi = tipe === 'ikk' ? ikk : tipe === 'klaim' ? klaim : ops
        const findData = await transaksi.findAll({
          where: {
            [Op.and]: [
              jenis === 'ajuan' ? { no_pembayaran: no } : { no_transaksi: no }
            ]
          }
        })
        if (findData) {
          const findNotif = await notif.findOne({
            where: {
              [Op.and]: [
                { user: { [Op.like]: `%${nameTo}%` } },
                { no_transaksi: { [Op.like]: `%${no}%` } },
                { proses: { [Op.like]: `%${menu}%` } },
                { tipe: { [Op.like]: `%${proses}%` } }
              ]
            }
          })
          if (findNotif) {
            return response(res, 'success create notif', { findNotif })
          } else {
            const data = {
              user: nameTo,
              kode_plant: findData[0].kode_plant,
              transaksi: tipe,
              proses: menu,
              no_transaksi: no,
              tipe: proses,
              routes: route
            }
            const createNotif = await notif.create(data)
            if (createNotif) {
              return response(res, 'success create notif', { createNotif })
            } else {
              return response(res, 'failed create notif', { createNotif }, 404, false)
            }
          }
        } else {
          return response(res, 'failed create notif', { findData }, 404, false)
        }
      } else {
        return response(res, 'failed get notif', { findRole }, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  readNotif: async (req, res) => {
    try {
      const id = req.params.id
      const findNotif = await notif.findByPk(id)
      if (findNotif) {
        const data = {
          status: 1
        }
        const updateNotif = await findNotif.update(data)
        if (updateNotif) {
          return response(res, 'success read notif')
        } else {
          return response(res, 'failed read notif', {}, 404, false)
        }
      } else {
        return response(res, 'failed read notif', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getAllNotif: async (req, res) => {
    try {
      const name = req.user.name
      const findNotif = await notif.findAll({
        where: {
          user: { [Op.like]: `%${name}%` }
        }
      })
      if (findNotif.length > 0) {
        return response(res, 'succes get notif', { result: findNotif, length: findNotif.length })
      } else {
        return response(res, 'failed get notif', { result: [], length: 0 })
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getNotif: async (req, res) => {
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
      const findNotif = await notif.findAndCountAll({
        where: {
          [Op.or]: [
            { type: { [Op.like]: `%${searchValue}%` } },
            { menu: { [Op.like]: `%${searchValue}%` } }
          ]
        },
        order: [[sortValue, 'ASC']],
        limit: limit,
        offset: (page - 1) * limit
      })
      const pageInfo = pagination('/notif/get', req.query, page, limit, findNotif.count)
      if (findNotif.rows.length > 0) {
        return response(res, 'succes get notif', { result: findNotif, pageInfo })
      } else {
        return response(res, 'failed get notif', { findNotif }, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  deleteNotif: async (req, res) => {
    try {
      const id = req.params.id
      const findNotif = await notif.findByPk(id)
      if (findNotif) {
        const desNotif = await findNotif.destroy()
        if (desNotif) {
          return response(res, 'success delete notif', {}, 404, false)
        } else {
          return response(res, 'failed delete notif', {}, 404, false)
        }
      } else {
        return response(res, 'failed delete notif', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  deleteAll: async (req, res) => {
    try {
      const name = req.user.name
      const findNotif = await notif.findAll({
        where: {
          user: { [Op.like]: `%${name}%` }
        }
      })
      if (findNotif) {
        const temp = []
        for (let i = 0; i < findNotif.length; i++) {
          const findDel = await notif.findByPk(findNotif[i].id)
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
