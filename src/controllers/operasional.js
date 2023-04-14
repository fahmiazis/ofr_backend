const { ops, coa, depo, docuser, approve, ttd, role, document, veriftax } = require('../models')
const joi = require('joi')
const { Op } = require('sequelize')
const response = require('../helpers/response')
const moment = require('moment')
const uploadHelper = require('../helpers/upload')
const multer = require('multer')
const { filterApp, filter, filterBayar } = require('../helpers/pagination')

module.exports = {
  addCart: async (req, res) => {
    try {
      const kode = req.user.kode
      const idTrans = req.params.id
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
        tujuan_tf: joi.string().required(),
        nama_npwp: joi.string().allow(''),
        tiperek: joi.string().allow(''),
        no_npwp: joi.string().allow(''),
        nama_ktp: joi.string().allow(''),
        no_ktp: joi.string().allow(''),
        periode: joi.string().allow(''),
        nama_vendor: joi.string().allow(''),
        alamat_vendor: joi.string().allow(''),
        penanggung_pajak: joi.string().allow(''),
        type_transaksi: joi.string().allow(''),
        no_faktur: joi.string().allow(''),
        dpp: joi.string().allow(''),
        ppn: joi.string().allow(''),
        tgl_tagihanbayar: joi.date().allow(),
        nilai_buku: joi.string().allow(''),
        nilai_utang: joi.string().allow(''),
        nilai_vendor: joi.string().allow(''),
        jenis_pph: joi.string().allow('')
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
          const result = await veriftax.findByPk(idTrans)
          if (result) {
            const findDraft = await ops.findOne({
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
              sub_coa: result.jenis_transaksi,
              nama_coa: result.gl_name,
              keterangan: results.keterangan,
              periode_awal: results.periode_awal,
              periode_akhir: results.periode_akhir,
              nilai_ajuan: results.nilai_ajuan,
              bank_tujuan: results.bank_tujuan,
              norek_ajuan: results.norek_ajuan,
              nama_tujuan: results.nama_tujuan,
              status_npwp: results.status_npwp,
              tujuan_tf: results.tujuan_tf,
              tiperek: results.tiperek,
              nama_npwp: results.nama_npwp,
              no_npwp: results.no_npwp,
              nama_ktp: results.nama_ktp,
              no_ktp: results.no_ktp,
              periode: results.periode,
              nama_vendor: results.nama_vendor,
              alamat_vendor: results.alamat_vendor,
              penanggung_pajak: results.penanggung_pajak,
              type_transaksi: results.type_transaksi,
              no_faktur: results.no_faktur,
              dpp: results.dpp,
              ppn: results.ppn,
              tgl_tagihanbayar: results.tgl_tagihanbayar,
              nilai_buku: results.nilai_buku,
              nilai_utang: results.nilai_utang,
              nilai_vendor: results.nilai_vendor,
              jenis_pph: results.jenis_pph
            }
            if (findDraft) {
              // const month = moment(results.periode_awal).format('DD MMMM YYYY')
              // const monthLast = moment(results.periode_akhir).format('DD MMMM YYYY')
              // const monthCom = moment(findDraft.periode_awal).format('DD MMMM YYYY')
              // const monthComLast = moment(findDraft.periode_akhir).format('DD MMMM YYYY')
              // if (findDraft.no_coa === results.no_coa && month === monthCom && monthLast === monthComLast) {
              if (findDraft) {
                const sendData = await ops.create(send)
                if (sendData) {
                  return response(res, 'success add ops1', { result: sendData })
                } else {
                  return response(res, 'failed add ops 7', {}, 400, false)
                }
              } else {
                return response(res, 'Pastikan program dan periode sama dalam satu pengajuan', {}, 400, false)
              }
            } else {
              const findOps = await ops.findOne({
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
              if (findOps) {
                const month = moment(results.periode_awal).format('DD MMMM YYYY')
                const monthLast = moment(results.periode_akhir).format('DD MMMM YYYY')
                const monthCom = moment(findOps.periode_awall).format('DD MMMM YYYY')
                const monthComLast = moment(findOps.periode_akhir).format('DD MMMM YYYY')
                if (month === monthCom && monthLast === monthComLast) {
                  return response(res, 'data ini telah diajukan pada pengajuan sebelumnya', { result: findOps })
                } else {
                  const sendData = await ops.create(send)
                  if (sendData) {
                    return response(res, 'success add ops2', { result: sendData })
                  } else {
                    return response(res, 'failed add ops 7', {}, 400, false)
                  }
                }
              } else {
                const sendData = await ops.create(send)
                if (sendData) {
                  return response(res, 'success add ops3', { result: sendData })
                } else {
                  return response(res, 'failed add ops 7', {}, 400, false)
                }
              }
            }
          } else {
            return response(res, 'failed add ops 3', {}, 400, false)
          }
        } else {
          return response(res, 'failed add ops 1', {}, 400, false)
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  editOps: async (req, res) => {
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
          const findDraft = await ops.findByPk(id)
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
                return response(res, 'success add ops1', { result: sendData })
              } else {
                return response(res, 'failed add ops 7', {}, 400, false)
              }
            } else {
              return response(res, 'Pastikan program dan periode sama dalam satu pengajuan', {}, 400, false)
            }
          } else {
            return response(res, 'failed add ops 7', {}, 400, false)
          }
        } else {
          return response(res, 'failed add ops 3', {}, 400, false)
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getCartOps: async (req, res) => {
    try {
      const kode = req.user.kode
      const findOps = await ops.findAll({
        where: {
          kode_plant: kode,
          [Op.or]: [
            { status_transaksi: 1 },
            { status_transaksi: null }
          ]
        }
      })
      if (findOps) {
        return response(res, 'success get cart ops', { result: findOps })
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
      const findOps = await ops.findByPk(id)
      if (findOps) {
        await findOps.destroy()
        return response(res, 'success delete cart ops', { result: findOps })
      } else {
        return response(res, 'failed get cart', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  submitOps: async (req, res) => {
    try {
      const kode = req.user.kode
      const findNo = await ops.findAll({
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
      const noOps = Math.max(...cekNo) + 1
      const findOps = await ops.findAll({
        where: {
          kode_plant: kode,
          [Op.or]: [
            { status_transaksi: null },
            { status_transaksi: 1 }
          ]
        }
      })
      if (findOps.length > 0) {
        const temp = []
        const change = noOps.toString().split('')
        const notrans = change.length === 2 ? '00' + noOps : change.length === 1 ? '000' + noOps : change.length === 3 ? '0' + noOps : noOps
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
        const noTrans = findOps[0].no_transaksi === null ? `${notrans}/${kode}/${rome}/${year}-OPS` : findOps[0].no_transaksi
        const data = {
          status_transaksi: 1,
          no_transaksi: noTrans
        }
        for (let i = 0; i < findOps.length; i++) {
          const findDraft = await ops.findByPk(findOps[i].id)
          if (findDraft) {
            const upOps = await findDraft.update(data)
            if (upOps) {
              temp.push(1)
            }
          }
        }
        if (temp.length) {
          return response(res, 'success submit cart', { noops: noTrans })
        } else {
          return response(res, 'failed submit cart', { noops: noTrans })
        }
      } else {
        return response(res, 'failed submit cart', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  submitOpsFinal: async (req, res) => {
    try {
      const { no } = req.body
      const kode = req.user.kode
      const findOps = await ops.findAll({
        where: {
          no_transaksi: no,
          kode_plant: kode,
          status_transaksi: 1
        }
      })
      if (findOps) {
        const temp = []
        for (let i = 0; i < findOps.length; i++) {
          const data = {
            status_transaksi: 2,
            history: `submit pengajuan ops by ${kode} at ${moment().format('DD/MM/YYYY h:mm:ss a')}`,
            start_ops: moment()
          }
          const findData = await ops.findByPk(findOps[i].id)
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
          divisi: 'ops',
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
              { jenis: 'Operasional' },
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
            { jenis: 'Operasional' },
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
  getOps: async (req, res) => {
    try {
      const level = req.user.level
      const kode = req.user.kode
      const name = req.user.name
      const role = req.user.role
      const { status, reject, menu, type, category, data } = req.query
      const statTrans = status === 'undefined' || status === null ? 2 : status
      const statRej = reject === 'undefined' ? null : reject
      const statMenu = menu === 'undefined' ? null : menu
      const statData = data === 'undefined' ? null : data
      if (level === 5) {
        const findOps = await ops.findAll({
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
            },
            {
              model: depo,
              as: 'depo'
            }
          ]
        })
        const data = []
        findOps.map(x => {
          return (
            data.push(x.no_transaksi)
          )
        })
        const set = new Set(data)
        const noDis = [...set]
        if (findOps) {
          const newOps = category === 'verif' ? filter(type, findOps, noDis, statData, role) : filterApp(type, findOps, noDis, role)
          return response(res, 'success get data ops', { result: findOps, noDis, newOps })
        } else {
          return response(res, 'success get data ops', { result: findOps, noDis, newOps: [] })
        }
      } else if (level === 10 || level === 11 || level === 12 || level === 2 || level === 7 || level === 8 || level === 9) {
        const findDepo = await depo.findAll({
          where: {
            [Op.or]: [
              { bm: level === 10 ? name : 'undefined' },
              { om: level === 11 ? name : 'undefined' },
              { nom: level === 12 ? name : 'undefined' },
              { pic_1: level === 2 ? name : 'undefined' },
              { pic_2: level === 7 ? name : 'undefined' },
              { pic_3: level === 8 ? name : 'undefined' },
              { pic_4: level === 9 ? name : 'undefined' }
            ]
          }
        })
        if (findDepo.length) {
          const hasil = []
          for (let i = 0; i < findDepo.length; i++) {
            const result = await ops.findAll({
              where: {
                kode_plant: findDepo[i].kode_plant,
                [Op.and]: [
                  statTrans === 'all' ? { [Op.not]: { status_transaksi: null } } : { status_transaksi: statTrans },
                  statRej === 'all' ? { [Op.not]: { id: null } } : { status_reject: statRej },
                  statMenu === 'all' ? { [Op.not]: { id: null } } : { menu_rev: { [Op.like]: `%${statMenu}%` } },
                  category === 'ajuan bayar' ? { [Op.not]: { no_pembayaran: null } } : { [Op.not]: { id: null } }
                ]
              },
              order: [
                ['id', 'ASC'],
                [{ model: ttd, as: 'appForm' }, 'id', 'DESC'],
                [{ model: ttd, as: 'appList' }, 'id', 'DESC']
              ],
              include: [
                {
                  model: ttd,
                  as: 'appForm'
                },
                {
                  model: ttd,
                  as: 'appList'
                },
                {
                  model: depo,
                  as: 'depo'
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
                data.push(category === 'ajuan bayar' ? x.no_pembayaran : x.no_transaksi)
              )
            })
            const set = new Set(data)
            const noDis = [...set]
            const result = hasil
            const newOps = category === 'ajuan bayar' ? filterBayar(type, result, noDis, statTrans, role) : category === 'verif' ? filter(type, result, noDis, statData, role) : filterApp(type, result, noDis, role)
            return response(res, 'success get ops', { result, noDis, findDepo, newOps })
          } else {
            const result = hasil
            const noDis = []
            return response(res, 'success get ops', { result, noDis, findDepo, newOps: [] })
          }
        } else {
          return response(res, 'failed get ops', {}, 400, false)
        }
      } else {
        const findOps = await ops.findAll({
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
            },
            {
              model: depo,
              as: 'depo'
            }
          ]
        })
        const data = []
        findOps.map(x => {
          return (
            data.push(x.no_transaksi)
          )
        })
        const set = new Set(data)
        const noDis = [...set]
        if (findOps) {
          const newOps = category === 'verif' ? filter(type, findOps, noDis, statData, role) : filterApp(type, findOps, noDis, role)
          return response(res, 'success get data ops', { result: findOps, noDis, newOps })
        } else {
          return response(res, 'success get data ops', { result: findOps, noDis })
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
      const statData = 'undefined'
      if (level === 5) {
        const findOps = await ops.findAll({
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
        findOps.map(x => {
          return (
            data.push(x.no_transaksi)
          )
        })
        const set = new Set(data)
        const noDis = [...set]
        if (findOps) {
          const newOps = category === 'verif' ? filter(type, findOps, noDis, statData, role) : filterApp(type, findOps, noDis, role)
          return response(res, 'success get data ops', { result: findOps, noDis, newOps })
        } else {
          return response(res, 'success get data ops', { result: findOps, noDis, newOps: [] })
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
            const result = await ops.findAll({
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
            const newOps = category === 'verif' ? filter(type, result, noDis, role) : filterApp(type, result, noDis, role)
            return response(res, 'success get ops', { result, noDis, findDepo, newOps })
          } else {
            const result = hasil
            const noDis = []
            return response(res, 'success get ops', { result, noDis, findDepo, newOps: [] })
          }
        } else {
          return response(res, 'failed get ops', {}, 400, false)
        }
      } else {
        const findOps = await ops.findAll({
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
        findOps.map(x => {
          return (
            data.push(x.no_transaksi)
          )
        })
        const set = new Set(data)
        const noDis = [...set]
        if (findOps) {
          const newOps = category === 'verif' ? filter(type, findOps, noDis, statData, role) : filterApp(type, findOps, noDis, role)
          return response(res, 'success get data ops', { result: findOps, noDis, newOps })
        } else {
          return response(res, 'success get data ops', { result: findOps, noDis })
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getDetailOps: async (req, res) => {
    try {
      const { no, tipe } = req.body
      if (tipe === 'ajuan bayar') {
        const findOps = await ops.findAll({
          where: {
            no_pembayaran: no
          },
          order: [
            ['id', 'ASC'],
            [{ model: ttd, as: 'appForm' }, 'id', 'DESC'],
            [{ model: ttd, as: 'appList' }, 'id', 'DESC']
          ],
          include: [
            {
              model: ttd,
              as: 'appForm'
            },
            {
              model: ttd,
              as: 'appList'
            },
            {
              model: depo,
              as: 'depo'
            }
          ]
        })
        if (findOps) {
          return response(res, 'success get dokumen', { result: findOps })
        } else {
          return response(res, 'failed get dokumen', { result: [] })
        }
      } else {
        const findOps = await ops.findAll({
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
            },
            {
              model: depo,
              as: 'depo'
            }
          ]
        })
        if (findOps) {
          return response(res, 'success get dokumen', { result: findOps })
        } else {
          return response(res, 'failed get dokumen', { result: [] })
        }
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
        const findOps = await ops.findOne({
          where: {
            no_transaksi: no
          }
        })
        if (findOps) {
          const findDepo = await depo.findOne({
            where: {
              kode_plant: findOps.kode_plant
            }
          })
          if (findDepo) {
            const findApp = await approve.findAll({
              where: {
                nama_approve: 'Pengajuan Ops'
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
  getApprovalList: async (req, res) => {
    try {
      const { no } = req.body
      const findTtd = await ttd.findAll({
        where: {
          no_transaksi: no
        }
      })
      if (findTtd.length > 0) {
        const pembuat = []
        const mengetahui = []
        const penyetuju = []
        for (let i = 0; i < findTtd.length; i++) {
          if (findTtd[i].sebagai === 'pembuat') {
            pembuat.push(findTtd[i])
          } else if (findTtd[i].sebagai === 'mengetahui') {
            mengetahui.push(findTtd[i])
          } else if (findTtd[i].sebagai === 'penyetuju') {
            penyetuju.push(findTtd[i])
          }
        }
        return response(res, 'succes get approval', { result: { pembuat, penyetuju, mengetahui }, findTtd })
      } else {
        const findOps = await ops.findOne({
          where: {
            no_pembayaran: no
          }
        })
        if (findOps) {
          const findDepo = await depo.findOne({
            where: {
              kode_plant: findOps.kode_plant
            }
          })
          if (findDepo) {
            const findApp = await approve.findAll({
              where: {
                nama_approve: 'Ajuan Bayar'
              }
            })
            if (findApp.length > 0) {
              const temp = []
              for (let i = 0; i < findApp.length; i++) {
                const data = {
                  jabatan: findApp[i].jabatan,
                  nama: i === 0 ? findDepo.pic_1 : null,
                  status: i === 0 ? 1 : null,
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
                  const mengetahui = []
                  for (let i = 0; i < findTtd.length; i++) {
                    if (findTtd[i].sebagai === 'pembuat') {
                      pembuat.push(findTtd[i])
                    } else if (findTtd[i].sebagai === 'mengetahui') {
                      mengetahui.push(findTtd[i])
                    } else if (findTtd[i].sebagai === 'penyetuju') {
                      penyetuju.push(findTtd[i])
                    }
                  }
                  return response(res, 'succes get approval', { result: { pembuat, penyetuju, mengetahui }, findTtd })
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
  approveOps: async (req, res) => {
    try {
      const level = req.user.level
      const name = req.user.name
      const { no } = req.body
      const findOps = await ops.findAll({
        where: {
          no_transaksi: no
        }
      })
      if (findOps.length > 0) {
        const findDepo = await depo.findOne({
          where: {
            kode_plant: findOps[0].kode_plant
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
                          for (let i = 0; i < findOps.length; i++) {
                            const send = {
                              status_transaksi: 3,
                              status_reject: null,
                              isreject: null,
                              history: `${findOps[i].history}, approved by ${name} at ${moment().format('DD/MM/YYYY h:mm:ss a')}`
                            }
                            const findRes = await ops.findByPk(findOps[i].id)
                            if (findRes) {
                              await findRes.update(send)
                              temp.push(1)
                            }
                          }
                          if (temp.length) {
                            return response(res, 'success approve ops', {})
                          } else {
                            return response(res, 'success approve ops', {})
                          }
                        } else {
                          const temp = []
                          for (let i = 0; i < findOps.length; i++) {
                            const send = {
                              status_reject: null,
                              isreject: null,
                              history: `${findOps[i].history}, approved by ${name} at ${moment().format('DD/MM/YYYY h:mm:ss a')}`
                            }
                            const findRes = await ops.findByPk(findOps[i].id)
                            if (findRes) {
                              await findRes.update(send)
                              temp.push(1)
                            }
                          }
                          if (temp.length) {
                            return response(res, 'success approve ops', {})
                          } else {
                            return response(res, 'success approve ops', {})
                          }
                        }
                      } else {
                        return response(res, 'failed approve ops', {}, 404, false)
                      }
                    } else {
                      return response(res, 'failed approve ops', {}, 404, false)
                    }
                  } else {
                    return response(res, `${findTtd[arr - 1].jabatan} belum approve atau telah mereject`, {}, 404, false)
                  }
                }
              } else {
                return response(res, 'failed approve ops', {}, 404, false)
              }
            } else {
              return response(res, 'failed approve ops', {}, 404, false)
            }
          } else {
            return response(res, 'failed approve ops', {}, 404, false)
          }
        } else {
          return response(res, 'failed approve ops', {}, 404, false)
        }
      } else {
        return response(res, 'failed approve ops', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  approveListOps: async (req, res) => {
    try {
      const level = req.user.level
      const name = req.user.name
      const { no } = req.body
      const findOps = await ops.findAll({
        where: {
          no_pembayaran: no
        }
      })
      if (findOps.length > 0) {
        const findDepo = await depo.findOne({
          where: {
            kode_plant: findOps[0].kode_plant
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
                          for (let i = 0; i < findOps.length; i++) {
                            const send = {
                              status_transaksi: 7,
                              status_reject: null,
                              isreject: null,
                              history: `${findOps[i].history}, approved by ${name} at ${moment().format('DD/MM/YYYY h:mm:ss a')}`
                            }
                            const findRes = await ops.findByPk(findOps[i].id)
                            if (findRes) {
                              await findRes.update(send)
                              temp.push(1)
                            }
                          }
                          if (temp.length) {
                            return response(res, 'success approve ops', {})
                          } else {
                            return response(res, 'success approve ops', {})
                          }
                        } else {
                          const temp = []
                          for (let i = 0; i < findOps.length; i++) {
                            const send = {
                              status_reject: null,
                              isreject: null,
                              history: `${findOps[i].history}, approved by ${name} at ${moment().format('DD/MM/YYYY h:mm:ss a')}`
                            }
                            const findRes = await ops.findByPk(findOps[i].id)
                            if (findRes) {
                              await findRes.update(send)
                              temp.push(1)
                            }
                          }
                          if (temp.length) {
                            return response(res, 'success approve ops', {})
                          } else {
                            return response(res, 'success approve ops', {})
                          }
                        }
                      } else {
                        return response(res, 'failed approve ops1', {}, 404, false)
                      }
                    } else {
                      return response(res, 'failed approve ops2', {}, 404, false)
                    }
                  } else {
                    return response(res, `${findTtd[arr - 1].jabatan} belum approve atau telah mereject`, {}, 404, false)
                  }
                }
              } else {
                return response(res, 'failed approve ops3', {}, 404, false)
              }
            } else {
              return response(res, 'failed approve ops4', {}, 404, false)
            }
          } else {
            return response(res, 'failed approve ops5', {}, 404, false)
          }
        } else {
          return response(res, 'failed approve ops6', {}, 404, false)
        }
      } else {
        return response(res, 'failed approve ops7', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  rejectOps: async (req, res) => {
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
        const findOps = await ops.findAll({
          where: {
            no_transaksi: no
          }
        })
        if (findOps.length > 0) {
          if (results.type === 'verif') {
            const temp = []
            for (let i = 0; i < findOps.length; i++) {
              const listId = results.list
              if (listId.find(e => e === findOps[i].id)) {
                const send = {
                  status_reject: 1,
                  isreject: 1,
                  reason: results.alasan,
                  menu_rev: results.menu,
                  history: `${findOps[i].history}, reject by ${name} at ${moment().format('DD/MM/YYYY h:mm:ss a')}; reason: ${results.alasan}`
                }
                const findRes = await ops.findByPk(findOps[i].id)
                if (findRes) {
                  await findRes.update(send)
                  temp.push(1)
                }
              } else {
                const send = {
                  status_reject: 1,
                  reason: results.alasan,
                  menu_rev: results.menu,
                  history: `${findOps[i].history}, reject by ${name} at ${moment().format('DD/MM/YYYY h:mm:ss a')}; reason: ${results.alasan}`
                }
                const findRes = await ops.findByPk(findOps[i].id)
                if (findRes) {
                  await findRes.update(send)
                  temp.push(1)
                }
              }
            }
            if (temp.length) {
              return response(res, 'success reject ops', {})
            } else {
              return response(res, 'success reject ops', {})
            }
          } else {
            const findDepo = await depo.findOne({
              where: {
                kode_plant: findOps[0].kode_plant
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
                      return response(res, 'Anda tidak memiliki akses lagi untuk mereject', {}, 404, false)
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
                              for (let i = 0; i < findOps.length; i++) {
                                const listId = results.list
                                if (listId.find(e => e === findOps[i].id)) {
                                  const send = {
                                    status_reject: 1,
                                    isreject: 1,
                                    reason: results.alasan,
                                    menu_rev: results.menu,
                                    history: `${findOps[i].history}, reject by ${name} at ${moment().format('DD/MM/YYYY h:mm:ss a')}; reason: ${results.alasan}`
                                  }
                                  const findRes = await ops.findByPk(findOps[i].id)
                                  if (findRes) {
                                    await findRes.update(send)
                                    temp.push(1)
                                  }
                                } else {
                                  const send = {
                                    status_reject: 1,
                                    reason: results.alasan,
                                    menu_rev: results.menu,
                                    history: `${findOps[i].history}, reject by ${name} at ${moment().format('DD/MM/YYYY h:mm:ss a')}; reason: ${results.alasan}`
                                  }
                                  const findRes = await ops.findByPk(findOps[i].id)
                                  if (findRes) {
                                    await findRes.update(send)
                                    temp.push(1)
                                  }
                                }
                              }
                              if (temp.length) {
                                return response(res, 'success reject ops', {})
                              } else {
                                return response(res, 'success reject ops', {})
                              }
                            } else {
                              return response(res, 'failed reject ops1', { findFull }, 404, false)
                            }
                          } else {
                            return response(res, 'failed reject ops2', {}, 404, false)
                          }
                        } else {
                          return response(res, 'failed reject ops3', {}, 404, false)
                        }
                      } else {
                        return response(res, `${findTtd[arr - 1].jabatan} belum approve atau telah mereject`, {}, 404, false)
                      }
                    }
                  } else {
                    return response(res, 'failed reject ops4', {}, 404, false)
                  }
                } else {
                  return response(res, 'failed reject ops5', {}, 404, false)
                }
              } else {
                return response(res, 'failed reject ops6', {}, 404, false)
              }
            } else {
              return response(res, 'failed reject ops7', {}, 404, false)
            }
          }
        } else {
          return response(res, 'failed reject ops8', {}, 404, false)
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  rejectListOps: async (req, res) => {
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
        const findOps = await ops.findAll({
          where: {
            no_pembayaran: no
          }
        })
        if (findOps.length > 0) {
          const findDepo = await depo.findOne({
            where: {
              kode_plant: findOps[0].kode_plant
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
                    return response(res, 'Anda tidak memiliki akses lagi untuk mereject', {}, 404, false)
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
                            for (let i = 0; i < findOps.length; i++) {
                              const listId = results.list
                              if (listId.find(e => e === findOps[i].id)) {
                                const send = {
                                  status_reject: 1,
                                  isreject: 1,
                                  reason: results.alasan,
                                  menu_rev: results.menu,
                                  history: `${findOps[i].history}, reject ajuan bayar by ${name} at ${moment().format('DD/MM/YYYY h:mm:ss a')}; reason: ${results.alasan}`
                                }
                                const findRes = await ops.findByPk(findOps[i].id)
                                if (findRes) {
                                  await findRes.update(send)
                                  temp.push(1)
                                }
                              } else {
                                const send = {
                                  status_reject: 1,
                                  reason: results.alasan,
                                  menu_rev: results.menu,
                                  history: `${findOps[i].history}, reject ajuan bayar by ${name} at ${moment().format('DD/MM/YYYY h:mm:ss a')}; reason: ${results.alasan}`
                                }
                                const findRes = await ops.findByPk(findOps[i].id)
                                if (findRes) {
                                  await findRes.update(send)
                                  temp.push(1)
                                }
                              }
                            }
                            if (temp.length) {
                              return response(res, 'success reject ops', {})
                            } else {
                              return response(res, 'success reject ops', {})
                            }
                          } else {
                            return response(res, 'failed reject ops1', { findFull }, 404, false)
                          }
                        } else {
                          return response(res, 'failed reject ops2', {}, 404, false)
                        }
                      } else {
                        return response(res, 'failed reject ops3', {}, 404, false)
                      }
                    } else {
                      return response(res, `${findTtd[arr - 1].jabatan} belum approve atau telah mereject`, {}, 404, false)
                    }
                  }
                } else {
                  return response(res, 'failed reject ops4', {}, 404, false)
                }
              } else {
                return response(res, 'failed reject ops5', {}, 404, false)
              }
            } else {
              return response(res, 'failed reject ops6', {}, 404, false)
            }
          } else {
            return response(res, 'failed reject ops7', {}, 404, false)
          }
        } else {
          return response(res, 'failed reject ops8', {}, 404, false)
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
        const findId = await ops.findByPk(results.id)
        if (findId) {
          const data = {
            isreject: 0
          }
          const updateId = await findId.update(data)
          if (updateId) {
            return response(res, 'success revisi ops')
          } else {
            return response(res, 'failed revisi ops', {}, 404, false)
          }
        } else {
          return response(res, 'failed revisi ops', {}, 404, false)
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
        const findOps = await ops.findAll({
          where: {
            no_transaksi: results.no
          }
        })
        if (findOps.length > 0) {
          const temp = []
          for (let i = 0; i < findOps.length; i++) {
            const send = {
              status_reject: 0,
              history: `${findOps[i].history}, submit revisi by ${name} at ${moment().format('DD/MM/YYYY h:mm:ss a')}`
            }
            const findRes = await ops.findByPk(findOps[i].id)
            if (findRes) {
              await findRes.update(send)
              temp.push(1)
            }
          }
          if (temp.length) {
            return response(res, 'success submit revisi ops', {})
          } else {
            return response(res, 'success submit revisi ops', {})
          }
        } else {
          return response(res, 'failed revisi ops', {}, 404, false)
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
        dpp: joi.string().allow(''),
        ppn: joi.string().required(),
        nilai_utang: joi.string().required()
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 404, false)
      } else {
        const findOps = await ops.findByPk(id)
        if (findOps) {
          const data = {
            dpp: results.dpp,
            ppn: results.ppn,
            nilai_utang: results.nilai_utang
          }
          const updateOps = await findOps.update(data)
          if (updateOps) {
            return response(res, 'success edit verif ops', { updateOps })
          } else {
            return response(res, 'failed edit verif ops', {}, 404, false)
          }
        } else {
          return response(res, 'failed edit verif ops', {}, 404, false)
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
        const findOps = await ops.findAll({
          where: {
            no_transaksi: results.no
          }
        })
        if (findOps.length > 0) {
          const temp = []
          for (let i = 0; i < findOps.length; i++) {
            const findRes = await ops.findByPk(findOps[i].id)
            if (findRes) {
              const data = {
                status_transaksi: level === 2 ? 4 : 5,
                status_reject: null,
                isreject: null,
                history: `${findOps[i].history}, verifikasi ${level === 2 ? 'finance' : 'tax'} by ${name} at ${moment().format('DD/MM/YYYY h:mm:ss a')}`
              }
              await findRes.update(data)
              temp.push(findRes)
            }
          }
          if (temp.length > 0) {
            return response(res, 'success verifikasi ops', {})
          } else {
            return response(res, 'success verifikasi ops', {})
          }
        } else {
          return response(res, 'failed submit verifikasi ops', {}, 404, false)
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  submitAjuanBayar: async (req, res) => {
    try {
      // const level = req.user.level
      const name = req.user.name
      const schema = joi.object({
        no_transfer: joi.string().required(),
        tgl_transfer: joi.string().required(),
        list: joi.array()
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 404, false)
      } else {
        const findNo = await ttd.findOne({
          where: {
            no_transaksi: results.no_transfer
          }
        })
        if (findNo) {
          return response(res, 'no transaksi telah terdaftar', {}, 404, false)
        } else {
          const temp = []
          const list = results.list
          for (let i = 0; i < list.length; i++) {
            const findOps = await ops.findAll({
              where: {
                no_transaksi: list[i]
              }
            })
            if (findOps.length > 0) {
              for (let j = 0; j < findOps.length; j++) {
                const send = {
                  status_transaksi: 6,
                  no_pembayaran: results.no_transfer,
                  tanggal_transfer: results.tgl_transfer,
                  history: `${findOps[j].history}, submit ajuan bayar by ${name} at ${moment().format('DD/MM/YYYY h:mm:ss a')}`
                }
                const findRes = await ops.findByPk(findOps[j].id)
                if (findRes) {
                  await findRes.update(send)
                  temp.push(1)
                }
              }
            }
          }
          if (temp.length) {
            return response(res, 'success submit ajuan bayar ops', {})
          } else {
            return response(res, 'success submit ajuan bayar ops', {})
          }
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  }
}
