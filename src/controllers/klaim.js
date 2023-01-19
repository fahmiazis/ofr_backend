const { klaim, coa, depo, docuser, approve, ttd, role, document } = require('../models')
const joi = require('joi')
const { Op } = require('sequelize')
const response = require('../helpers/response')
const moment = require('moment')
const uploadHelper = require('../helpers/upload')
const multer = require('multer')
const { filterApp, filter } = require('../helpers/pagination')

module.exports = {
  addCart: async (req, res) => {
    try {
      const kode = req.user.kode
      // const name = req.user.name
      // const level = req.user.level
      const schema = joi.object({
        no_coa: joi.string().required(),
        keterangan: joi.string().required(),
        periode_awal: joi.date().required(),
        periode_akhir: joi.date().required(),
        nilai_ajuan: joi.string().required(),
        bank_tujuan: joi.string().required(),
        norek_ajuan: joi.string().required(),
        nama_tujuan: joi.string().required(),
        status_npwp: joi.number().required(),
        nama_npwp: joi.string().allow(''),
        no_npwp: joi.string().allow(''),
        nama_ktp: joi.string().allow(''),
        no_ktp: joi.string().allow(''),
        periode: joi.string().allow('')
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 404, false)
      } else {
        const findDepo = await depo.findAll({
          where: {
            kode_plant: kode
          }
        })
        if (findDepo.length > 0) {
          const result = await coa.findOne({
            where: {
              no_coa: results.no_coa
            }
          })
          if (result) {
            const findDraft = await klaim.findOne({
              where: {
                kode_plant: kode,
                status_transaksi: null
              }
            })
            const send = {
              kode_plant: findDepo[0].kode_plant,
              area: findDepo[0].area,
              cost_center: findDepo[0].cost_center,
              no_coa: results.no_coa,
              nama_coa: result.nama_coa,
              keterangan: results.keterangan,
              periode_awal: results.periode_awal,
              periode_akhir: results.periode_akhir,
              nilai_ajuan: results.nilai_ajuan,
              bank_tujuan: results.bank_tujuan,
              norek_ajuan: results.norek_ajuan,
              nama_tujuan: results.nama_tujuan,
              status_npwp: results.status_npwp,
              nama_npwp: results.nama_npwp,
              no_npwp: results.no_npwp,
              nama_ktp: results.nama_ktp,
              no_ktp: results.no_ktp,
              periode: results.periode
            }
            if (findDraft) {
              const month = moment(results.periode_awal).format('MMMM YYYY')
              const monthLast = moment(results.periode_akhir).format('MMMM YYYY')
              const monthCom = moment(findDraft.periode_awal).format('MMMM YYYY')
              const monthComLast = moment(findDraft.periode_akhir).format('MMMM YYYY')
              if (findDraft.no_coa === results.no_coa && month === monthCom && monthLast === monthComLast) {
                const sendData = await klaim.create(send)
                if (sendData) {
                  return response(res, 'success add klaim1', { result: sendData })
                } else {
                  return response(res, 'failed add klaim 7', {}, 400, false)
                }
              } else {
                return response(res, 'Pastikan program dan periode sama dalam satu pengajuan', {}, 400, false)
              }
            } else {
              const findKlaim = await klaim.findOne({
                where: {
                  no_coa: results.no_coa,
                  kode_plant: kode,
                  [Op.not]: [
                    { status_transaksi: null },
                    { status_transaksi: 0 },
                    { status_transaksi: 8 }
                  ]
                }
              })
              if (findKlaim) {
                const month = moment(results.periode_awal).format('MMMM YYYY')
                const monthLast = moment(results.periode_akhir).format('MMMM YYYY')
                const monthCom = moment(findKlaim.periode_awall).format('MMMM YYYY')
                const monthComLast = moment(findKlaim.periode_akhir).format('MMMM YYYY')
                if (month === monthCom && monthLast === monthComLast) {
                  return response(res, 'data ini telah diajukan pada pengajuan sebelumnya', { result: findKlaim })
                } else {
                  const sendData = await klaim.create(send)
                  if (sendData) {
                    return response(res, 'success add klaim2', { result: sendData })
                  } else {
                    return response(res, 'failed add klaim 7', {}, 400, false)
                  }
                }
              } else {
                const sendData = await klaim.create(send)
                if (sendData) {
                  return response(res, 'success add klaim3', { result: sendData })
                } else {
                  return response(res, 'failed add klaim 7', {}, 400, false)
                }
              }
            }
          } else {
            return response(res, 'failed add klaim 3', {}, 400, false)
          }
        } else {
          return response(res, 'failed add klaim 1', {}, 400, false)
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  editKlaim: async (req, res) => {
    try {
      // const name = req.user.name
      // const level = req.user.level
      const id = req.params.id
      const schema = joi.object({
        no_coa: joi.string().required(),
        keterangan: joi.string().required(),
        periode_awal: joi.date().required(),
        periode_akhir: joi.date().required(),
        nilai_ajuan: joi.string().required(),
        bank_tujuan: joi.string().required(),
        norek_ajuan: joi.string().required(),
        nama_tujuan: joi.string().required(),
        status_npwp: joi.number().required(),
        nama_npwp: joi.string().allow(''),
        no_npwp: joi.string().allow(''),
        nama_ktp: joi.string().allow(''),
        no_ktp: joi.string().allow(''),
        periode: joi.string().allow('')
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 404, false)
      } else {
        const result = await coa.findOne({
          where: {
            no_coa: results.no_coa
          }
        })
        if (result) {
          const findDraft = await klaim.findByPk(id)
          const send = {
            no_coa: results.no_coa,
            nama_coa: result.nama_coa,
            keterangan: results.keterangan,
            periode_awal: results.periode_awal,
            periode_akhir: results.periode_akhir,
            nilai_ajuan: results.nilai_ajuan,
            bank_tujuan: results.bank_tujuan,
            norek_ajuan: results.norek_ajuan,
            nama_tujuan: results.nama_tujuan,
            status_npwp: results.status_npwp,
            nama_npwp: results.nama_npwp,
            no_npwp: results.no_npwp,
            nama_ktp: results.nama_ktp,
            no_ktp: results.no_ktp,
            periode: results.periode
          }
          if (findDraft) {
            if (findDraft.no_coa === results.no_coa) {
              const sendData = await findDraft.update(send)
              if (sendData) {
                return response(res, 'success add klaim1', { result: sendData })
              } else {
                return response(res, 'failed add klaim 7', {}, 400, false)
              }
            } else {
              return response(res, 'Pastikan program dan periode sama dalam satu pengajuan', {}, 400, false)
            }
          } else {
            return response(res, 'failed add klaim 7', {}, 400, false)
          }
        } else {
          return response(res, 'failed add klaim 3', {}, 400, false)
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getCartClaim: async (req, res) => {
    try {
      const kode = req.user.kode
      const findKlaim = await klaim.findAll({
        where: {
          kode_plant: kode,
          [Op.or]: [
            { status_transaksi: 1 },
            { status_transaksi: null }
          ]
        }
      })
      if (findKlaim) {
        return response(res, 'success get cart klaim', { result: findKlaim })
      } else {
        return response(res, 'failed get cart', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  deleteCart: async (req, res) => {
    try {
      const id = req.params.id
      const findKlaim = await klaim.findByPk(id)
      if (findKlaim) {
        await findKlaim.destroy()
        return response(res, 'success delete cart klaim', { result: findKlaim })
      } else {
        return response(res, 'failed get cart', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  submitKlaim: async (req, res) => {
    try {
      const kode = req.user.kode
      const findNo = await klaim.findAll({
        where: {
          [Op.not]: { no_transaksi: null }
        },
        order: [['id', 'DESC']],
        limit: 50
      })
      const cekNo = []
      if (findNo.length > 0) {
        for (let i = 0; i < findNo.length; i++) {
          const no = findNo[i].no_transaksi.split('/')
          cekNo.push(parseInt(no[0]))
        }
      } else {
        cekNo.push(0)
      }
      const noKlaim = Math.max(...cekNo) + 1
      const findKlaim = await klaim.findAll({
        where: {
          kode_plant: kode,
          [Op.or]: [
            { status_transaksi: null },
            { status_transaksi: 1 }
          ]
        }
      })
      if (findKlaim.length > 0) {
        const temp = []
        const change = noKlaim.toString().split('')
        const notrans = change.length === 2 ? '00' + noKlaim : change.length === 1 ? '000' + noKlaim : change.length === 3 ? '0' + noKlaim : noKlaim
        const month = parseInt(moment().format('MM'))
        const year = moment().format('YYYY')
        let rome = ''
        if (month === 1) {
          rome = 'I'
        } else if (month === 2) {
          rome = 'II'
        } else if (month === 3) {
          rome = 'III'
        } else if (month === 4) {
          rome = 'IV'
        } else if (month === 5) {
          rome = 'V'
        } else if (month === 6) {
          rome = 'VI'
        } else if (month === 7) {
          rome = 'VII'
        } else if (month === 8) {
          rome = 'VIII'
        } else if (month === 9) {
          rome = 'IX'
        } else if (month === 10) {
          rome = 'X'
        } else if (month === 11) {
          rome = 'XI'
        } else if (month === 12) {
          rome = 'XII'
        }
        const noTrans = findKlaim[0].no_transaksi === null ? `${notrans}/${kode}/${rome}/${year}-KLM` : findKlaim[0].no_transaksi
        const data = {
          status_transaksi: 1,
          no_transaksi: noTrans
        }
        for (let i = 0; i < findKlaim.length; i++) {
          const findDraft = await klaim.findByPk(findKlaim[i].id)
          if (findDraft) {
            const upKlaim = await findDraft.update(data)
            if (upKlaim) {
              temp.push(1)
            }
          }
        }
        if (temp.length) {
          return response(res, 'success submit cart', { noklaim: noTrans })
        } else {
          return response(res, 'failed submit cart', { noklaim: noTrans })
        }
      } else {
        return response(res, 'failed submit cart', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  submitKlaimFinal: async (req, res) => {
    try {
      const { no } = req.body
      const kode = req.user.kode
      const findKlaim = await klaim.findAll({
        where: {
          no_transaksi: no,
          kode_plant: kode,
          status_transaksi: 1
        }
      })
      if (findKlaim) {
        const temp = []
        for (let i = 0; i < findKlaim.length; i++) {
          const data = {
            status_transaksi: 2,
            history: `submit pengajuan klaim by ${kode} at ${moment().format('DD/MM/YYYY h:mm:ss a')}`,
            start_klaim: moment()
          }
          const findData = await klaim.findByPk(findKlaim[i].id)
          if (findData) {
            await findData.update(data)
            temp.push(findData)
          }
        }
        if (temp.length > 0) {
          return response(res, 'success submit cart')
        } else {
          return response(res, 'failed submit cart', {}, 404, false)
        }
      } else {
        return response(res, 'failed submit cart', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  uploadDocument: async (req, res) => {
    const { no, id } = req.query
    uploadHelper(req, res, async function (err) {
      try {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_UNEXPECTED_FILE' && req.files.length === 0) {
            // console.log(err.code === 'LIMIT_UNEXPECTED_FILE' && req.files.length > 0)
            return response(res, 'fieldname doesnt match', {}, 500, false)
          }
          return response(res, err.message, {}, 500, false)
        } else if (err) {
          return response(res, err.message, {}, 401, false)
        }
        const dokumen = `assets/documents/${req.file.filename}`
        console.log(no)
        const send = {
          status: 1,
          path: dokumen,
          divisi: 'klaim',
          history: req.file.originalname,
          jenis_dok: 'lampiran'
        }
        const make = await docuser.findByPk(id)
        if (make) {
          await make.update(send)
          return response(res, 'success upload dokumen')
        } else {
          return response(res, 'success upload dokumen')
        }
      } catch (error) {
        return response(res, error.message, {}, 500, false)
      }
    })
  },
  getDocument: async (req, res) => {
    try {
      const { no, name } = req.body
      const findDoc = await docuser.findAll({
        where: {
          no_transaksi: no
        }
      })
      if (findDoc.length > 0) {
        return response(res, 'success get dokumen', { result: findDoc })
      } else {
        const findMaster = await document.findAll({
          where: {
            [Op.and]: [
              { jenis: 'Klaim' },
              { type: name }
            ]
          }
        })
        if (findMaster.length > 0) {
          const temp = []
          for (let i = 0; i < findMaster.length; i++) {
            const data = {
              desc: findMaster[i].name,
              jenis_form: findMaster[i].jenis,
              no_transaksi: no,
              tipe: findMaster[i].type,
              stat_upload: findMaster[i].stat_upload
            }
            const creDoc = await docuser.create(data)
            if (creDoc) {
              temp.push(creDoc)
            }
          }
          if (temp.length > 0) {
            const findDocCre = await docuser.findAll({
              where: {
                no_transaksi: no
              }
            })
            if (findDocCre.length > 0) {
              return response(res, 'success get dokumen', { result: findDocCre })
            } else {
              return response(res, 'failed get dokumen', { result: [] })
            }
          } else {
            return response(res, 'failed get dokumen', { result: [] })
          }
        } else {
          return response(res, 'failed get dokumen', { result: [] })
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getDocDraft: async (req, res) => {
    try {
      const { name } = req.params.name
      const findDoc = await document.findAll({
        where: {
          [Op.and]: [
            { jenis: 'Klaim' },
            { type: name }
          ]
        }
      })
      if (findDoc) {
        return response(res, 'success get dokumen', { result: findDoc })
      } else {
        return response(res, 'failed get dokumen')
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getKlaim: async (req, res) => {
    try {
      const level = req.user.level
      const kode = req.user.kode
      const name = req.user.name
      const role = req.user.role
      const { status, reject, menu, type, category } = req.query
      const statTrans = status === 'undefined' || status === null ? 2 : status
      const statRej = reject === 'undefined' ? null : reject
      const statMenu = menu === 'undefined' ? null : menu
      if (level === 5) {
        const findKlaim = await klaim.findAll({
          where: {
            kode_plant: kode,
            [Op.and]: [
              statTrans === 'all' ? { [Op.not]: { id: null } } : { status_transaksi: statTrans },
              statRej === 'all' ? { [Op.not]: { id: null } } : { status_reject: statRej },
              statMenu === 'all' ? { [Op.not]: { id: null } } : { menu_rev: { [Op.like]: `%${statMenu}%` } }
            ]
          },
          order: [
            ['id', 'ASC'],
            [{ model: ttd, as: 'appForm' }, 'id', 'DESC']
          ],
          include: [
            {
              model: ttd,
              as: 'appForm'
            }
          ]
        })
        const data = []
        findKlaim.map(x => {
          return (
            data.push(x.no_transaksi)
          )
        })
        const set = new Set(data)
        const noDis = [...set]
        if (findKlaim) {
          const newKlaim = category === 'verif' ? filter(type, findKlaim, noDis, role) : filterApp(type, findKlaim, noDis, role)
          return response(res, 'success get data klaim', { result: findKlaim, noDis, newKlaim })
        } else {
          return response(res, 'success get data klaim', { result: findKlaim, noDis, newKlaim: [] })
        }
      } else if (level === 10 || level === 11 || level === 12 || level === 2) {
        const findDepo = await depo.findAll({
          where: {
            [Op.or]: [
              { bm: level === 10 ? name : 'undefined' },
              { om: level === 11 ? name : 'undefined' },
              { nom: level === 12 ? name : 'undefined' },
              { pic_1: level === 2 ? name : 'undefined' }
            ]
          }
        })
        if (findDepo.length) {
          const hasil = []
          for (let i = 0; i < findDepo.length; i++) {
            const result = await klaim.findAll({
              where: {
                kode_plant: findDepo[i].kode_plant,
                [Op.and]: [
                  statTrans === 'all' ? { [Op.not]: { status_transaksi: null } } : { status_transaksi: statTrans },
                  statRej === 'all' ? { [Op.not]: { id: null } } : { status_reject: statRej },
                  statMenu === 'all' ? { [Op.not]: { id: null } } : { menu_rev: { [Op.like]: `%${statMenu}%` } }
                ]
              },
              order: [
                ['id', 'ASC'],
                [{ model: ttd, as: 'appForm' }, 'id', 'DESC']
              ],
              include: [
                {
                  model: ttd,
                  as: 'appForm'
                }
              ]
            })
            if (result.length > 0) {
              for (let j = 0; j < result.length; j++) {
                hasil.push(result[j])
              }
            }
          }
          if (hasil.length > 0) {
            const data = []
            hasil.map(x => {
              return (
                data.push(x.no_transaksi)
              )
            })
            const set = new Set(data)
            const noDis = [...set]
            const result = hasil
            const newKlaim = category === 'verif' ? filter(type, result, noDis, role) : filterApp(type, result, noDis, role)
            return response(res, 'success get klaim', { result, noDis, findDepo, newKlaim })
          } else {
            const result = hasil
            const noDis = []
            return response(res, 'success get klaim', { result, noDis, findDepo, newKlaim: [] })
          }
        } else {
          return response(res, 'failed get klaim', {}, 400, false)
        }
      } else {
        const findKlaim = await klaim.findAll({
          where: {
            [Op.and]: [
              statTrans === 'all' ? { [Op.not]: { status_transaksi: null } } : { status_transaksi: statTrans },
              statRej === 'all' ? { [Op.not]: { id: null } } : { status_reject: statRej },
              statMenu === 'all' ? { [Op.not]: { id: null } } : { menu_rev: { [Op.like]: `%${statMenu}%` } }
            ]
          },
          order: [
            ['id', 'ASC'],
            [{ model: ttd, as: 'appForm' }, 'id', 'DESC']
          ],
          include: [
            {
              model: ttd,
              as: 'appForm'
            }
          ]
        })
        const data = []
        findKlaim.map(x => {
          return (
            data.push(x.no_transaksi)
          )
        })
        const set = new Set(data)
        const noDis = [...set]
        if (findKlaim) {
          const newKlaim = category === 'verif' ? filter(type, findKlaim, noDis, role) : filterApp(type, findKlaim, noDis, role)
          return response(res, 'success get data klaim', { result: findKlaim, noDis, newKlaim })
        } else {
          return response(res, 'success get data klaim', { result: findKlaim, noDis })
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getReport: async (req, res) => {
    try {
      const level = req.user.level
      const kode = req.user.kode
      const name = req.user.name
      const role = req.user.role
      const { status, reject, menu, type, category } = req.query
      const statTrans = status === 'undefined' || status === null ? 2 : status
      const statRej = reject === 'undefined' ? null : reject
      const statMenu = menu === 'undefined' ? null : menu
      if (level === 5) {
        const findKlaim = await klaim.findAll({
          where: {
            kode_plant: kode,
            [Op.and]: [
              statTrans === 'all' ? { [Op.not]: { id: null } } : { status_transaksi: statTrans },
              statRej === 'all' ? { [Op.not]: { id: null } } : { status_reject: statRej },
              statMenu === 'all' ? { [Op.not]: { id: null } } : { menu_rev: { [Op.like]: `%${statMenu}%` } }
            ]
          },
          order: [
            ['id', 'ASC'],
            [{ model: ttd, as: 'appForm' }, 'id', 'DESC']
          ],
          include: [
            {
              model: ttd,
              as: 'appForm'
            }
          ]
        })
        const data = []
        findKlaim.map(x => {
          return (
            data.push(x.no_transaksi)
          )
        })
        const set = new Set(data)
        const noDis = [...set]
        if (findKlaim) {
          const newKlaim = category === 'verif' ? filter(type, findKlaim, noDis, role) : filterApp(type, findKlaim, noDis, role)
          return response(res, 'success get data klaim', { result: findKlaim, noDis, newKlaim })
        } else {
          return response(res, 'success get data klaim', { result: findKlaim, noDis, newKlaim: [] })
        }
      } else if (level === 10 || level === 11 || level === 12 || level === 2) {
        const findDepo = await depo.findAll({
          where: {
            [Op.or]: [
              { bm: level === 10 ? name : 'undefined' },
              { om: level === 11 ? name : 'undefined' },
              { nom: level === 12 ? name : 'undefined' },
              { pic_1: level === 2 ? name : 'undefined' }
            ]
          }
        })
        if (findDepo.length) {
          const hasil = []
          for (let i = 0; i < findDepo.length; i++) {
            const result = await klaim.findAll({
              where: {
                kode_plant: findDepo[i].kode_plant,
                [Op.and]: [
                  statTrans === 'all' ? { [Op.not]: { status_transaksi: null } } : { status_transaksi: statTrans },
                  statRej === 'all' ? { [Op.not]: { id: null } } : { status_reject: statRej },
                  statMenu === 'all' ? { [Op.not]: { id: null } } : { menu_rev: { [Op.like]: `%${statMenu}%` } }
                ]
              },
              order: [
                ['id', 'ASC'],
                [{ model: ttd, as: 'appForm' }, 'id', 'DESC']
              ],
              include: [
                {
                  model: ttd,
                  as: 'appForm'
                }
              ]
            })
            if (result.length > 0) {
              for (let j = 0; j < result.length; j++) {
                hasil.push(result[j])
              }
            }
          }
          if (hasil.length > 0) {
            const data = []
            hasil.map(x => {
              return (
                data.push(x.no_transaksi)
              )
            })
            const set = new Set(data)
            const noDis = [...set]
            const result = hasil
            const newKlaim = category === 'verif' ? filter(type, result, noDis, role) : filterApp(type, result, noDis, role)
            return response(res, 'success get klaim', { result, noDis, findDepo, newKlaim })
          } else {
            const result = hasil
            const noDis = []
            return response(res, 'success get klaim', { result, noDis, findDepo, newKlaim: [] })
          }
        } else {
          return response(res, 'failed get klaim', {}, 400, false)
        }
      } else {
        const findKlaim = await klaim.findAll({
          where: {
            [Op.and]: [
              statTrans === 'all' ? { [Op.not]: { status_transaksi: null } } : { status_transaksi: statTrans },
              statRej === 'all' ? { [Op.not]: { id: null } } : { status_reject: statRej },
              statMenu === 'all' ? { [Op.not]: { id: null } } : { menu_rev: { [Op.like]: `%${statMenu}%` } }
            ]
          },
          order: [
            ['id', 'ASC'],
            [{ model: ttd, as: 'appForm' }, 'id', 'DESC']
          ],
          include: [
            {
              model: ttd,
              as: 'appForm'
            }
          ]
        })
        const data = []
        findKlaim.map(x => {
          return (
            data.push(x.no_transaksi)
          )
        })
        const set = new Set(data)
        const noDis = [...set]
        if (findKlaim) {
          const newKlaim = category === 'verif' ? filter(type, findKlaim, noDis, role) : filterApp(type, findKlaim, noDis, role)
          return response(res, 'success get data klaim', { result: findKlaim, noDis, newKlaim })
        } else {
          return response(res, 'success get data klaim', { result: findKlaim, noDis })
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getDetailKlaim: async (req, res) => {
    try {
      const { no } = req.body
      const findKlaim = await klaim.findAll({
        where: {
          no_transaksi: no
        },
        order: [
          ['id', 'ASC'],
          [{ model: ttd, as: 'appForm' }, 'id', 'DESC']
        ],
        include: [
          {
            model: ttd,
            as: 'appForm'
          }
        ]
      })
      if (findKlaim) {
        return response(res, 'success get dokumen', { result: findKlaim })
      } else {
        return response(res, 'failed get dokumen', { result: [] })
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getApproval: async (req, res) => {
    try {
      const { no } = req.body
      const findTtd = await ttd.findAll({
        where: {
          no_transaksi: no
        }
      })
      if (findTtd.length > 0) {
        const penyetuju = []
        const pembuat = []
        const pemeriksa = []
        const mengetahui = []
        for (let i = 0; i < findTtd.length; i++) {
          if (findTtd[i].sebagai === 'pembuat') {
            pembuat.push(findTtd[i])
          } else if (findTtd[i].sebagai === 'pemeriksa') {
            pemeriksa.push(findTtd[i])
          } else if (findTtd[i].sebagai === 'penyetuju') {
            penyetuju.push(findTtd[i])
          } else if (findTtd[i].sebagai === 'mengetahui') {
            mengetahui.push(findTtd[i])
          }
        }
        return response(res, 'succes get approval', { result: { pembuat, pemeriksa, penyetuju, mengetahui }, findTtd })
      } else {
        const findKlaim = await klaim.findOne({
          where: {
            no_transaksi: no
          }
        })
        if (findKlaim) {
          const findDepo = await depo.findOne({
            where: {
              kode_plant: findKlaim.kode_plant
            }
          })
          if (findDepo) {
            const findApp = await approve.findAll({
              where: {
                nama_approve: 'Pengajuan Klaim'
              }
            })
            if (findApp.length > 0) {
              const temp = []
              for (let i = 0; i < findApp.length; i++) {
                const data = {
                  jabatan: findApp[i].jabatan,
                  nama: findApp[i].jabatan === 'aos' ? findDepo.aos : null,
                  status: findApp[i].jabatan === 'aos' ? 1 : null,
                  no_transaksi: no,
                  sebagai: findApp[i].sebagai,
                  jenis: findApp[i].jenis,
                  kategori: findApp[i].kategori
                }
                const send = await ttd.create(data)
                if (send) {
                  temp.push(send)
                }
              }
              if (temp.length > 0) {
                const findTtd = await ttd.findAll({
                  where: {
                    no_transaksi: no
                  }
                })
                if (findTtd.length > 0) {
                  const penyetuju = []
                  const pembuat = []
                  const pemeriksa = []
                  const mengetahui = []
                  for (let i = 0; i < findTtd.length; i++) {
                    if (findTtd[i].sebagai === 'pembuat') {
                      pembuat.push(findTtd[i])
                    } else if (findTtd[i].sebagai === 'pemeriksa') {
                      pemeriksa.push(findTtd[i])
                    } else if (findTtd[i].sebagai === 'penyetuju') {
                      penyetuju.push(findTtd[i])
                    } else if (findTtd[i].sebagai === 'mengetahui') {
                      mengetahui.push(findTtd[i])
                    }
                  }
                  return response(res, 'succes get approval', { result: { pembuat, pemeriksa, penyetuju, mengetahui }, findTtd })
                } else {
                  return response(res, 'failed get approval1', {}, 404, false)
                }
              } else {
                return response(res, 'failed get approval2', {}, 404, false)
              }
            } else {
              return response(res, 'failed get approval3', {}, 404, false)
            }
          } else {
            return response(res, 'failed get approval4', {}, 404, false)
          }
        } else {
          return response(res, 'failed get approval5', {}, 404, false)
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  approveKlaim: async (req, res) => {
    try {
      const level = req.user.level
      const name = req.user.name
      const { no } = req.body
      const findKlaim = await klaim.findAll({
        where: {
          no_transaksi: no
        }
      })
      if (findKlaim.length > 0) {
        const findDepo = await depo.findOne({
          where: {
            kode_plant: findKlaim[0].kode_plant
          }
        })
        if (findDepo) {
          const findRole = await role.findOne({
            where: {
              level: level
            }
          })
          if (findRole) {
            const findTtd = await ttd.findAll({
              where: {
                no_transaksi: no
              }
            })
            if (findTtd.length > 0) {
              let hasil = 0
              let arr = null
              for (let i = 0; i < findTtd.length; i++) {
                if (findRole.name === findTtd[i].jabatan) {
                  hasil = findTtd[i].id
                  arr = i
                }
              }
              if (hasil !== 0) {
                if (arr !== findTtd.length - 1 && (findTtd[arr + 1].status !== null || findTtd[arr + 1].status === 1 || findTtd[arr + 1].status === 0)) {
                  return response(res, 'Anda tidak memiliki akses lagi untuk mengapprove', {}, 404, false)
                } else {
                  console.log(findTtd[arr - 1])
                  if (findTtd[arr - 1].status === '1') {
                    const data = {
                      nama: name,
                      status: 1
                    }
                    const findApp = await ttd.findByPk(hasil)
                    if (findApp) {
                      const upttd = await findApp.update(data)
                      if (upttd) {
                        const findFull = await ttd.findAll({
                          where: {
                            [Op.and]: [
                              { no_transaksi: no },
                              { status: { [Op.like]: '%1%' } }
                            ]
                          }
                        })
                        if (findTtd.length === findFull.length) {
                          const temp = []
                          for (let i = 0; i < findKlaim.length; i++) {
                            const send = {
                              status_transaksi: 3,
                              status_reject: null,
                              isreject: null,
                              history: `${findKlaim[i].history}, approved by ${name} at ${moment().format('DD/MM/YYYY h:mm:ss a')}`
                            }
                            const findRes = await klaim.findByPk(findKlaim[i].id)
                            if (findRes) {
                              await findRes.update(send)
                              temp.push(1)
                            }
                          }
                          if (temp.length) {
                            return response(res, 'success approve klaim', {})
                          } else {
                            return response(res, 'success approve klaim', {})
                          }
                        } else {
                          const temp = []
                          for (let i = 0; i < findKlaim.length; i++) {
                            const send = {
                              status_reject: null,
                              isreject: null,
                              history: `${findKlaim[i].history}, approved by ${name} at ${moment().format('DD/MM/YYYY h:mm:ss a')}`
                            }
                            const findRes = await klaim.findByPk(findKlaim[i].id)
                            if (findRes) {
                              await findRes.update(send)
                              temp.push(1)
                            }
                          }
                          if (temp.length) {
                            return response(res, 'success approve klaim', {})
                          } else {
                            return response(res, 'success approve klaim', {})
                          }
                        }
                      } else {
                        return response(res, 'failed approve klaim', {}, 404, false)
                      }
                    } else {
                      return response(res, 'failed approve klaim', {}, 404, false)
                    }
                  } else {
                    return response(res, `${findTtd[arr - 1].jabatan} belum approve atau telah mereject`, {}, 404, false)
                  }
                }
              } else {
                return response(res, 'failed approve klaim', {}, 404, false)
              }
            } else {
              return response(res, 'failed approve klaim', {}, 404, false)
            }
          } else {
            return response(res, 'failed approve klaim', {}, 404, false)
          }
        } else {
          return response(res, 'failed approve klaim', {}, 404, false)
        }
      } else {
        return response(res, 'failed approve klaim', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  rejectKlaim: async (req, res) => {
    try {
      const level = req.user.level
      const name = req.user.name
      const schema = joi.object({
        no: joi.string().required(),
        alasan: joi.string().required(),
        menu: joi.string().required(),
        list: joi.array(),
        type: joi.string()
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 404, false)
      } else {
        const no = results.no
        const findKlaim = await klaim.findAll({
          where: {
            no_transaksi: no
          }
        })
        if (findKlaim.length > 0) {
          if (results.type === 'verif') {
            const temp = []
            for (let i = 0; i < findKlaim.length; i++) {
              const listId = results.list
              if (listId.find(e => e === findKlaim[i].id)) {
                const send = {
                  status_reject: 1,
                  isreject: 1,
                  reason: results.alasan,
                  menu_rev: results.menu,
                  history: `${findKlaim[i].history}, reject by ${name} at ${moment().format('DD/MM/YYYY h:mm:ss a')}`
                }
                const findRes = await klaim.findByPk(findKlaim[i].id)
                if (findRes) {
                  await findRes.update(send)
                  temp.push(1)
                }
              } else {
                const send = {
                  status_reject: 1,
                  reason: results.alasan,
                  menu_rev: results.menu,
                  history: `${findKlaim[i].history}, reject by ${name} at ${moment().format('DD/MM/YYYY h:mm:ss a')}`
                }
                const findRes = await klaim.findByPk(findKlaim[i].id)
                if (findRes) {
                  await findRes.update(send)
                  temp.push(1)
                }
              }
            }
            if (temp.length) {
              return response(res, 'success reject klaim', {})
            } else {
              return response(res, 'success reject klaim', {})
            }
          } else {
            const findDepo = await depo.findOne({
              where: {
                kode_plant: findKlaim[0].kode_plant
              }
            })
            if (findDepo) {
              const findRole = await role.findOne({
                where: {
                  level: level
                }
              })
              if (findRole) {
                const findTtd = await ttd.findAll({
                  where: {
                    no_transaksi: no
                  }
                })
                if (findTtd.length > 0) {
                  let hasil = 0
                  let arr = null
                  for (let i = 0; i < findTtd.length; i++) {
                    if (findRole.name === findTtd[i].jabatan) {
                      hasil = findTtd[i].id
                      arr = i
                    }
                  }
                  if (hasil !== 0) {
                    if (arr !== findTtd.length - 1 && (findTtd[arr + 1].status !== null || findTtd[arr + 1].status === 1 || findTtd[arr + 1].status === 0)) {
                      return response(res, 'Anda tidak memiliki akses lagi untuk mengapprove', {}, 404, false)
                    } else {
                      console.log(findTtd[arr - 1])
                      if (findTtd[arr - 1].status === '1') {
                        const data = {
                          nama: name,
                          status: 0,
                          reason: results.alasan
                        }
                        const findApp = await ttd.findByPk(hasil)
                        if (findApp) {
                          const upttd = await findApp.update(data)
                          if (upttd) {
                            const findFull = await ttd.findAll({
                              where: {
                                [Op.and]: [
                                  { no_transaksi: no },
                                  { status: { [Op.like]: '%1%' } }
                                ]
                              }
                            })
                            if (findFull) {
                              const temp = []
                              for (let i = 0; i < findKlaim.length; i++) {
                                const listId = results.list
                                if (listId.find(e => e === findKlaim[i].id)) {
                                  const send = {
                                    status_reject: 1,
                                    isreject: 1,
                                    reason: results.alasan,
                                    menu_rev: results.menu,
                                    history: `${findKlaim[i].history}, reject by ${name} at ${moment().format('DD/MM/YYYY h:mm:ss a')}`
                                  }
                                  const findRes = await klaim.findByPk(findKlaim[i].id)
                                  if (findRes) {
                                    await findRes.update(send)
                                    temp.push(1)
                                  }
                                } else {
                                  const send = {
                                    status_reject: 1,
                                    reason: results.alasan,
                                    menu_rev: results.menu,
                                    history: `${findKlaim[i].history}, reject by ${name} at ${moment().format('DD/MM/YYYY h:mm:ss a')}`
                                  }
                                  const findRes = await klaim.findByPk(findKlaim[i].id)
                                  if (findRes) {
                                    await findRes.update(send)
                                    temp.push(1)
                                  }
                                }
                              }
                              if (temp.length) {
                                return response(res, 'success reject klaim', {})
                              } else {
                                return response(res, 'success reject klaim', {})
                              }
                            } else {
                              return response(res, 'failed reject klaim1', { findFull }, 404, false)
                            }
                          } else {
                            return response(res, 'failed reject klaim2', {}, 404, false)
                          }
                        } else {
                          return response(res, 'failed reject klaim3', {}, 404, false)
                        }
                      } else {
                        return response(res, `${findTtd[arr - 1].jabatan} belum approve atau telah mereject`, {}, 404, false)
                      }
                    }
                  } else {
                    return response(res, 'failed reject klaim4', {}, 404, false)
                  }
                } else {
                  return response(res, 'failed reject klaim5', {}, 404, false)
                }
              } else {
                return response(res, 'failed reject klaim6', {}, 404, false)
              }
            } else {
              return response(res, 'failed reject klaim7', {}, 404, false)
            }
          }
        } else {
          return response(res, 'failed reject klaim8', {}, 404, false)
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  appRevisi: async (req, res) => {
    try {
      const schema = joi.object({
        no: joi.string().required(),
        id: joi.number().required()
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 404, false)
      } else {
        const findId = await klaim.findByPk(results.id)
        if (findId) {
          const data = {
            isreject: 0
          }
          const updateId = await findId.update(data)
          if (updateId) {
            return response(res, 'success revisi klaim')
          } else {
            return response(res, 'failed revisi klaim', {}, 404, false)
          }
        } else {
          return response(res, 'failed revisi klaim', {}, 404, false)
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  submitRevisi: async (req, res) => {
    try {
      const name = req.user.name
      const schema = joi.object({
        no: joi.string().required()
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 404, false)
      } else {
        const findKlaim = await klaim.findAll({
          where: {
            no_transaksi: results.no
          }
        })
        if (findKlaim.length > 0) {
          const temp = []
          for (let i = 0; i < findKlaim.length; i++) {
            const send = {
              status_reject: 0,
              history: `${findKlaim[i].history}, submit revisi by ${name} at ${moment().format('DD/MM/YYYY h:mm:ss a')}`
            }
            const findRes = await klaim.findByPk(findKlaim[i].id)
            if (findRes) {
              await findRes.update(send)
              temp.push(1)
            }
          }
          if (temp.length) {
            return response(res, 'success submit revisi klaim', {})
          } else {
            return response(res, 'success submit revisi klaim', {})
          }
        } else {
          return response(res, 'failed revisi klaim', {}, 404, false)
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  updateDataVerif: async (req, res) => {
    try {
      const id = req.params.id
      const schema = joi.object({
        ppu: joi.string().required(),
        pa: joi.string().required(),
        nominal: joi.string().required()
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 404, false)
      } else {
        const findKlaim = await klaim.findByPk(id)
        if (findKlaim) {
          const data = {
            ppu: results.ppu,
            pa: results.pa,
            nominal: results.nominal
          }
          const updateKlaim = await findKlaim.update(data)
          if (updateKlaim) {
            return response(res, 'success edit verif klaim', { updateKlaim })
          } else {
            return response(res, 'failed edit verif klaim', {}, 404, false)
          }
        } else {
          return response(res, 'failed edit verif klaim', {}, 404, false)
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  submitVerif: async (req, res) => {
    try {
      const name = req.user.name
      const level = req.user.level
      const schema = joi.object({
        no: joi.string().required()
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 404, false)
      } else {
        const findKlaim = await klaim.findAll({
          where: {
            no_transaksi: results.no
          }
        })
        if (findKlaim.length > 0) {
          const temp = []
          for (let i = 0; i < findKlaim.length; i++) {
            const findRes = await klaim.findByPk(findKlaim[i].id)
            if (findRes) {
              const data = {
                status_transaksi: level === 2 ? 4 : 5,
                status_reject: null,
                isreject: null,
                history: `${findKlaim[i].history}, verifikasi ${level === 2 ? 'finance' : 'klaim'} by ${name} at ${moment().format('DD/MM/YYYY h:mm:ss a')}`
              }
              await findRes.update(data)
              temp.push(findRes)
            }
          }
          if (temp.length > 0) {
            return response(res, 'success verifikasi klaim', {})
          } else {
            return response(res, 'success verifikasi klaim', {})
          }
        } else {
          return response(res, 'failed submit verifikasi klaim', {}, 404, false)
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  }
}
