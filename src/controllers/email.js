const { resmail, picklaim, spvklaim, email, ttd, role, finance, user, ops, klaim, ikk, vervendor, role_user } = require('../models') // eslint-disable-line
const joi = require('joi')
const { Op } = require('sequelize')
const response = require('../helpers/response')
const { pagination } = require('../helpers/pagination')
const wrapMail = require('../helpers/wrapMail')
const moment = require('moment')
const cekCoa = 'mr p'

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
      } else if (limit === 'all') {
        const findLimit = await email.findAll()
        limit = findLimit.length
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
      const accKlaim = [3, 13, 23]
      const { no, kode, tipe, menu, jenis, typeReject, typeAjuan, indexApp } = req.body
      const transaksi = jenis === 'ikk' ? ikk : jenis === 'klaim' ? klaim : jenis === 'vendor' ? vervendor : ops
      const statVerif = (jenis === 'ikk' || jenis === 'ops') && level === 2
        ? 4
        : jenis === 'klaim' && level === 2
          ? 3
          : jenis === 'vendor' && level === 5
            ? 8
            : jenis === 'vendor' && (level === 4 || (level === 8 && typeAjuan === 'rekening'))
              ? 5
              : jenis === 'vendor' && (level === 8 && typeAjuan === 'vendor')
                ? 4
                : jenis === 'kasbon' && level === 2 ? 24 : 2

      const findRole = await role.findOne({
        where: {
          level: level
        }
      })
      const findDepo = await finance.findOne({
        where: {
          kode_plant: kode
        }
      })
      const findPic = await picklaim.findOne({
        where: {
          kode_plant: kode
        }
      })
      const findTrans = await transaksi.findOne({
        where: {
          no_transaksi: no,
          [Op.and]: [
            tipe === 'revisi' ? { [Op.not]: { people_reject: null } } : { [Op.not]: { id: null } }
          ]
        }
      })
      const findAllTrans = await transaksi.findAll({
        where: {
          no_transaksi: no
        }
      })
      if (findRole && findDepo && findTrans && findAllTrans.length > 0 && (jenis === 'klaim' && !findPic ? findPic : findDepo)) {
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
                  const findDataUser = await user.findAll({
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
                  const findRoleUser = await role_user.findAll({
                    where: {
                      id_role: findLevel.level
                    },
                    include: [
                      {
                        model: user,
                        as: 'detail_user'
                      },
                      {
                        model: role,
                        as: 'detail_role'
                      }
                    ]
                  })
                  const dataRole = []
                  for (let i = 0; i < findRoleUser.length; i++) {
                    dataRole.push({ ...findRoleUser[i].detail_user.dataValues, role: findRoleUser[i].detail_role })
                  }
                  const findDraftUser = [
                    ...findDataUser,
                    ...dataRole
                  ]
                  if (findDraftUser) {
                    for (let i = 0; i < findDraftUser.length; i++) {
                      const findName = findDraftUser[i].fullname === null ? '' : findDraftUser[i].fullname
                      const findEmail = findDraftUser[i].email === null ? '' : findDraftUser[i].email
                      if (listName.find(e => e !== null && (e.toString().toLowerCase() === findName.toLowerCase() || e.toString().toLowerCase() === findEmail.toLowerCase())) !== undefined) {
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
                  if (level === 30) {
                    const convIndex = (findApp.length - 1) - parseInt(indexApp === 'first' ? (findApp.length - 1) : indexApp)
                    arr = convIndex + 1
                    const findLevel = await role.findOne({
                      where: {
                        name: findApp[arr].jabatan
                      }
                    })
                    if (findLevel) {
                      noLevel = findLevel
                    }
                  } else {
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
                }
                if (noLevel.type === 'area') {
                  const findDataUser = await user.findAll({
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
                  const findRoleUser = await role_user.findAll({
                    where: {
                      id_role: noLevel.level
                    },
                    include: [
                      {
                        model: user,
                        as: 'detail_user'
                      },
                      {
                        model: role,
                        as: 'detail_role'
                      }
                    ]
                  })
                  const dataRole = []
                  for (let i = 0; i < findRoleUser.length; i++) {
                    dataRole.push({ ...findRoleUser[i].detail_user.dataValues, role: findRoleUser[i].detail_role })
                  }
                  const findUser = [
                    ...findDataUser,
                    ...dataRole
                  ]
                  const cekName = []
                  if (findUser.length > 0) {
                    let toMail = null
                    for (let i = 0; i < findUser.length; i++) {
                      const findName = findUser[i].fullname === null ? '' : findUser[i].fullname
                      const findEmail = findUser[i].email === null ? '' : findUser[i].email
                      cekName.push(findName)
                      if (listName.find(e => e !== null && (e.toString().toLowerCase() === findName.toLowerCase() || e.toString().toLowerCase() === findEmail.toLowerCase())) !== undefined) {
                        toMail = findUser[i]
                      }
                    }
                    if (toMail !== null) {
                      if (findDraft) {
                        return response(res, 'success get draft email', { from: name, to: toMail, cc: temp, result: findDraft })
                      } else {
                        return response(res, 'failed get emai7l', { toMail, findUser, listName, cekName }, 404, false)
                      }
                    } else {
                      return response(res, 'failed get emai6llll', { toMail, findUser, listName, cekName }, 404, false)
                    }
                  } else {
                    return response(res, 'failed get emai5l', { findUser }, 404, false)
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
                    return response(res, 'failed get emai4l', { findUser }, 404, false)
                  }
                }
              } else {
                return response(res, 'failed get emai1l', { temp }, 404, false)
              }
            } else {
              return response(res, 'failed get emai2l', { findDraft }, 404, false)
            }
          } else {
            return response(res, 'failed get emai3l', { findApp }, 404, false)
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
                    const findName = findDraftUser[i].fullname === null ? '' : findDraftUser[i].fullname
                    const findEmail = findDraftUser[i].email === null ? '' : findDraftUser[i].email
                    if (listName.find(e => e !== null && (e.toString().toLowerCase() === findName.toLowerCase() || e.toString().toLowerCase() === findEmail.toLowerCase())) !== undefined) {
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
              // const tempStat = findTrans.status_transaksi
              // const cekData = findAllTrans.find(({stat_skb}) => stat_skb === 'ya') === undefined ? 'ya' : 'no' // eslint-disable-line
              // const tipeStat = tempStat === 2 ? 2 : 5
              // const tipeStat = cekData === 'ya' ? 2 : 4
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
                const findDataUser = await user.findAll({
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
                const findRoleUser = await role_user.findAll({
                  where: {
                    id_role: noLevel.level
                  },
                  include: [
                    {
                      model: user,
                      as: 'detail_user'
                    },
                    {
                      model: role,
                      as: 'detail_role'
                    }
                  ]
                })
                const dataRole = []
                for (let i = 0; i < findRoleUser.length; i++) {
                  dataRole.push({ ...findRoleUser[i].detail_user.dataValues, role: findRoleUser[i].detail_role })
                }
                const findUser = [
                  ...findDataUser,
                  ...dataRole
                ]
                if (findUser.length > 0) {
                  let toMail = null
                  for (let i = 0; i < findUser.length; i++) {
                    const findName = findUser[i].fullname === null ? '' : findUser[i].fullname
                    const findEmail = findUser[i].email === null ? '' : findUser[i].email
                    if (listName.find(e => e !== null && (e.toString().toLowerCase() === findName.toLowerCase() || e.toString().toLowerCase() === findEmail.toLowerCase())) !== undefined) {
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
                    const findName = findDraftUser[i].fullname === null ? '' : findDraftUser[i].fullname
                    const findEmail = findDraftUser[i].email === null ? '' : findDraftUser[i].email
                    if (listName.find(e => e !== null && (e.toString().toLowerCase() === findName.toLowerCase() || e.toString().toLowerCase() === findEmail.toLowerCase())) !== undefined) {
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
              let tipeStat = null
              if (statVerif === 4) {
                if (jenis === 'ops') {
                  const cekKasbon = findAllTrans.find(({type_kasbon}) => type_kasbon === 'kasbon') // eslint-disable-line
                  if (cekKasbon !== undefined) {
                    const cekPph = findAllTrans.find(({jenis_pph}) => jenis_pph !== 'Non PPh') === undefined ? 'ya' : 'no' // eslint-disable-line
                    const cekData = findAllTrans.find(({stat_skb}) => stat_skb === 'ya') === undefined ? 'ya' : 'no' // eslint-disable-line
                    // tipeStat = (cekData === 'ya' && cekPph === 'ya') ? 2 : 4
                    tipeStat = (cekPph === 'ya') ? 2 : 4
                  } else {
                    const cekData = findAllTrans.find(({stat_skb}) => stat_skb === 'ya') === undefined ? 'ya' : 'no' // eslint-disable-line
                    // tipeStat = cekData === 'ya' ? 2 : 4
                    tipeStat = 2
                  }
                } else if (jenis === 'ikk') {
                  const cekData = findAllTrans.find(({stat_skb}) => stat_skb === 'ya') === undefined ? 'ya' : 'no' // eslint-disable-line
                  // tipeStat = cekData === 'ya' ? 2 : 4
                  tipeStat = 2
                } else {
                  tipeStat = statVerif
                }
              } else {
                tipeStat = statVerif
              }
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
                const findDataUser = await user.findAll({
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
                const findRoleUser = await role_user.findAll({
                  where: {
                    id_role: noLevel.level
                  },
                  include: [
                    {
                      model: user,
                      as: 'detail_user'
                    },
                    {
                      model: role,
                      as: 'detail_role'
                    }
                  ]
                })
                const dataRole = []
                for (let i = 0; i < findRoleUser.length; i++) {
                  dataRole.push({ ...findRoleUser[i].detail_user.dataValues, role: findRoleUser[i].detail_role })
                }
                const findUser = [
                  ...findDataUser,
                  ...dataRole
                ]
                if (findUser.length > 0) {
                  let toMail = null
                  for (let i = 0; i < findUser.length; i++) {
                    if (accKlaim.find(item => item === noLevel.level)) {
                      const namePic = findUser[i].fullname
                      const dataPic = findPic.dataValues
                      const agr1 = dataPic[Object.keys(dataPic).find(x => findTrans.nama_coa.toLowerCase().indexOf(x.toLowerCase() === 'mcp' ? cekCoa : x.toLowerCase()) !== -1)].toLowerCase()
                      const agr2 = namePic.toLowerCase()
                      if (agr1 === agr2) {
                        toMail = findUser[i]
                      }
                    } else {
                      const findName = findUser[i].fullname === null ? '' : findUser[i].fullname
                      const findEmail = findUser[i].email === null ? '' : findUser[i].email
                      if (listName.find(e => e !== null && (e.toString().toLowerCase() === findName.toLowerCase() || e.toString().toLowerCase() === findEmail.toLowerCase())) !== undefined) {
                        toMail = findUser[i]
                      }
                    }
                  }
                  if (toMail !== null) {
                    if (findDraft) {
                      return response(res, 'success get draft email', { from: name, to: toMail, cc: temp, result: findDraft })
                    } else {
                      return response(res, 'failed get email 2', { toMail }, 404, false)
                    }
                  } else {
                    return response(res, 'failed get email 11 king', { toMail, findUser, listName }, 404, false)
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
                    const findName = findDraftUser[i].fullname === null ? '' : findDraftUser[i].fullname
                    const findEmail = findDraftUser[i].email === null ? '' : findDraftUser[i].email
                    if (listName.find(e => e !== null && (e.toString().toLowerCase() === findName.toLowerCase() || e.toString().toLowerCase() === findEmail.toLowerCase())) !== undefined) {
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
                const findDataUser = await user.findAll({
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
                const findRoleUser = await role_user.findAll({
                  where: {
                    id_role: noLevel.level
                  },
                  include: [
                    {
                      model: user,
                      as: 'detail_user'
                    },
                    {
                      model: role,
                      as: 'detail_role'
                    }
                  ]
                })
                const dataRole = []
                for (let i = 0; i < findRoleUser.length; i++) {
                  dataRole.push({ ...findRoleUser[i].detail_user.dataValues, role: findRoleUser[i].detail_role })
                }
                const findUser = [
                  ...findDataUser,
                  ...dataRole
                ]
                if (findUser.length > 0) {
                  let toMail = null
                  for (let i = 0; i < findUser.length; i++) {
                    const findName = findUser[i].fullname === null ? '' : findUser[i].fullname
                    const findEmail = findUser[i].email === null ? '' : findUser[i].email
                    const findKode = findUser[i].kode_plant === null ? '' : findUser[i].kode_plant
                    if (noLevel.level === 5) {
                      if (findDepo.kode_plant === findKode && (findDepo.aos.toString().toLowerCase() === findName.toLowerCase() || findDepo.aos.toString().toLowerCase() === findEmail.toLowerCase())) {
                        toMail = findUser[i]
                      }
                    } else {
                      if (listName.find(e => e !== null && (e.toString().toLowerCase() === findName.toLowerCase() || e.toString().toLowerCase() === findEmail.toLowerCase())) !== undefined) {
                        toMail = findUser[i]
                      }
                    }
                  }
                  if (toMail !== null) {
                    if (findDraft) {
                      const dataRes = {
                        ...findDraft.dataValues,
                        message: 'Transaksi berikut telah dibatalkan'
                      }
                      return response(res, 'success get draft email', { from: name, to: toMail, cc: temp, result: typeReject === 'pembatalan' ? dataRes : findDraft })
                    } else {
                      return response(res, 'failed get email 2', { toMail }, 404, false)
                    }
                  } else {
                    return response(res, 'failed get email 12 king', { toMail, findUser, listName }, 404, false)
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
                    const findName = findDraftUser[i].fullname === null ? '' : findDraftUser[i].fullname
                    const findEmail = findDraftUser[i].email === null ? '' : findDraftUser[i].email
                    if (listName.find(e => e !== null && (e.toString().toLowerCase() === findName.toLowerCase() || e.toString().toLowerCase() === findEmail.toLowerCase())) !== undefined) {
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
                const findDataUser = await user.findAll({
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
                const findRoleUser = await role_user.findAll({
                  where: {
                    id_role: noLevel.level
                  },
                  include: [
                    {
                      model: user,
                      as: 'detail_user'
                    },
                    {
                      model: role,
                      as: 'detail_role'
                    }
                  ]
                })
                const dataRole = []
                for (let i = 0; i < findRoleUser.length; i++) {
                  dataRole.push({ ...findRoleUser[i].detail_user.dataValues, role: findRoleUser[i].detail_role })
                }
                const findUser = [
                  ...findDataUser,
                  ...dataRole
                ]
                if (findUser.length > 0) {
                  if (accKlaim.find(item => item === noLevel.level)) {
                    if (noLevel.level === 3) {
                      let toMail = null
                      for (let i = 0; i < findUser.length; i++) {
                        const namePic = findUser[i].fullname
                        const dataPic = findPic.dataValues
                        const agr1 = dataPic[Object.keys(dataPic).find(x => findTrans.nama_coa.toLowerCase().indexOf(x.toLowerCase() === 'mcp' ? cekCoa : x.toLowerCase()) !== -1)].toLowerCase()
                        const agr2 = namePic.toLowerCase()
                        if (agr1 === agr2) {
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
                        return response(res, 'failed get email 11 king', { toMail, findUser, listName }, 404, false)
                      }
                    } else {
                      const findSpv = await spvklaim.findAll()
                      if (findSpv.length > 0) {
                        let toMail = null
                        for (let i = 0; i < findUser.length; i++) {
                          const namePic = findUser[i].fullname
                          const dataPic = findPic.dataValues
                          const dataSpv = findSpv.dataValues
                          const agr0 = dataSpv.find(({pic_klaim}) => pic_klaim.toLowerCase() === dataPic[Object.keys(dataPic).find(x => findTrans.nama_coa.toLowerCase().indexOf(x.toLowerCase() === 'mcp' ? cekCoa : x.toLowerCase()))].toLowerCase()).spv_klaim.toLowerCase() // eslint-disable-line
                          const agr1 = dataSpv.find(({pic_klaim}) => pic_klaim.toLowerCase() === dataPic[Object.keys(dataPic).find(x => findTrans.nama_coa.toLowerCase().indexOf(x.toLowerCase() === 'mcp' ? cekCoa : x.toLowerCase()))].toLowerCase()).manager_klaim.toLowerCase() // eslint-disable-line
                          const agrconv = level === 13 ? agr1 : agr0
                          const agr2 = namePic.toLowerCase()
                          if (agrconv === agr2) {
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
                          return response(res, 'failed get email 11 king', { toMail, findUser, listName }, 404, false)
                        }
                      } else {
                        return response(res, 'failed get email 23', {}, 404, false)
                      }
                    }
                  } else {
                    let toMail = null
                    for (let i = 0; i < findUser.length; i++) {
                      const findName = findUser[i].fullname === null ? '' : findUser[i].fullname
                      const findEmail = findUser[i].email === null ? '' : findUser[i].email
                      if (listName.find(e => e !== null && (e.toString().toLowerCase() === findName.toLowerCase() || e.toString().toLowerCase() === findEmail.toLowerCase())) !== undefined) {
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
                      return response(res, 'failed get email 13 king', { toMail, findUser, listName }, 404, false)
                    }
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
      return response(res, error.message, { line: error.lineNumber }, 500, false)
    }
  },
  draftEmailAjuan: async (req, res) => {
    // try {
    const name = req.user.name
    const level = req.user.level
    const { no, kode, tipe, menu, jenis, datareject, listreject } = req.body
    const transaksi = jenis === 'ikk' ? ikk : jenis === 'klaim' ? klaim : ops
    const findRole = await role.findOne({
      where: {
        level: level
      }
    })
    const findDepo = await finance.findOne({
      where: {
        kode_plant: kode
      }
    })
    const findTrans = await transaksi.findAll({
      where: {
        no_pembayaran: no,
        [Op.not]: {
          status_transaksi: 5
        }
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
                    const findName = findDraftUser[i].fullname === null ? '' : findDraftUser[i].fullname
                    const findEmail = findDraftUser[i].email === null ? '' : findDraftUser[i].email
                    if (listName.find(e => e !== null && (e.toString().toLowerCase() === findName.toLowerCase() || e.toString().toLowerCase() === findEmail.toLowerCase())) !== undefined) {
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
                const findDataUser = await user.findAll({
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
                const findRoleUser = await role_user.findAll({
                  where: {
                    id_role: noLevel.level
                  },
                  include: [
                    {
                      model: user,
                      as: 'detail_user'
                    },
                    {
                      model: role,
                      as: 'detail_role'
                    }
                  ]
                })
                const dataRole = []
                for (let i = 0; i < findRoleUser.length; i++) {
                  dataRole.push({ ...findRoleUser[i].detail_user.dataValues, role: findRoleUser[i].detail_role })
                }
                const findUser = [
                  ...findDataUser,
                  ...dataRole
                ]
                if (findUser.length > 0) {
                  let toMail = null
                  for (let i = 0; i < findUser.length; i++) {
                    const findName = findUser[i].fullname === null ? '' : findUser[i].fullname
                    const findEmail = findUser[i].email === null ? '' : findUser[i].email
                    if (listName.find(e => e !== null && (e.toString().toLowerCase() === findName.toLowerCase() || e.toString().toLowerCase() === findEmail.toLowerCase())) !== undefined) {
                      toMail = findUser[i]
                    }
                  }
                  if (toMail !== null) {
                    if (findDraft) {
                      return response(res, 'success get draft email', { from: name, to: toMail, cc: temp, result: findDraft })
                    } else {
                      return response(res, 'failed get email1', { toMail }, 404, false)
                    }
                  } else {
                    return response(res, 'failed get email2', { toMail }, 404, false)
                  }
                } else {
                  return response(res, 'failed get email3', { findUser }, 404, false)
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
                  return response(res, 'failed get email1s', { findUser }, 404, false)
                }
              }
            } else {
              return response(res, 'failed get email2s', { temp }, 404, false)
            }
          } else {
            return response(res, 'failed get email3s', { findDraft }, 404, false)
          }
        } else {
          return response(res, 'failed get email4s', { findApp }, 404, false)
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
                  const findName = findDraftUser[i].fullname === null ? '' : findDraftUser[i].fullname
                  const findEmail = findDraftUser[i].email === null ? '' : findDraftUser[i].email
                  if (listName.find(e => e !== null && (e.toString().toLowerCase() === findName.toLowerCase() || e.toString().toLowerCase() === findEmail.toLowerCase())) !== undefined) {
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
                  return response(res, 'success get draft email1s', { from: name, to: dataTo, cc: temp, result: findDraft })
                } else {
                  return response(res, 'failed get email2s 0', { dataTo }, 404, false)
                }
              } else {
                return response(res, 'failed get email3s 0', { tempDepo }, 404, false)
              }
            } else {
              if (noLevel.type === 'area') {
                const findDataUser = await user.findAll({
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
                const findRoleUser = await role_user.findAll({
                  where: {
                    id_role: noLevel.level
                  },
                  include: [
                    {
                      model: user,
                      as: 'detail_user'
                    },
                    {
                      model: role,
                      as: 'detail_role'
                    }
                  ]
                })
                const dataRole = []
                for (let i = 0; i < findRoleUser.length; i++) {
                  dataRole.push({ ...findRoleUser[i].detail_user.dataValues, role: findRoleUser[i].detail_role })
                }
                const findUser = [
                  ...findDataUser,
                  ...dataRole
                ]
                if (findUser.length > 0) {
                  let toMail = null
                  for (let i = 0; i < findUser.length; i++) {
                    const findName = findUser[i].fullname === null ? '' : findUser[i].fullname
                    const findEmail = findUser[i].email === null ? '' : findUser[i].email
                    if (listName.find(e => e !== null && (e.toString().toLowerCase() === findName.toLowerCase() || e.toString().toLowerCase() === findEmail.toLowerCase())) !== undefined) {
                      toMail = findUser[i]
                    }
                  }
                  if (toMail !== null) {
                    if (findDraft) {
                      return response(res, 'success get draft email', { from: name, to: toMail, cc: temp, result: findDraft })
                    } else {
                      return response(res, 'failed get email 2k', { toMail }, 404, false)
                    }
                  } else {
                    return response(res, 'failed get email 14 king', { toMail, findUser, listName }, 404, false)
                  }
                } else {
                  return response(res, 'failed get email 0k', { findUser }, 404, false)
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
                  return response(res, 'failed get email5b', { findUser }, 404, false)
                }
              }
            }
          } else {
            return response(res, 'failed get email4b', { temp }, 404, false)
          }
        } else {
          return response(res, 'failed get email3b', { findDraft }, 404, false)
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
                  const findName = findDraftUser[i].fullname === null ? '' : findDraftUser[i].fullname
                  const findEmail = findDraftUser[i].email === null ? '' : findDraftUser[i].email
                  if (listName.find(e => e !== null && (e.toString().toLowerCase() === findName.toLowerCase() || e.toString().toLowerCase() === findEmail.toLowerCase())) !== undefined) {
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
              const findDataUser = await user.findAll({
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
              const findRoleUser = await role_user.findAll({
                where: {
                  id_role: noLevel.level
                },
                include: [
                  {
                    model: user,
                    as: 'detail_user'
                  },
                  {
                    model: role,
                    as: 'detail_role'
                  }
                ]
              })
              const dataRole = []
              for (let i = 0; i < findRoleUser.length; i++) {
                dataRole.push({ ...findRoleUser[i].detail_user.dataValues, role: findRoleUser[i].detail_role })
              }
              const findUser = [
                ...findDataUser,
                ...dataRole
              ]
              if (findUser.length > 0) {
                let toMail = null
                for (let i = 0; i < findUser.length; i++) {
                  const findName = findUser[i].fullname === null ? '' : findUser[i].fullname
                  const findEmail = findUser[i].email === null ? '' : findUser[i].email
                  if (listName.find(e => e !== null && (e.toString().toLowerCase() === findName.toLowerCase() || e.toString().toLowerCase() === findEmail.toLowerCase())) !== undefined) {
                    toMail = findUser[i]
                  }
                }
                if (toMail !== null) {
                  if (findDraft) {
                    return response(res, 'success get draft email', { from: name, to: toMail, cc: temp, result: findDraft })
                  } else {
                    return response(res, 'failed get email 2v', { toMail }, 404, false)
                  }
                } else {
                  return response(res, 'failed get email 15v king', { toMail, findUser, listName }, 404, false)
                }
              } else {
                return response(res, 'failed get email 0v', { findUser }, 404, false)
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
                  const findName = findDraftUser[i].fullname === null ? '' : findDraftUser[i].fullname
                  const findEmail = findDraftUser[i].email === null ? '' : findDraftUser[i].email
                  if (listName.find(e => e !== null && (e.toString().toLowerCase() === findName.toLowerCase() || e.toString().toLowerCase() === findEmail.toLowerCase())) !== undefined) {
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
            const tipeStat = datareject === 'Revisi PIC Finance' ? 2 : 5
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
                if (listreject !== undefined && listreject.find((item) => item === findTrans[i].id) !== undefined) {
                  tempDepo.push(findTrans[i].kode_plant)
                }
              }
              if (tempDepo.length) {
                const uniqDepo = [...new Set(tempDepo)]
                const dataTo = []
                for (let i = 0; i < uniqDepo.length; i++) {
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
                    for (let i = 0; i < findUser.length; i++) {
                      const findName = findUser[i].fullname === null ? '' : findUser[i].fullname
                      const findEmail = findUser[i].email === null ? '' : findUser[i].email
                      if (listName.find(e => e !== null && (e.toString().toLowerCase() === findName.toLowerCase() || e.toString().toLowerCase() === findEmail.toLowerCase())) !== undefined) {
                        dataTo.push(findUser[i])
                      }
                    }
                  }
                }
                if (dataTo.length > 0) {
                  return response(res, 'success get draft email', { from: name, to: dataTo, cc: temp, result: findDraft, datareject, tipeStat, listreject })
                } else {
                  return response(res, 'failed get email 0c', { dataTo }, 404, false)
                }
              } else {
                return response(res, 'failed get email 01c', { tempDepo }, 404, false)
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
                return response(res, 'failed get email5m', { findUser }, 404, false)
              }
            }
          } else {
            return response(res, 'failed get email4m', { temp }, 404, false)
          }
        } else {
          return response(res, 'failed get email3m', { findDraft }, 404, false)
        }
      }
    } else {
      return response(res, 'failed get email 1m', { findRole, findDepo }, 404, false)
    }
    // } catch (error) {
    //   return response(res, error.message, {}, 500, false)
    // }
  },
  sendEmail: async (req, res) => {
    try {
      const name = req.user.name
      const fullname = req.user.fullname
      const level = req.user.level
      const { nameTo, to, cc, message, no, tipe, subject, jenis, draft, listData, proses } = req.body
      const findRole = await role.findOne({
        where: {
          level: level
        }
      })
      if (findRole) {
        const transaksi = tipe === 'ikk' ? ikk : tipe === 'klaim' ? klaim : tipe === 'vendor' ? vervendor : ops
        // const title = tipe === 'ikk' ? 'IKK' : tipe === 'klaim' ? 'Klaim' : 'Operasional'
        const findData = await transaksi.findAll({
          where: {
            [Op.and]: [
              jenis === 'ajuan' ? { no_pembayaran: no } : { no_transaksi: no }
            ]
          }
        })
        if (findData.length > 0) {
          const cekResmail = []
          const dataDraft = draft.result
          const findResmail = await resmail.findOne({
            where: {
              from: name,
              no_transaksi: no,
              [Op.and]: [
                { type: { [Op.like]: `%${dataDraft.type}` } },
                { menu: { [Op.like]: `%${dataDraft.menu}` } }
              ]
            }
          })
          const tostr = JSON.stringify(draft.to)
          const ccstr = JSON.stringify(draft.cc)
          if (findResmail) {
            const dataUpdate = {
              from: name,
              to: tostr,
              cc: ccstr,
              no_transaksi: no,
              type: dataDraft.type,
              menu: dataDraft.menu,
              kode_plant: findData[0].kode_plant,
              type_trans: tipe,
              subject: subject,
              message: message,
              status: parseInt(findResmail.status) + 1,
              history: `${findResmail.history}, send email by ${name} at ${moment().format('DD/MM/YYYY h:mm:ss a')}`
            }
            const updateRes = await findResmail.update(dataUpdate)
            if (updateRes) {
              cekResmail.push(1)
            }
          } else {
            const dataCreate = {
              from: name,
              to: tostr,
              cc: ccstr,
              no_transaksi: no,
              type: dataDraft.type,
              menu: dataDraft.menu,
              kode_plant: findData[0].kode_plant,
              type_trans: tipe,
              subject: subject,
              message: message,
              status: 1,
              history: `send email by ${name} at ${moment().format('DD/MM/YYYY h:mm:ss a')}`
            }
            const createRes = await resmail.create(dataCreate)
            if (createRes) {
              cekResmail.push(1)
            }
          }
          if (cekResmail.length > 0) {
            const cekList = [proses, tipe, listData]
            const cekNon = [proses, tipe, listData]
            let tableTd = ''
            const dataTo = nameTo === undefined ? '' : nameTo
            for (let i = 0; i < findData.length; i++) {
              const data = findData[i]
              const dateData = tipe === 'ikk' ? data.start_ikk : tipe === 'klaim' ? data.start_klaim : tipe === 'vendor' ? data.start_transaksi : data.start_ops
              if (tipe !== 'vendor' && proses === 'reject perbaikan' && listData !== undefined && listData.length > 0) {
                if (listData.find((item) => parseInt(item) === parseInt(data.id)) !== undefined) {
                  const element = `
                  <tr>
                    <th>${findData[i].no_transaksi}</th>
                    <th>${findData[i].cost_center}</th>
                    <th>${findData[i].area}</th>
                    <th>${findData[i].no_coa}</th>
                    <th>${findData[i].sub_coa}</th>
                    <th>${findData[i].keterangan || findData[i].uraian}</th>
                    <th>${moment(dateData || moment()).format('DD MMMM YYYY')}</th>
                  </tr>`
                  tableTd = tableTd + element
                  cekList.push(listData.find((item) => parseInt(item) === parseInt(data.id)))
                }
              } else {
                const element = tipe === 'vendor'
                  ? `
                    <tr>
                      <th>${i + 1}</th>
                      <th>${findData[i].no_transaksi}</th>
                      <th>${findData[i].kode_plant}</th>
                      <th>${findData[i].nama}</th>
                      <th>${findData[i].nik}</th>
                      <th>${findData[i].npwp}</th>
                      <th>${moment(dateData || moment()).format('DD MMMM YYYY')}</th>
                    </tr>`
                  : `
                    <tr>
                      <th>${findData[i].no_transaksi}</th>
                      <th>${findData[i].cost_center}</th>
                      <th>${findData[i].area}</th>
                      <th>${findData[i].no_coa}</th>
                      <th>${findData[i].sub_coa}</th>
                      <th>${findData[i].keterangan || findData[i].uraian}</th>
                      <th>${moment(dateData || moment()).format('DD MMMM YYYY')}</th>
                    </tr>`
                tableTd = tableTd + element
                cekNon.push(data)
              }
            }
            const tabletr = tipe === 'vendor'
              ? `
                <tr>
                  <th>No</th>
                  <th>NO.AJUAN</th>
                  <th>KODE PLANT</th>
                  <th>NAMA VENDOR</th>
                  <th>NIK</th>
                  <th>NO NPWP</th>
                  <th>TANGGAL AJUAN</th>
              </tr>`
              : `
                <tr>
                  <th>NO.AJUAN</th>
                  <th>COST CENTRE</th>
                  <th>AREA</th>
                  <th>NO.COA</th>
                  <th>JENIS TRANSAKSI</th>
                  <th>KETERANGAN TAMBAHAN</th>
                  <th>TANGGAL AJUAN</th>
              </tr>`
            const mailOptions = {
              from: 'noreply_ofr@pinusmerahabadi.co.id',
              replyTo: 'noreply_ofr@pinusmerahabadi.co.id',
              to: `${to}`,
              cc: cc.split(','),
              // to: 'fahmi_aziz@pinusmerahabadi.co.id',
              // cc: 'fahmi_aziz@pinusmerahabadi.co.id, noreplyofr@gmail.com',
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
                                  ${tabletr}
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
                          ${fullname}
                      </div>
                  </body>
                  `
            }
            const sendEmail = await wrapMail.wrapedSendMail(mailOptions)
            if (sendEmail) {
              return response(res, 'success send email', { sendEmail, cekList, cekNon })
            } else {
              return response(res, 'gagal kirim email', { sendEmail, cekList, cekNon })
            }
          } else {
            return response(res, 'failed send email1', { findData }, 404, false)
          }
        } else {
          return response(res, 'failed send email2', { findData }, 404, false)
        }
      } else {
        return response(res, 'failed get email3', { findRole }, 404, false)
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
  },
  tesEmail: async (req, res) => {
    try {
      const mailOptions = {
        from: 'noreply_ofr@pinusmerahabadi.co.id',
        replyTo: 'noreply_ofr@pinusmerahabadi.co.id',
        to: 'fahmiazis797@gmail.com',
        cc: 'fahmi_aziz@pinusmerahabadi.co.id, noreplyofr@gmail.com',
        subject: 'TES EMAIL WEB OFR',
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
                    TES EMAIL,
                </div>
                <div class="tittle mar1">
                    <div>TES EMAIL WEB OFR</div>
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
                    Admin
                </div>
            </body>
            `
      }
      const sendEmail = await wrapMail.wrapedSendMail(mailOptions)
      if (sendEmail) {
        return response(res, 'success send email', { sendEmail })
      } else {
        return response(res, 'gagal kirim email', { sendEmail }, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getResmail: async (req, res) => {
    try {
      const name = req.user.name
      const {
        no,
        draft
      } = req.body
      const dataDraft = draft.result
      const findResmail = await resmail.findOne({
        where: {
          from: name,
          no_transaksi: no,
          [Op.and]: [
            { type: { [Op.like]: `%${dataDraft.type}` } },
            { menu: { [Op.like]: `%${dataDraft.menu}` } }
          ]
        }
      })
      if (findResmail) {
        return response(res, 'success get resmail', { result: findResmail })
      } else {
        return response(res, 'failed get resmail', { result: findResmail })
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  }
}
