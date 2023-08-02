const { email, ttd, role, depo, user, ops, klaim, ikk } = require('../models')
const joi = require('joi')
const { Op } = require('sequelize')
const response = require('../helpers/response')
const { pagination } = require('../helpers/pagination')
const wrapMail = require('../helpers/wrapMail')
const moment = require('moment')

module.exports = {
  addEmail: async (req, res) => {
    try {
      const schema = joi.object({
        type: joi.string().required(),
        menu: joi.string().required(),
        access: joi.string().required(),
        status: joi.string().required(),
        cc: joi.string().allow(''),
        to: joi.string().allow(''),
        message: joi.string().required()
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 404, false)
      } else {
        const findName = await email.findOne({
          where: {
            [Op.and]: [
              { type: { [Op.like]: `%${results.type}` } },
              { menu: { [Op.like]: `%${results.menu}` } }
            ]
          }
        })
        if (findName && (findName.type === results.type) && (findName.menu === results.menu) && (findName.access === results.access)) {
          return response(res, 'draft email telah terdftar')
        } else {
          const createEmail = await email.create(results)
          if (createEmail) {
            return response(res, 'success create email')
          } else {
            return response(res, 'failed create email', {}, 404, false)
          }
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  updateEmail: async (req, res) => {
    try {
      const id = req.params.id
      const schema = joi.object({
        type: joi.string().required(),
        menu: joi.string().required(),
        access: joi.string().required(),
        status: joi.string().required(),
        cc: joi.string().allow(''),
        to: joi.string().allow(''),
        message: joi.string().required()
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 404, false)
      } else {
        const findName = await email.findOne({
          where: {
            [Op.and]: [
              { type: { [Op.like]: `%${results.type}` } },
              { menu: { [Op.like]: `%${results.menu}` } }
            ],
            [Op.not]: {
              id: id
            }
          }
        })
        if (findName && (findName.type === results.type) && (findName.menu === results.menu) && (findName.access === results.access)) {
          return response(res, 'draft email telah terdaftar')
        } else {
          const findEmail = await email.findByPk(id)
          if (findEmail) {
            const updateEmail = await findEmail.update(results)
            if (updateEmail) {
              return response(res, 'success create email')
            } else {
              return response(res, 'failed create email', {}, 404, false)
            }
          } else {
            return response(res, 'failed create email', {}, 404, false)
          }
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getAllEmail: async (req, res) => {
    try {
      const findEmail = await email.findAll()
      if (findEmail.length > 0) {
        return response(res, 'succes get email', { result: findEmail, length: findEmail.length })
      } else {
        return response(res, 'failed get email', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getEmail: async (req, res) => {
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
      const findEmail = await email.findAndCountAll({
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
      const pageInfo = pagination('/email/get', req.query, page, limit, findEmail.count)
      if (findEmail.rows.length > 0) {
        return response(res, 'succes get email', { result: findEmail, pageInfo })
      } else {
        return response(res, 'failed get email', { findEmail }, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  draftEmail: async (req, res) => {
    try {
      const name = req.user.name
      const level = req.user.level
      const { no, kode, tipe, menu, jenis } = req.body
      const transaksi = jenis === 'ikk' ? ikk : jenis === 'klaim' ? klaim : ops
      const statVerif = (jenis === 'ikk' || jenis === 'ops') && level === 2 ? 4 : jenis === 'klaim' && level === 2 ? 3 : 2
      const findRole = await role.findOne({
        where: {
          level: level
        }
      })
      const findDepo = await depo.findOne({
        where: {
          kode_plant: kode
        }
      })
      const findTrans = await transaksi.findOne({
        where: {
          no_transaksi: no
        }
      })
      if (findRole && findDepo && findTrans) {
        const listName = Object.values(findDepo.dataValues)
        if (tipe === 'approve') {
          const findApp = await ttd.findAll({
            where: {
              no_transaksi: no
            }
          })
          if (findApp.length > 0) {
            const findDraft = await email.findOne({
              where: {
                [Op.and]: [
                  { type: { [Op.like]: `%${tipe}` } },
                  { menu: { [Op.like]: `%${menu}` } }
                ],
                [Op.or]: [
                  { access: { [Op.like]: '%all' } },
                  { access: { [Op.like]: `%${kode}` } }
                ]
              }
            })
            if (findDraft) {
              const temp = []
              const arrCc = findDraft.cc.split(',')
              for (let i = 0; i < arrCc.length; i++) {
                const findLevel = await role.findOne({
                  where: {
                    name: arrCc[i]
                  }
                })
                if (findLevel && findLevel.type === 'area') {
                  const findDraftUser = await user.findAll({
                    where: {
                      level: findLevel.level
                    },
                    include: [
                      {
                        model: role,
                        as: 'role'
                      }
                    ]
                  })
                  if (findDraftUser) {
                    for (let i = 0; i < findDraftUser.length; i++) {
                      const findName = findDraftUser[i].username === null ? '' : findDraftUser[i].username
                      if (listName.find(e => e !== null && e.toString().toLowerCase() === findName.toLowerCase()) !== undefined) {
                        temp.push(findDraftUser[i])
                      }
                    }
                  }
                } else if (findLevel && findLevel.type !== 'area') {
                  const findDraftUser = await user.findOne({
                    where: {
                      level: findLevel.level
                    },
                    include: [
                      {
                        model: role,
                        as: 'role'
                      }
                    ]
                  })
                  if (findDraftUser) {
                    temp.push(findDraftUser)
                  }
                }
              }
              if (temp.length > 0) {
                let noLevel = null
                let arr = null
                for (let i = 0; i < findApp.length; i++) {
                  if (findRole.name === findApp[i].jabatan) {
                    arr = i + 1
                    const findLevel = await role.findOne({
                      where: {
                        name: findApp[arr].jabatan
                      }
                    })
                    if (findLevel) {
                      noLevel = findLevel
                    }
                  }
                }
                if (noLevel.type === 'area') {
                  const findUser = await user.findAll({
                    where: {
                      level: noLevel.level
                    },
                    include: [
                      {
                        model: role,
                        as: 'role'
                      }
                    ]
                  })
                  if (findUser.length > 0) {
                    let toMail = null
                    for (let i = 0; i < findUser.length; i++) {
                      const findName = findUser[i].username === null ? '' : findUser[i].username
                      if (listName.find(e => e !== null && e.toString().toLowerCase() === findName.toLowerCase()) !== undefined) {
                        toMail = findUser[i]
                      }
                    }
                    if (toMail !== null) {
                      if (findDraft) {
                        return response(res, 'success get draft email', { from: name, to: toMail, cc: temp, result: findDraft })
                      } else {
                        return response(res, 'failed get email', { toMail }, 404, false)
                      }
                    } else {
                      return response(res, 'failed get email', { toMail }, 404, false)
                    }
                  } else {
                    return response(res, 'failed get email', { findUser }, 404, false)
                  }
                } else {
                  const findUser = await user.findOne({
                    where: {
                      level: noLevel.level
                    },
                    include: [
                      {
                        model: role,
                        as: 'role'
                      }
                    ]
                  })
                  if (findUser) {
                    return response(res, 'success get draft email', { from: name, to: findUser, cc: temp, result: findDraft })
                  } else {
                    return response(res, 'failed get email', { findUser }, 404, false)
                  }
                }
              } else {
                return response(res, 'failed get email', { temp }, 404, false)
              }
            } else {
              return response(res, 'failed get email', { findDraft }, 404, false)
            }
          } else {
            return response(res, 'failed get email', { findApp }, 404, false)
          }
        } else if (tipe === 'full approve') {
          const findDraft = await email.findOne({
            where: {
              [Op.and]: [
                { type: tipe },
                { menu: menu }
              ],
              [Op.or]: [
                { access: { [Op.like]: '%all' } },
                { access: { [Op.like]: `%${kode}` } }
              ]
            }
          })
          if (findDraft) {
            const temp = []
            const arrCc = findDraft.cc.split(',')
            for (let i = 0; i < arrCc.length; i++) {
              const findLevel = await role.findOne({
                where: {
                  name: arrCc[i]
                }
              })
              if (findLevel && findLevel.type === 'area') {
                const findDraftUser = await user.findAll({
                  where: {
                    level: findLevel.level
                  },
                  include: [
                    {
                      model: role,
                      as: 'role'
                    }
                  ]
                })
                if (findDraftUser) {
                  for (let i = 0; i < findDraftUser.length; i++) {
                    const findName = findDraftUser[i].username === null ? '' : findDraftUser[i].username
                    if (listName.find(e => e !== null && e.toString().toLowerCase() === findName.toLowerCase()) !== undefined) {
                      temp.push(findDraftUser[i])
                    }
                  }
                }
              } else if (findLevel && findLevel.type !== 'area') {
                const findDraftUser = await user.findOne({
                  where: {
                    level: findLevel.level
                  },
                  include: [
                    {
                      model: role,
                      as: 'role'
                    }
                  ]
                })
                if (findDraftUser) {
                  temp.push(findDraftUser)
                }
              }
            }
            if (temp.length > 0) {
              let noLevel = null
              const tempStat = findTrans.status_transaksi
              const tipeStat = tempStat === 2 ? 2 : 5
              for (let i = 0; i < 1; i++) {
                const findLevel = await role.findOne({
                  where: {
                    level: tipeStat
                  }
                })
                if (findLevel) {
                  noLevel = findLevel
                }
              }
              if (noLevel.type === 'area') {
                const findUser = await user.findAll({
                  where: {
                    level: noLevel.level
                  },
                  include: [
                    {
                      model: role,
                      as: 'role'
                    }
                  ]
                })
                if (findUser.length > 0) {
                  let toMail = null
                  for (let i = 0; i < findUser.length; i++) {
                    const findName = findUser[i].username === null ? '' : findUser[i].username
                    if (listName.find(e => e !== null && e.toString().toLowerCase() === findName.toLowerCase()) !== undefined) {
                      toMail = findUser[i]
                    }
                  }
                  if (toMail !== null) {
                    if (findDraft) {
                      return response(res, 'success get draft email', { from: name, to: toMail, cc: temp, result: findDraft })
                    } else {
                      return response(res, 'failed get email 2', { toMail }, 404, false)
                    }
                  } else {
                    return response(res, 'failed get email 1 king', { toMail, findUser, listName }, 404, false)
                  }
                } else {
                  return response(res, 'failed get email 0', { findUser }, 404, false)
                }
              } else {
                const findUser = await user.findOne({
                  where: {
                    level: noLevel.level
                  },
                  include: [
                    {
                      model: role,
                      as: 'role'
                    }
                  ]
                })
                if (findUser) {
                  return response(res, 'success get draft email', { from: name, to: findUser, cc: temp, result: findDraft })
                } else {
                  return response(res, 'failed get email5', { findUser }, 404, false)
                }
              }
            } else {
              return response(res, 'failed get email4', { temp }, 404, false)
            }
          } else {
            return response(res, 'failed get email3', { findDraft }, 404, false)
          }
        } else if (tipe === 'submit') {
          const findDraft = await email.findOne({
            where: {
              [Op.and]: [
                { type: tipe },
                { menu: menu }
              ],
              [Op.or]: [
                { access: { [Op.like]: '%all' } },
                { access: { [Op.like]: `%${kode}` } }
              ]
            }
          })
          if (findDraft) {
            const temp = []
            const arrCc = findDraft.cc.split(',')
            for (let i = 0; i < arrCc.length; i++) {
              const findLevel = await role.findOne({
                where: {
                  name: arrCc[i]
                }
              })
              if (findLevel && findLevel.type === 'area') {
                const findDraftUser = await user.findAll({
                  where: {
                    level: findLevel.level
                  },
                  include: [
                    {
                      model: role,
                      as: 'role'
                    }
                  ]
                })
                if (findDraftUser) {
                  for (let i = 0; i < findDraftUser.length; i++) {
                    const findName = findDraftUser[i].username === null ? '' : findDraftUser[i].username
                    if (listName.find(e => e !== null && e.toString().toLowerCase() === findName.toLowerCase()) !== undefined) {
                      temp.push(findDraftUser[i])
                    }
                  }
                }
              } else if (findLevel && findLevel.type !== 'area') {
                const findDraftUser = await user.findOne({
                  where: {
                    level: findLevel.level
                  },
                  include: [
                    {
                      model: role,
                      as: 'role'
                    }
                  ]
                })
                if (findDraftUser) {
                  temp.push(findDraftUser)
                }
              }
            }
            if (temp.length > 0) {
              let noLevel = null
              const tipeStat = statVerif
              for (let i = 0; i < 1; i++) {
                const findLevel = await role.findOne({
                  where: {
                    level: tipeStat
                  }
                })
                if (findLevel) {
                  noLevel = findLevel
                }
              }
              if (noLevel.type === 'area') {
                const findUser = await user.findAll({
                  where: {
                    level: noLevel.level
                  },
                  include: [
                    {
                      model: role,
                      as: 'role'
                    }
                  ]
                })
                if (findUser.length > 0) {
                  let toMail = null
                  for (let i = 0; i < findUser.length; i++) {
                    const findName = findUser[i].username === null ? '' : findUser[i].username
                    if (listName.find(e => e !== null && e.toString().toLowerCase() === findName.toLowerCase()) !== undefined) {
                      toMail = findUser[i]
                    }
                  }
                  if (toMail !== null) {
                    if (findDraft) {
                      return response(res, 'success get draft email', { from: name, to: toMail, cc: temp, result: findDraft })
                    } else {
                      return response(res, 'failed get email 2', { toMail }, 404, false)
                    }
                  } else {
                    return response(res, 'failed get email 1 king', { toMail, findUser, listName }, 404, false)
                  }
                } else {
                  return response(res, 'failed get email 0', { findUser }, 404, false)
                }
              } else {
                const findUser = await user.findOne({
                  where: {
                    level: noLevel.level
                  },
                  include: [
                    {
                      model: role,
                      as: 'role'
                    }
                  ]
                })
                if (findUser) {
                  return response(res, 'success get draft email', { from: name, to: findUser, cc: temp, result: findDraft })
                } else {
                  return response(res, 'failed get email5', { findUser }, 404, false)
                }
              }
            } else {
              return response(res, 'failed get email4', { temp }, 404, false)
            }
          } else {
            return response(res, 'failed get email3', { findDraft }, 404, false)
          }
        } else if (tipe === 'reject') {
          const findDraft = await email.findOne({
            where: {
              [Op.and]: [
                { type: tipe },
                { menu: menu }
              ],
              [Op.or]: [
                { access: { [Op.like]: '%all' } },
                { access: { [Op.like]: `%${kode}` } }
              ]
            }
          })
          if (findDraft) {
            const temp = []
            const arrCc = findDraft.cc.split(',')
            for (let i = 0; i < arrCc.length; i++) {
              const findLevel = await role.findOne({
                where: {
                  name: arrCc[i]
                }
              })
              if (findLevel && findLevel.type === 'area') {
                const findDraftUser = await user.findAll({
                  where: {
                    level: findLevel.level
                  },
                  include: [
                    {
                      model: role,
                      as: 'role'
                    }
                  ]
                })
                if (findDraftUser) {
                  for (let i = 0; i < findDraftUser.length; i++) {
                    const findName = findDraftUser[i].username === null ? '' : findDraftUser[i].username
                    if (listName.find(e => e !== null && e.toString().toLowerCase() === findName.toLowerCase()) !== undefined) {
                      temp.push(findDraftUser[i])
                    }
                  }
                }
              } else if (findLevel && findLevel.type !== 'area') {
                const findDraftUser = await user.findOne({
                  where: {
                    level: findLevel.level
                  },
                  include: [
                    {
                      model: role,
                      as: 'role'
                    }
                  ]
                })
                if (findDraftUser) {
                  temp.push(findDraftUser)
                }
              }
            }
            if (temp.length > 0) {
              let noLevel = null
              const tipeStat = 5
              for (let i = 0; i < 1; i++) {
                const findLevel = await role.findOne({
                  where: {
                    level: tipeStat
                  }
                })
                if (findLevel) {
                  noLevel = findLevel
                }
              }
              if (noLevel.type === 'area') {
                const findUser = await user.findAll({
                  where: {
                    level: noLevel.level
                  },
                  include: [
                    {
                      model: role,
                      as: 'role'
                    }
                  ]
                })
                if (findUser.length > 0) {
                  let toMail = null
                  for (let i = 0; i < findUser.length; i++) {
                    const findName = findUser[i].username === null ? '' : findUser[i].username
                    if (listName.find(e => e !== null && e.toString().toLowerCase() === findName.toLowerCase()) !== undefined) {
                      toMail = findUser[i]
                    }
                  }
                  if (toMail !== null) {
                    if (findDraft) {
                      return response(res, 'success get draft email', { from: name, to: toMail, cc: temp, result: findDraft })
                    } else {
                      return response(res, 'failed get email 2', { toMail }, 404, false)
                    }
                  } else {
                    return response(res, 'failed get email 1 king', { toMail, findUser, listName }, 404, false)
                  }
                } else {
                  return response(res, 'failed get email 0', { findUser }, 404, false)
                }
              } else {
                const findUser = await user.findOne({
                  where: {
                    level: noLevel.level
                  },
                  include: [
                    {
                      model: role,
                      as: 'role'
                    }
                  ]
                })
                if (findUser) {
                  return response(res, 'success get draft email', { from: name, to: findUser, cc: temp, result: findDraft })
                } else {
                  return response(res, 'failed get email5', { findUser }, 404, false)
                }
              }
            } else {
              return response(res, 'failed get email4', { temp }, 404, false)
            }
          } else {
            return response(res, 'failed get email3', { findDraft }, 404, false)
          }
        } else if (tipe === 'revisi') {
          const findDraft = await email.findOne({
            where: {
              [Op.and]: [
                { type: 'submit' },
                { menu: menu }
              ],
              [Op.or]: [
                { access: { [Op.like]: '%all' } },
                { access: { [Op.like]: `%${kode}` } }
              ]
            }
          })
          if (findDraft) {
            const temp = []
            const arrCc = findDraft.cc.split(',')
            for (let i = 0; i < arrCc.length; i++) {
              const findLevel = await role.findOne({
                where: {
                  name: arrCc[i]
                }
              })
              if (findLevel && findLevel.type === 'area') {
                const findDraftUser = await user.findAll({
                  where: {
                    level: findLevel.level
                  },
                  include: [
                    {
                      model: role,
                      as: 'role'
                    }
                  ]
                })
                if (findDraftUser) {
                  for (let i = 0; i < findDraftUser.length; i++) {
                    const findName = findDraftUser[i].username === null ? '' : findDraftUser[i].username
                    if (listName.find(e => e !== null && e.toString().toLowerCase() === findName.toLowerCase()) !== undefined) {
                      temp.push(findDraftUser[i])
                    }
                  }
                }
              } else if (findLevel && findLevel.type !== 'area') {
                const findDraftUser = await user.findOne({
                  where: {
                    level: findLevel.level
                  },
                  include: [
                    {
                      model: role,
                      as: 'role'
                    }
                  ]
                })
                if (findDraftUser) {
                  temp.push(findDraftUser)
                }
              }
            }
            if (temp.length > 0) {
              let noLevel = null
              const tipeStat = parseInt(findTrans.people_reject)
              for (let i = 0; i < 1; i++) {
                const findLevel = await role.findOne({
                  where: {
                    level: tipeStat
                  }
                })
                if (findLevel) {
                  noLevel = findLevel
                }
              }
              if (noLevel.type === 'area') {
                const findUser = await user.findAll({
                  where: {
                    level: noLevel.level
                  },
                  include: [
                    {
                      model: role,
                      as: 'role'
                    }
                  ]
                })
                if (findUser.length > 0) {
                  let toMail = null
                  for (let i = 0; i < findUser.length; i++) {
                    const findName = findUser[i].username === null ? '' : findUser[i].username
                    if (listName.find(e => e !== null && e.toString().toLowerCase() === findName.toLowerCase()) !== undefined) {
                      toMail = findUser[i]
                    }
                  }
                  if (toMail !== null) {
                    if (findDraft) {
                      return response(res, 'success get draft email', { from: name, to: toMail, cc: temp, result: findDraft })
                    } else {
                      return response(res, 'failed get email 2', { toMail }, 404, false)
                    }
                  } else {
                    return response(res, 'failed get email 1 king', { toMail, findUser, listName }, 404, false)
                  }
                } else {
                  return response(res, 'failed get email 0', { findUser }, 404, false)
                }
              } else {
                const findUser = await user.findOne({
                  where: {
                    level: noLevel.level
                  },
                  include: [
                    {
                      model: role,
                      as: 'role'
                    }
                  ]
                })
                if (findUser) {
                  return response(res, 'success get draft email', { from: name, to: findUser, cc: temp, result: findDraft })
                } else {
                  return response(res, 'failed get email5', { findUser }, 404, false)
                }
              }
            } else {
              return response(res, 'failed get email4', { temp }, 404, false)
            }
          } else {
            return response(res, 'failed get email3', { findDraft }, 404, false)
          }
        }
      } else {
        return response(res, 'failed get email 1', { findRole, findDepo, findTrans }, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  draftEmailAjuan: async (req, res) => {
    // try {
    const name = req.user.name
    const level = req.user.level
    const { no, kode, tipe, menu, jenis } = req.body
    const transaksi = jenis === 'ikk' ? ikk : jenis === 'klaim' ? klaim : ops
    const findRole = await role.findOne({
      where: {
        level: level
      }
    })
    const findDepo = await depo.findOne({
      where: {
        kode_plant: kode
      }
    })
    const findTrans = await transaksi.findAll({
      where: {
        no_pembayaran: no
      }
    })
    if (findRole && findDepo && findTrans) {
      const arrName = Object.values(findDepo.dataValues)
      const listName = arrName.filter(e => e !== null && e !== undefined)
      console.log(arrName)
      console.log(listName)
      if (tipe === 'approve') {
        const findApp = await ttd.findAll({
          where: {
            no_transaksi: no
          }
        })
        if (findApp.length > 0) {
          const findDraft = await email.findOne({
            where: {
              [Op.and]: [
                { type: tipe },
                { menu: menu }
              ],
              [Op.or]: [
                { access: { [Op.like]: '%all' } },
                { access: { [Op.like]: `%${kode}` } }
              ]
            }
          })
          if (findDraft) {
            const temp = []
            const arrCc = findDraft.cc.split(',')
            for (let i = 0; i < arrCc.length; i++) {
              const findLevel = await role.findOne({
                where: {
                  name: arrCc[i]
                }
              })
              if (findLevel && findLevel.type === 'area') {
                const findDraftUser = await user.findAll({
                  where: {
                    level: findLevel.level
                  },
                  include: [
                    {
                      model: role,
                      as: 'role'
                    }
                  ]
                })
                if (findDraftUser) {
                  for (let i = 0; i < findDraftUser.length; i++) {
                    const findName = findDraftUser[i].username === null ? '' : findDraftUser[i].username
                    if (listName.find(e => e !== null && e.toString().toLowerCase() === findName.toLowerCase()) !== undefined) {
                      temp.push(findDraftUser[i])
                    }
                  }
                }
              } else if (findLevel && findLevel.type !== 'area') {
                const findDraftUser = await user.findOne({
                  where: {
                    level: findLevel.level
                  },
                  include: [
                    {
                      model: role,
                      as: 'role'
                    }
                  ]
                })
                if (findDraftUser) {
                  temp.push(findDraftUser)
                }
              }
            }
            if (temp.length > 0) {
              let noLevel = null
              let arr = null
              for (let i = 0; i < findApp.length; i++) {
                if (findRole.name === findApp[i].jabatan) {
                  arr = i + 1
                  const findLevel = await role.findOne({
                    where: {
                      name: findApp[arr].jabatan
                    }
                  })
                  if (findLevel) {
                    noLevel = findLevel
                  }
                }
              }
              if (noLevel.type === 'area') {
                const findUser = await user.findAll({
                  where: {
                    level: noLevel.level
                  },
                  include: [
                    {
                      model: role,
                      as: 'role'
                    }
                  ]
                })
                if (findUser.length > 0) {
                  let toMail = null
                  for (let i = 0; i < findUser.length; i++) {
                    const findName = findUser[i].username === null ? '' : findUser[i].username
                    if (listName.find(e => e !== null && e.toString().toLowerCase() === findName.toLowerCase()) !== undefined) {
                      toMail = findUser[i]
                    }
                  }
                  if (toMail !== null) {
                    if (findDraft) {
                      return response(res, 'success get draft email', { from: name, to: toMail, cc: temp, result: findDraft })
                    } else {
                      return response(res, 'failed get email', { toMail }, 404, false)
                    }
                  } else {
                    return response(res, 'failed get email', { toMail }, 404, false)
                  }
                } else {
                  return response(res, 'failed get email', { findUser }, 404, false)
                }
              } else {
                const findUser = await user.findOne({
                  where: {
                    level: noLevel.level
                  },
                  include: [
                    {
                      model: role,
                      as: 'role'
                    }
                  ]
                })
                if (findUser) {
                  return response(res, 'success get draft email', { from: name, to: findUser, cc: temp, result: findDraft })
                } else {
                  return response(res, 'failed get email', { findUser }, 404, false)
                }
              }
            } else {
              return response(res, 'failed get email', { temp }, 404, false)
            }
          } else {
            return response(res, 'failed get email', { findDraft }, 404, false)
          }
        } else {
          return response(res, 'failed get email', { findApp }, 404, false)
        }
      } else if (tipe === 'submit') {
        const findDraft = await email.findOne({
          where: {
            [Op.and]: [
              { type: tipe },
              { menu: menu }
            ],
            [Op.or]: [
              { access: { [Op.like]: '%all' } },
              { access: { [Op.like]: `%${kode}` } }
            ]
          }
        })
        if (findDraft) {
          const temp = []
          const arrCc = findDraft.cc.split(',')
          for (let i = 0; i < arrCc.length; i++) {
            const findLevel = await role.findOne({
              where: {
                name: arrCc[i]
              }
            })
            if (findLevel && findLevel.type === 'area') {
              const findDraftUser = await user.findAll({
                where: {
                  level: findLevel.level
                },
                include: [
                  {
                    model: role,
                    as: 'role'
                  }
                ]
              })
              if (findDraftUser) {
                for (let i = 0; i < findDraftUser.length; i++) {
                  const findName = findDraftUser[i].username === null ? '' : findDraftUser[i].username
                  if (listName.find(e => e !== null && e.toString().toLowerCase() === findName.toLowerCase()) !== undefined) {
                    temp.push(findDraftUser[i])
                  }
                }
              }
            } else if (findLevel && findLevel.type !== 'area') {
              const findDraftUser = await user.findOne({
                where: {
                  level: findLevel.level
                },
                include: [
                  {
                    model: role,
                    as: 'role'
                  }
                ]
              })
              if (findDraftUser) {
                temp.push(findDraftUser)
              }
            }
          }
          if (temp.length > 0) {
            let noLevel = null
            const tempStat = findTrans[0].status_transaksi
            const tipeStat = tempStat === 7 ? 5 : 2
            for (let i = 0; i < 1; i++) {
              const findLevel = await role.findOne({
                where: {
                  level: tipeStat
                }
              })
              if (findLevel) {
                noLevel = findLevel
              }
            }
            if (tempStat === 7) {
              const tempDepo = []
              for (let i = 0; i < findTrans.length; i++) {
                tempDepo.push(findTrans[i].kode_plant)
              }
              if (tempDepo.length) {
                const uniqDepo = [...new Set(tempDepo)]
                const dataTo = []
                for (let i = 0; i < uniqDepo.length; i++) {
                  const findUser = await user.findOne({
                    where: {
                      kode_plant: uniqDepo[i]
                    },
                    include: [
                      {
                        model: role,
                        as: 'role'
                      }
                    ]
                  })
                  if (findUser) {
                    dataTo.push(findUser)
                  }
                }
                if (dataTo.length > 0) {
                  return response(res, 'success get draft email', { from: name, to: dataTo, cc: temp, result: findDraft })
                } else {
                  return response(res, 'failed get email 0', { dataTo }, 404, false)
                }
              } else {
                return response(res, 'failed get email 0', { tempDepo }, 404, false)
              }
            } else {
              if (noLevel.type === 'area') {
                const findUser = await user.findAll({
                  where: {
                    level: noLevel.level
                  },
                  include: [
                    {
                      model: role,
                      as: 'role'
                    }
                  ]
                })
                if (findUser.length > 0) {
                  let toMail = null
                  for (let i = 0; i < findUser.length; i++) {
                    const findName = findUser[i].username === null ? '' : findUser[i].username
                    if (listName.find(e => e !== null && e.toString().toLowerCase() === findName.toLowerCase()) !== undefined) {
                      toMail = findUser[i]
                    }
                  }
                  if (toMail !== null) {
                    if (findDraft) {
                      return response(res, 'success get draft email', { from: name, to: toMail, cc: temp, result: findDraft })
                    } else {
                      return response(res, 'failed get email 2', { toMail }, 404, false)
                    }
                  } else {
                    return response(res, 'failed get email 1 king', { toMail, findUser, listName }, 404, false)
                  }
                } else {
                  return response(res, 'failed get email 0', { findUser }, 404, false)
                }
              } else {
                const findUser = await user.findOne({
                  where: {
                    level: noLevel.level
                  },
                  include: [
                    {
                      model: role,
                      as: 'role'
                    }
                  ]
                })
                if (findUser) {
                  return response(res, 'success get draft email', { from: name, to: findUser, cc: temp, result: findDraft })
                } else {
                  return response(res, 'failed get email5', { findUser }, 404, false)
                }
              }
            }
          } else {
            return response(res, 'failed get email4', { temp }, 404, false)
          }
        } else {
          return response(res, 'failed get email3', { findDraft }, 404, false)
        }
      } else if (tipe === 'full approve') {
        const findDraft = await email.findOne({
          where: {
            [Op.and]: [
              { type: tipe },
              { menu: menu }
            ],
            [Op.or]: [
              { access: { [Op.like]: '%all' } },
              { access: { [Op.like]: `%${kode}` } }
            ]
          }
        })
        if (findDraft) {
          const temp = []
          const arrCc = findDraft.cc.split(',')
          for (let i = 0; i < arrCc.length; i++) {
            const findLevel = await role.findOne({
              where: {
                name: arrCc[i]
              }
            })
            if (findLevel && findLevel.type === 'area') {
              const findDraftUser = await user.findAll({
                where: {
                  level: findLevel.level
                },
                include: [
                  {
                    model: role,
                    as: 'role'
                  }
                ]
              })
              if (findDraftUser) {
                for (let i = 0; i < findDraftUser.length; i++) {
                  const findName = findDraftUser[i].username === null ? '' : findDraftUser[i].username
                  if (listName.find(e => e !== null && e.toString().toLowerCase() === findName.toLowerCase()) !== undefined) {
                    temp.push(findDraftUser[i])
                  }
                }
              }
            } else if (findLevel && findLevel.type !== 'area') {
              const findDraftUser = await user.findOne({
                where: {
                  level: findLevel.level
                },
                include: [
                  {
                    model: role,
                    as: 'role'
                  }
                ]
              })
              if (findDraftUser) {
                temp.push(findDraftUser)
              }
            }
          }
          if (temp.length > 0) {
            let noLevel = null
            const tipeStat = 2
            for (let i = 0; i < 1; i++) {
              const findLevel = await role.findOne({
                where: {
                  level: tipeStat
                }
              })
              if (findLevel) {
                noLevel = findLevel
              }
            }
            if (noLevel.type === 'area') {
              const findUser = await user.findAll({
                where: {
                  level: noLevel.level
                },
                include: [
                  {
                    model: role,
                    as: 'role'
                  }
                ]
              })
              if (findUser.length > 0) {
                let toMail = null
                for (let i = 0; i < findUser.length; i++) {
                  const findName = findUser[i].username === null ? '' : findUser[i].username
                  if (listName.find(e => e !== null && e.toString().toLowerCase() === findName.toLowerCase()) !== undefined) {
                    toMail = findUser[i]
                  }
                }
                if (toMail !== null) {
                  if (findDraft) {
                    return response(res, 'success get draft email', { from: name, to: toMail, cc: temp, result: findDraft })
                  } else {
                    return response(res, 'failed get email 2', { toMail }, 404, false)
                  }
                } else {
                  return response(res, 'failed get email 1 king', { toMail, findUser, listName }, 404, false)
                }
              } else {
                return response(res, 'failed get email 0', { findUser }, 404, false)
              }
            } else {
              const findUser = await user.findOne({
                where: {
                  level: noLevel.level
                },
                include: [
                  {
                    model: role,
                    as: 'role'
                  }
                ]
              })
              if (findUser) {
                return response(res, 'success get draft email', { from: name, to: findUser, cc: temp, result: findDraft })
              } else {
                return response(res, 'failed get email5', { findUser }, 404, false)
              }
            }
          } else {
            return response(res, 'failed get email4', { temp }, 404, false)
          }
        } else {
          return response(res, 'failed get email3', { findDraft }, 404, false)
        }
      } else if (tipe === 'reject') {
        const findDraft = await email.findOne({
          where: {
            [Op.and]: [
              { type: tipe },
              { menu: menu }
            ],
            [Op.or]: [
              { access: { [Op.like]: '%all' } },
              { access: { [Op.like]: `%${kode}` } }
            ]
          }
        })
        if (findDraft) {
          const temp = []
          const arrCc = findDraft.cc.split(',')
          for (let i = 0; i < arrCc.length; i++) {
            const findLevel = await role.findOne({
              where: {
                name: arrCc[i]
              }
            })
            if (findLevel && findLevel.type === 'area') {
              const findDraftUser = await user.findAll({
                where: {
                  level: findLevel.level
                },
                include: [
                  {
                    model: role,
                    as: 'role'
                  }
                ]
              })
              if (findDraftUser) {
                for (let i = 0; i < findDraftUser.length; i++) {
                  const findName = findDraftUser[i].username === null ? '' : findDraftUser[i].username
                  if (listName.find(e => e !== null && e.toString().toLowerCase() === findName.toLowerCase()) !== undefined) {
                    temp.push(findDraftUser[i])
                  }
                }
              }
            } else if (findLevel && findLevel.type !== 'area') {
              const findDraftUser = await user.findOne({
                where: {
                  level: findLevel.level
                },
                include: [
                  {
                    model: role,
                    as: 'role'
                  }
                ]
              })
              if (findDraftUser) {
                temp.push(findDraftUser)
              }
            }
          }
          if (temp.length > 0) {
            let noLevel = null
            const tipeStat = 5
            for (let i = 0; i < 1; i++) {
              const findLevel = await role.findOne({
                where: {
                  level: tipeStat
                }
              })
              if (findLevel) {
                noLevel = findLevel
              }
            }
            if (noLevel.type === 'area') {
              const tempDepo = []
              for (let i = 0; i < findTrans.length; i++) {
                tempDepo.push(findTrans[i].kode_plant)
              }
              if (tempDepo.length) {
                const uniqDepo = [...new Set(tempDepo)]
                const dataTo = []
                for (let i = 0; i < uniqDepo.length; i++) {
                  const findUser = await user.findOne({
                    where: {
                      kode_plant: uniqDepo[i]
                    },
                    include: [
                      {
                        model: role,
                        as: 'role'
                      }
                    ]
                  })
                  if (findUser) {
                    dataTo.push(findUser)
                  }
                }
                if (dataTo.length > 0) {
                  return response(res, 'success get draft email', { from: name, to: dataTo, cc: temp, result: findDraft })
                } else {
                  return response(res, 'failed get email 0', { dataTo }, 404, false)
                }
              } else {
                return response(res, 'failed get email 0', { tempDepo }, 404, false)
              }
            } else {
              const findUser = await user.findOne({
                where: {
                  level: noLevel.level
                },
                include: [
                  {
                    model: role,
                    as: 'role'
                  }
                ]
              })
              if (findUser) {
                return response(res, 'success get draft email', { from: name, to: findUser, cc: temp, result: findDraft })
              } else {
                return response(res, 'failed get email5', { findUser }, 404, false)
              }
            }
          } else {
            return response(res, 'failed get email4', { temp }, 404, false)
          }
        } else {
          return response(res, 'failed get email3', { findDraft }, 404, false)
        }
      }
    } else {
      return response(res, 'failed get email 1', { findRole, findDepo }, 404, false)
    }
    // } catch (error) {
    //   return response(res, error.message, {}, 500, false)
    // }
  },
  sendEmail: async (req, res) => {
    try {
      const name = req.user.name
      const level = req.user.level
      const { nameTo, to, cc, message, no, tipe, subject, jenis } = req.body
      const findRole = await role.findOne({
        where: {
          level: level
        }
      })
      if (findRole) {
        const transaksi = tipe === 'ikk' ? ikk : tipe === 'klaim' ? klaim : ops
        // const title = tipe === 'ikk' ? 'IKK' : tipe === 'klaim' ? 'Klaim' : 'Operasional'
        const findData = await transaksi.findAll({
          where: {
            [Op.and]: [
              jenis === 'ajuan' ? { no_pembayaran: no } : { no_transaksi: no }
            ]
          }
        })
        if (findData) {
          let tableTd = ''
          const dataTo = nameTo === undefined ? '' : nameTo
          for (let i = 0; i < findData.length; i++) {
            const data = findData[i]
            const dateData = tipe === 'ikk' ? data.start_ikk : tipe === 'klaim' ? data.start_klaim : data.start_ops
            const element = `
                  <tr>
                    <th>${i + 1}</th>
                    <th>${findData[i].no_transaksi}</th>
                    <th>${findData[i].cost_center}</th>
                    <th>${findData[i].area}</th>
                    <th>${findData[i].no_coa}</th>
                    <th>${findData[i].sub_coa}</th>
                    <th>${findData[i].keterangan || findData[i].uraian}</th>
                    <th>${moment(dateData || moment()).format('DD MMMM YYYY')}</th>
                  </tr>`
            tableTd = tableTd + element
          }
          const mailOptions = {
            from: 'noreply_ofr@pinusmerahabadi.co.id',
            replyTo: 'noreply_ofr@pinusmerahabadi.co.id',
            to: `${to}`,
            cc: cc.split(','),
            subject: `${subject}`,
            html: `
                <head>
                <style type="text/css">
                body {
                    display: flexbox;
                    flex-direction: column;
                }
                .tittle {
                    font-size: 15px;
                }
                .mar {
                    margin-bottom: 20px;
                }
                .mar1 {
                    margin-bottom: 10px;
                }
                .foot {
                    margin-top: 20px;
                    margin-bottom: 10px;
                }
                .foot1 {
                    margin-bottom: 50px;
                }
                .position {
                    display: flexbox;
                    flex-direction: row;
                    justify-content: left;
                    margin-top: 10px;
                }
                table {
                    font-family: "Lucida Sans Unicode", "Lucida Grande", "Segoe Ui";
                    font-size: 12px;
                }
                .demo-table {
                    border-collapse: collapse;
                    font-size: 13px;
                }
                .demo-table th, 
                .demo-table td {
                    border-bottom: 1px solid #e1edff;
                    border-left: 1px solid #e1edff;
                    padding: 7px 17px;
                }
                .demo-table th, 
                .demo-table td:last-child {
                    border-right: 1px solid #e1edff;
                }
                .demo-table td:first-child {
                    border-top: 1px solid #e1edff;
                }
                .demo-table td:last-child{
                    border-bottom: 0;
                }
                caption {
                    caption-side: top;
                    margin-bottom: 10px;
                }
                
                /* Table Header */
                .demo-table thead th {
                    background-color: #508abb;
                    color: #FFFFFF;
                    border-color: #6ea1cc !important;
                    text-transform: uppercase;
                }
                
                /* Table Body */
                .demo-table tbody td {
                    color: #353535;
                }
                
                .demo-table tbody tr:nth-child(odd) td {
                    background-color: #f4fbff;
                }
                .demo-table tbody tr:hover th,
                .demo-table tbody tr:hover td {
                    background-color: #ffffa2;
                    border-color: #ffff0f;
                    transition: all .2s;
                }
            </style>
                </head>
                <body>
                    <div class="tittle mar">
                        Dear Bapak/Ibu ${dataTo},
                    </div>
                    <div class="tittle mar1">
                        <div>${message}</div>
                    </div>
                    <div class="position">
                        <table class="demo-table">
                            <thead>
                                <tr>
                                    <th>No</th>
                                    <th>NO.AJUAN</th>
                                    <th>COST CENTRE</th>
                                    <th>AREA</th>
                                    <th>NO.COA</th>
                                    <th>JENIS TRANSAKSI</th>
                                    <th>KETERANGAN TAMBAHAN</th>
                                    <th>TANGGAL AJUAN</th>
                                </tr>
                            </thead>
                            <tbody>
                            ${tableTd}
                            </tbody>
                        </table>
                    </div>
                    <a href="http://ofr.pinusmerahabadi.co.id/">Klik link berikut untuk akses web ofr</a>
                    <div class="tittle foot">
                        Terima kasih,
                    </div>
                    <div class="tittle foot1">
                        Regards,
                    </div>
                    <div class="tittle">
                        ${name}
                    </div>
                </body>
                `
          }
          const sendEmail = await wrapMail.wrapedSendMail(mailOptions)
          if (sendEmail) {
            return response(res, 'success approve', { sendEmail })
          } else {
            return response(res, 'berhasil approve, tidak berhasil kirim notif email 1', { sendEmail }, 404, false)
          }
        } else {
          return response(res, 'failed send email', { findData }, 404, false)
        }
      } else {
        return response(res, 'failed get email', { findRole }, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getDetailEmail: async (req, res) => {
    try {
      const id = req.params.id
      const findEmail = await email.findByPk(id)
      if (findEmail) {
        return response(res, 'succes get detail email', { result: findEmail })
      } else {
        return response(res, 'failed get email', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  deleteEmail: async (req, res) => {
    try {
      const id = req.params.id
      const findEmail = await email.findByPk(id)
      if (findEmail) {
        const delEmail = await findEmail.destroy()
        if (delEmail) {
          return response(res, 'succes delete email', { result: findEmail })
        } else {
          return response(res, 'failed destroy email', {}, 404, false)
        }
      } else {
        return response(res, 'failed get email', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  deleteAll: async (req, res) => {
    try {
      const findEmail = await email.findAll()
      if (findEmail) {
        const temp = []
        for (let i = 0; i < findEmail.length; i++) {
          const findDel = await email.findByPk(findEmail[i].id)
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
