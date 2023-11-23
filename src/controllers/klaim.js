const { klaim, coa, depo, finance, docuser, approve, ttd, role, document, reservoir, picklaim, spvklaim, kliring } = require('../models')
const joi = require('joi')
const { Op } = require('sequelize')
const response = require('../helpers/response')
const moment = require('moment')
const uploadHelper = require('../helpers/upload')
const readXlsxFile = require('read-excel-file/node')
const multer = require('multer')
const { filterApp, filter, filterBayar } = require('../helpers/pagination')
const uploadMaster = require('../helpers/uploadMaster')
const fs = require('fs')
const access = [10, 11, 12, 2, 7, 8, 9]
const accKlaim = [3, 13, 23]

module.exports = {
  addCart: async (req, res) => {
    try {
      const kode = req.user.kode
      // const name = req.user.fullname
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
        no_surkom: joi.string().required(),
        nama_program: joi.string().required(),
        dn_area: joi.string().required()
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 404, false)
      } else {
        const findDepo = await finance.findAll({
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
                [Op.or]: [
                  { status_transaksi: null },
                  { status_transaksi: 1 }
                ]
              }
            })
            const send = {
              kode_plant: findDepo[0].kode_plant,
              area: findDepo[0].area,
              cost_center: findDepo[0].profit_center,
              no_coa: results.no_coa,
              nama_coa: result.nama_coa,
              sub_coa: result.nama_subcoa,
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
              no_surkom: results.no_surkom,
              nama_program: results.nama_program,
              dn_area: results.dn_area
            }
            if (findDraft) {
              return response(res, 'Maximal 1 data dalam satu ajuan klaim', {}, 400, false)
              // const month = moment(results.periode_awal).format('DD MMMM YYYY')
              // const monthLast = moment(results.periode_akhir).format('DD MMMM YYYY')
              // const monthCom = moment(findDraft.periode_awal).format('DD MMMM YYYY')
              // const monthComLast = moment(findDraft.periode_akhir).format('DD MMMM YYYY')
              // if (findDraft.no_coa === results.no_coa && month === monthCom && monthLast === monthComLast) {

              // nonaktif
              // if (findDraft) {
              //   const sendData = await klaim.create(send)
              //   if (sendData) {
              //     return response(res, 'success add klaim1', { result: sendData })
              //   } else {
              //     return response(res, 'failed add klaim 7', {}, 400, false)
              //   }
              // } else {
              //   return response(res, 'Pastikan program dan periode sama dalam satu pengajuan', {}, 400, false)
              // }
            } else {
              const findKlaim = await klaim.findOne({
                where: {
                  no_coa: results.no_coa,
                  kode_plant: kode,
                  [Op.not]: [
                    { status_transaksi: null },
                    { status_transaksi: 0 }
                    // { status_transaksi: 8 }
                  ]
                }
              })
              if (findKlaim) {
                const month = moment(results.periode_awal).format('DD MMMM YYYY')
                const monthLast = moment(results.periode_akhir).format('DD MMMM YYYY')
                const monthCom = moment(findKlaim.periode_awall).format('DD MMMM YYYY')
                const monthComLast = moment(findKlaim.periode_akhir).format('DD MMMM YYYY')
                if (month === monthCom && monthLast === monthComLast && results.nama_subcoa === findKlaim.nama_subcoa) {
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
      const kode = req.user.kode
      const id = req.params.id
      // const name = req.user.fullname
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
        no_surkom: joi.string().required(),
        nama_program: joi.string().required(),
        dn_area: joi.string().required()
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 404, false)
      } else {
        const findDepo = await finance.findAll({
          where: {
            kode_plant: kode
          }
        })
        const findUpdate = await klaim.findByPk(id)
        if (findDepo.length > 0 && findUpdate) {
          const result = await coa.findOne({
            where: {
              no_coa: results.no_coa
            }
          })
          if (result) {
            const findDraft = await klaim.findOne({
              where: {
                kode_plant: kode,
                [Op.or]: [
                  { status_transaksi: null },
                  { status_transaksi: 1 }
                ],
                [Op.not]: [
                  { id: id }
                ]
              }
            })
            const send = {
              kode_plant: findDepo[0].kode_plant,
              area: findDepo[0].area,
              cost_center: findDepo[0].profit_center,
              no_coa: results.no_coa,
              nama_coa: result.nama_coa,
              sub_coa: result.nama_subcoa,
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
              no_surkom: results.no_surkom,
              nama_program: results.nama_program,
              dn_area: results.dn_area
            }
            if (findDraft) {
              return response(res, 'Maximal 1 data dalam satu ajuan klaim', {}, 400, false)
              // const month = moment(results.periode_awal).format('DD MMMM YYYY')
              // const monthLast = moment(results.periode_akhir).format('DD MMMM YYYY')
              // const monthCom = moment(findDraft.periode_awal).format('DD MMMM YYYY')
              // const monthComLast = moment(findDraft.periode_akhir).format('DD MMMM YYYY')
              // if (findDraft.no_coa === results.no_coa && month === monthCom && monthLast === monthComLast) {

              // nonaktif
              // if (findDraft) {
              //   const sendData = await klaim.create(send)
              //   if (sendData) {
              //     return response(res, 'success add klaim1', { result: sendData })
              //   } else {
              //     return response(res, 'failed add klaim 7', {}, 400, false)
              //   }
              // } else {
              //   return response(res, 'Pastikan program dan periode sama dalam satu pengajuan', {}, 400, false)
              // }
            } else {
              const findKlaim = await klaim.findOne({
                where: {
                  no_coa: results.no_coa,
                  kode_plant: kode,
                  [Op.not]: [
                    { status_transaksi: null },
                    { status_transaksi: 0 },
                    { status_transaksi: 1 }
                    // { status_transaksi: 8 }
                  ]
                }
              })
              if (findKlaim) {
                const month = moment(results.periode_awal).format('DD MMMM YYYY')
                const monthLast = moment(results.periode_akhir).format('DD MMMM YYYY')
                const monthCom = moment(findKlaim.periode_awall).format('DD MMMM YYYY')
                const monthComLast = moment(findKlaim.periode_akhir).format('DD MMMM YYYY')
                if (month === monthCom && monthLast === monthComLast && results.nama_subcoa === findKlaim.nama_subcoa) {
                  return response(res, 'data ini telah diajukan pada pengajuan sebelumnya', { result: findKlaim })
                } else {
                  const sendData = await findUpdate.update(send)
                  if (sendData) {
                    return response(res, 'success add klaim2', { result: sendData })
                  } else {
                    return response(res, 'failed add klaim 7', {}, 400, false)
                  }
                }
              } else {
                const sendData = await findUpdate.update(send)
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
      const timeV1 = moment().startOf('month')
      const timeV2 = moment().endOf('month').add(1, 'd')
      const kode = req.user.kode
      const findNo = await reservoir.findAll({
        where: {
          transaksi: 'klaim',
          tipe: 'area',
          createdAt: {
            [Op.gte]: timeV1,
            [Op.lt]: timeV2
          }
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
        const tempData = findKlaim.find(({no_transaksi}) => no_transaksi !== null) // eslint-disable-line
        const cekData = tempData === undefined ? 'ya' : 'no'
        const noTrans = `${notrans}/${kode}/${rome}/${year}-KLM`
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
          if (cekData === 'no') {
            const findDoc = await docuser.findAll({
              where: {
                no_transaksi: tempData.no_transaksi
              }
            })
            if (findDoc.length > 0) {
              const tempDoc = []
              for (let i = 0; i < findDoc.length; i++) {
                const data = {
                  no_transaksi: noTrans
                }
                const upDoc = await docuser.findByPk(findDoc[i].id)
                if (upDoc) {
                  await upDoc.update(data)
                  tempDoc.push(upDoc)
                }
              }
              if (tempDoc) {
                const findReser = await reservoir.findOne({
                  where: {
                    no_transaksi: tempData.no_transaksi
                  }
                })
                const findNewReser = await reservoir.findOne({
                  where: {
                    no_transaksi: noTrans
                  }
                })
                const upDataReser = {
                  status: 'expired'
                }
                const creDataReser = {
                  no_transaksi: noTrans,
                  kode_plant: kode,
                  transaksi: 'klaim',
                  tipe: 'area',
                  status: 'delayed'
                }
                if (findReser && !findNewReser) {
                  await findReser.update(upDataReser)
                  await reservoir.create(creDataReser)
                  return response(res, 'success submit cart', { noklaim: noTrans })
                } else {
                  return response(res, 'success submit cart', { noklaim: noTrans })
                }
              } else {
                return response(res, 'success submit cart', { noklaim: noTrans })
              }
            } else {
              return response(res, 'success submit cart', { noklaim: noTrans })
            }
          } else {
            const findNewReser = await reservoir.findOne({
              where: {
                no_transaksi: noTrans
              }
            })
            if (findNewReser) {
              return response(res, 'success submit cart', { noklaim: noTrans })
            } else {
              const creDataReser = {
                no_transaksi: noTrans,
                kode_plant: kode,
                transaksi: 'klaim',
                tipe: 'area',
                status: 'delayed'
              }
              await reservoir.create(creDataReser)
              return response(res, 'success submit cart', { noklaim: noTrans })
            }
          }
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
          const findNewReser = await reservoir.findOne({
            where: {
              no_transaksi: no
            }
          })
          if (findNewReser) {
            const upDataReser = {
              status: 'used',
              createdAt: moment()
            }
            await findNewReser.update(upDataReser)
            return response(res, 'success submit cart')
          } else {
            return response(res, 'success submit cart')
          }
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
    const level = req.user.level
    const name = req.user.fullname
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
        const make = await docuser.findByPk(id)
        if (make) {
          const send = {
            path: dokumen,
            divisi: 'klaim',
            history: req.file.originalname,
            jenis_dok: 'lampiran',
            status: `${make.status}, level ${level}; upload document; by ${name} at ${moment().format('DD/MM/YYYY h:mm:ss a')};`
          }
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
      const name = req.user.fullname
      const role = req.user.role
      const { status, reject, menu, type, category, data, time1, time2, search } = req.query
      const searchValue = search || ''
      const statTrans = status === 'undefined' || status === null ? 2 : status
      const statRej = reject === 'undefined' ? null : reject
      const statMenu = menu === 'undefined' ? null : menu
      const statData = data === 'undefined' ? null : data
      const timeVal1 = time1 === 'undefined' ? 'all' : time1
      const timeVal2 = time2 === 'undefined' ? 'all' : time2
      const timeV1 = moment(timeVal1)
      const timeV2 = timeVal1 !== 'all' && timeVal1 === timeVal2 ? moment(timeVal2).add(1, 'd') : moment(timeVal2).add(1, 'd')
      if (level === 5) {
        const findKlaim = await klaim.findAll({
          where: {
            kode_plant: kode,
            [Op.and]: [
              statTrans === 'all' ? { [Op.not]: { id: null } } : { status_transaksi: statTrans },
              statRej === 'all' ? { [Op.not]: { id: null } } : { status_reject: statRej },
              statMenu === 'all' ? { [Op.not]: { id: null } } : { menu_rev: { [Op.like]: `%${statMenu}%` } },
              timeVal1 === 'all'
                ? { [Op.not]: { id: null } }
                : {
                    start_klaim: {
                      [Op.gte]: timeV1,
                      [Op.lt]: timeV2
                    }
                  },
              { [Op.not]: { status_transaksi: null } },
              { [Op.not]: { status_transaksi: 1 } },
              category === 'revisi' ? { [Op.not]: { status_transaksi: 0 } } : { [Op.not]: { id: null } }
            ],
            [Op.or]: [
              { nama_tujuan: { [Op.like]: `%${searchValue}%` } },
              { nama_ktp: { [Op.like]: `%${searchValue}%` } },
              { nama_npwp: { [Op.like]: `%${searchValue}%` } },
              { no_ktp: { [Op.like]: `%${searchValue}%` } },
              { no_npwp: { [Op.like]: `%${searchValue}%` } },
              { no_surkom: { [Op.like]: `%${searchValue}%` } },
              { nama_program: { [Op.like]: `%${searchValue}%` } },
              { area: { [Op.like]: `%${searchValue}%` } },
              { cost_center: { [Op.like]: `%${searchValue}%` } },
              { no_coa: { [Op.like]: `%${searchValue}%` } },
              { sub_coa: { [Op.like]: `%${searchValue}%` } },
              { nama_coa: { [Op.like]: `%${searchValue}%` } },
              { keterangan: { [Op.like]: `%${searchValue}%` } },
              { no_transaksi: { [Op.like]: `%${searchValue}%` } },
              { no_pembayaran: { [Op.like]: `%${searchValue}%` } }
            ],
            [Op.not]: [
              { status_transaksi: 1 }
            ]
          },
          order: [
            ['start_klaim', 'DESC'],
            [{ model: ttd, as: 'appForm' }, 'id', 'DESC']
          ],
          include: [
            {
              model: ttd,
              as: 'appForm'
            },
            {
              model: finance,
              as: 'depo'
            },
            {
              model: depo,
              as: 'scarea'
            },
            {
              model: picklaim,
              as: 'picklaim'
            },
            {
              model: kliring,
              as: 'kliring'
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
          const newKlaim = category === 'verif' ? filter(type, findKlaim, noDis, statData, role) : filterApp(type, findKlaim, noDis, role)
          return response(res, 'success get data klaim', { result: findKlaim, noDis, newKlaim })
        } else {
          return response(res, 'success get data klaim', { result: findKlaim, noDis, newKlaim: [] })
        }
      } else if (access.find(item => item === level)) {
        const findDepo = await finance.findAll({
          where: {
            [Op.or]: [
              { bm: level === 10 ? name : 'undefined' },
              { rom: level === 11 ? name : 'undefined' },
              { nom: level === 12 ? name : 'undefined' },
              { pic_finance: level === 2 ? name : 'undefined' },
              { spv_finance: level === 7 ? name : 'undefined' },
              { asman_finance: level === 8 ? name : 'undefined' },
              { manager_finance: level === 9 ? name : 'undefined' }
            ]
          }
        })
        if (findDepo) {
          const hasil = []
          for (let i = 0; i < findDepo.length; i++) {
            const result = await klaim.findAll({
              where: {
                kode_plant: findDepo[i].kode_plant,
                [Op.and]: [
                  statTrans === 'all' ? { [Op.not]: { status_transaksi: null } } : { status_transaksi: statTrans },
                  statRej === 'all' ? { [Op.not]: { start_klaim: null } } : { status_reject: statRej },
                  statMenu === 'all' ? { [Op.not]: { start_klaim: null } } : { menu_rev: { [Op.like]: `%${statMenu}%` } },
                  category === 'ajuan bayar' ? { [Op.not]: { no_pembayaran: null } } : { [Op.not]: { id: null } },
                  timeVal1 === 'all'
                    ? { [Op.not]: { id: null } }
                    : {
                        start_klaim: {
                          [Op.gte]: timeV1,
                          [Op.lt]: timeV2
                        }
                      }
                ],
                [Op.or]: [
                  { kode_plant: { [Op.like]: `%${searchValue}%` } },
                  { nama_tujuan: { [Op.like]: `%${searchValue}%` } },
                  { nama_ktp: { [Op.like]: `%${searchValue}%` } },
                  { nama_npwp: { [Op.like]: `%${searchValue}%` } },
                  { no_ktp: { [Op.like]: `%${searchValue}%` } },
                  { no_npwp: { [Op.like]: `%${searchValue}%` } },
                  { no_surkom: { [Op.like]: `%${searchValue}%` } },
                  { nama_program: { [Op.like]: `%${searchValue}%` } },
                  { area: { [Op.like]: `%${searchValue}%` } },
                  { cost_center: { [Op.like]: `%${searchValue}%` } },
                  { no_coa: { [Op.like]: `%${searchValue}%` } },
                  { sub_coa: { [Op.like]: `%${searchValue}%` } },
                  { nama_coa: { [Op.like]: `%${searchValue}%` } },
                  { keterangan: { [Op.like]: `%${searchValue}%` } },
                  { no_transaksi: { [Op.like]: `%${searchValue}%` } },
                  { no_pembayaran: { [Op.like]: `%${searchValue}%` } }
                ]
              },
              order: [
                ['start_klaim', 'DESC'],
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
                  model: finance,
                  as: 'depo'
                },
                {
                  model: depo,
                  as: 'scarea'
                },
                {
                  model: picklaim,
                  as: 'picklaim'
                },
                {
                  model: kliring,
                  as: 'kliring'
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
            const newKlaim = category === 'ajuan bayar' ? filterBayar(type, result, noDis, statTrans, role) : category === 'verif' ? filter(type, result, noDis, statData, role) : filterApp(type, result, noDis, role)
            return response(res, 'success get klaim', { result, noDis, findDepo, newKlaim })
          } else {
            const result = hasil
            const noDis = []
            return response(res, 'success get klaim', { result, noDis, findDepo, newKlaim: [] })
          }
        } else {
          return response(res, 'failed get klaim', {}, 400, false)
        }
      } else if (accKlaim.find(item => item === level)) {
        const findPic = await spvklaim.findAll({
          where: {
            [Op.or]: [
              { pic_klaim: level === 3 ? name : 'undefined' },
              { spv_klaim: level === 23 ? name : 'undefined' },
              { manager_klaim: level === 13 ? name : 'undefined' }
            ]
          }
        })
        if (findPic.length > 0) {
          const tempDepo = []
          for (let i = 0; i < findPic.length; i++) {
            const findData = await picklaim.findAll({
              where: {
                [Op.or]: [
                  { ksni: { [Op.like]: `%${findPic[i].pic_klaim}%` } },
                  { nni: { [Op.like]: `%${findPic[i].pic_klaim}%` } },
                  { nsi: { [Op.like]: `%${findPic[i].pic_klaim}%` } },
                  { mas: { [Op.like]: `%${findPic[i].pic_klaim}%` } },
                  { mcp: { [Op.like]: `%${findPic[i].pic_klaim}%` } },
                  { simba: { [Op.like]: `%${findPic[i].pic_klaim}%` } },
                  { lotte: { [Op.like]: `%${findPic[i].pic_klaim}%` } },
                  { mun: { [Op.like]: `%${findPic[i].pic_klaim}%` } },
                  { eiti: { [Op.like]: `%${findPic[i].pic_klaim}%` } },
                  { edot: { [Op.like]: `%${findPic[i].pic_klaim}%` } },
                  { meiji: { [Op.like]: `%${findPic[i].pic_klaim}%` } }
                ]
              }
            })
            if (findData.length > 0) {
              for (let j = 0; j < findData.length; j++) {
                tempDepo.push(findData[j])
              }
            }
          }
          const cekDepo = new Set(tempDepo)
          const findDepo = [...cekDepo]
          if (findDepo.length > 0) {
            const hasil = []
            for (let i = 0; i < findDepo.length; i++) {
              const result = await klaim.findAll({
                where: {
                  kode_plant: findDepo[i].kode_plant,
                  [Op.and]: [
                    statTrans === 'all' ? { [Op.not]: { status_transaksi: null } } : { status_transaksi: statTrans },
                    statRej === 'all' ? { [Op.not]: { start_klaim: null } } : { status_reject: statRej },
                    statMenu === 'all' ? { [Op.not]: { start_klaim: null } } : { menu_rev: { [Op.like]: `%${statMenu}%` } },
                    category === 'ajuan bayar' ? { [Op.not]: { no_pembayaran: null } } : { [Op.not]: { id: null } },
                    timeVal1 === 'all'
                      ? { [Op.not]: { id: null } }
                      : {
                          start_klaim: {
                            [Op.gte]: timeV1,
                            [Op.lt]: timeV2
                          }
                        }
                  ],
                  [Op.or]: [
                    { kode_plant: { [Op.like]: `%${searchValue}%` } },
                    { nama_tujuan: { [Op.like]: `%${searchValue}%` } },
                    { nama_ktp: { [Op.like]: `%${searchValue}%` } },
                    { nama_npwp: { [Op.like]: `%${searchValue}%` } },
                    { no_ktp: { [Op.like]: `%${searchValue}%` } },
                    { no_npwp: { [Op.like]: `%${searchValue}%` } },
                    { no_surkom: { [Op.like]: `%${searchValue}%` } },
                    { nama_program: { [Op.like]: `%${searchValue}%` } },
                    { area: { [Op.like]: `%${searchValue}%` } },
                    { cost_center: { [Op.like]: `%${searchValue}%` } },
                    { no_coa: { [Op.like]: `%${searchValue}%` } },
                    { sub_coa: { [Op.like]: `%${searchValue}%` } },
                    { nama_coa: { [Op.like]: `%${searchValue}%` } },
                    { keterangan: { [Op.like]: `%${searchValue}%` } },
                    { no_transaksi: { [Op.like]: `%${searchValue}%` } },
                    { no_pembayaran: { [Op.like]: `%${searchValue}%` } }
                  ]
                },
                order: [
                  ['start_klaim', 'DESC'],
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
                    model: finance,
                    as: 'depo'
                  },
                  {
                    model: depo,
                    as: 'scarea'
                  },
                  {
                    model: picklaim,
                    as: 'picklaim'
                  },
                  {
                    model: kliring,
                    as: 'kliring'
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
              const newKlaim = category === 'ajuan bayar' ? filterBayar(type, result, noDis, statTrans, role) : category === 'verif' ? filter(type, result, noDis, statData, role) : filterApp(type, result, noDis, role)
              return response(res, 'success get klaim', { result, noDis, findDepo, newKlaim })
            } else {
              const result = hasil
              const noDis = []
              return response(res, 'success get klaim', { result, noDis, findDepo, newKlaim: [] })
            }
          } else {
            const result = []
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
              statMenu === 'all' ? { [Op.not]: { id: null } } : { menu_rev: { [Op.like]: `%${statMenu}%` } },
              timeVal1 === 'all'
                ? { [Op.not]: { id: null } }
                : {
                    start_klaim: {
                      [Op.gte]: timeV1,
                      [Op.lt]: timeV2
                    }
                  }
            ],
            [Op.or]: [
              { kode_plant: { [Op.like]: `%${searchValue}%` } },
              { nama_tujuan: { [Op.like]: `%${searchValue}%` } },
              { nama_ktp: { [Op.like]: `%${searchValue}%` } },
              { nama_npwp: { [Op.like]: `%${searchValue}%` } },
              { no_ktp: { [Op.like]: `%${searchValue}%` } },
              { no_npwp: { [Op.like]: `%${searchValue}%` } },
              { no_surkom: { [Op.like]: `%${searchValue}%` } },
              { nama_program: { [Op.like]: `%${searchValue}%` } },
              { area: { [Op.like]: `%${searchValue}%` } },
              { cost_center: { [Op.like]: `%${searchValue}%` } },
              { no_coa: { [Op.like]: `%${searchValue}%` } },
              { sub_coa: { [Op.like]: `%${searchValue}%` } },
              { nama_coa: { [Op.like]: `%${searchValue}%` } },
              { keterangan: { [Op.like]: `%${searchValue}%` } },
              { no_transaksi: { [Op.like]: `%${searchValue}%` } },
              { no_pembayaran: { [Op.like]: `%${searchValue}%` } }
            ]
          },
          order: [
            ['start_klaim', 'DESC'],
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
              model: finance,
              as: 'depo'
            },
            {
              model: depo,
              as: 'scarea'
            },
            {
              model: picklaim,
              as: 'picklaim'
            },
            {
              model: kliring,
              as: 'kliring'
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
          const newKlaim = category === 'verif' ? filter(type, findKlaim, noDis, statData, role) : filterApp(type, findKlaim, noDis, role)
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
      const { no, tipe } = req.body
      if (tipe === 'ajuan bayar') {
        const findKlaim = await klaim.findAll({
          where: {
            no_pembayaran: no
          },
          order: [
            ['start_klaim', 'DESC'],
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
              model: finance,
              as: 'depo'
            },
            {
              model: depo,
              as: 'scarea'
            },
            {
              model: picklaim,
              as: 'picklaim'
            },
            {
              model: kliring,
              as: 'kliring'
            }
          ]
        })
        if (findKlaim) {
          return response(res, 'success get dokumen', { result: findKlaim })
        } else {
          return response(res, 'failed get dokumen', { result: [] })
        }
      } else {
        const findKlaim = await klaim.findAll({
          where: {
            no_transaksi: no
          },
          order: [
            ['start_klaim', 'DESC'],
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
              model: finance,
              as: 'depo'
            },
            {
              model: depo,
              as: 'scarea'
            }
          ]
        })
        if (findKlaim) {
          return response(res, 'success get dokumen', { result: findKlaim })
        } else {
          return response(res, 'failed get dokumen', { result: [] })
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getDetailId: async (req, res) => {
    try {
      const { id } = req.params
      const findKlaim = await klaim.findOne({
        where: {
          id: id
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
            model: finance,
            as: 'depo'
          },
          {
            model: depo,
            as: 'scarea'
          },
          {
            model: picklaim,
            as: 'picklaim'
          },
          {
            model: kliring,
            as: 'kliring'
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
          const findDepo = await finance.findOne({
            where: {
              kode_plant: findKlaim.kode_plant
            }
          })
          if (findDepo) {
            const findApp = await approve.findAll({
              where: {
                [Op.and]: [
                  { kode_plant: findKlaim.kode_plant },
                  { nama_approve: 'Pengajuan Klaim' }
                ]
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
              const findApp = await approve.findAll({
                where: {
                  [Op.and]: [
                    { kode_plant: 'all' },
                    { nama_approve: 'Pengajuan Klaim' }
                  ]
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
        const findKlaim = await klaim.findOne({
          where: {
            no_pembayaran: no
          }
        })
        if (findKlaim) {
          const findDepo = await finance.findOne({
            where: {
              kode_plant: findKlaim.kode_plant
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
                  nama: i === 0 ? findDepo.pic_finance : null,
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
  approveKlaim: async (req, res) => {
    try {
      const level = req.user.level
      const name = req.user.fullname
      const { no } = req.body
      const findKlaim = await klaim.findAll({
        where: {
          no_transaksi: no
        }
      })
      if (findKlaim.length > 0) {
        const findDepo = await finance.findOne({
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
                              tgl_fullarea: moment(),
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
  approveListKlaim: async (req, res) => {
    try {
      const level = req.user.level
      const name = req.user.fullname
      const { no } = req.body
      const findKlaim = await klaim.findAll({
        where: {
          no_pembayaran: no
        }
      })
      if (findKlaim.length > 0) {
        const findDepo = await finance.findOne({
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
                              status_transaksi: 7,
                              status_reject: null,
                              isreject: null,
                              tgl_fullsublist: moment(),
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
                        return response(res, 'failed approve klaim1', {}, 404, false)
                      }
                    } else {
                      return response(res, 'failed approve klaim2', {}, 404, false)
                    }
                  } else {
                    return response(res, `${findTtd[arr - 1].jabatan} belum approve atau telah mereject`, {}, 404, false)
                  }
                }
              } else {
                return response(res, 'failed approve klaim3', {}, 404, false)
              }
            } else {
              return response(res, 'failed approve klaim4', {}, 404, false)
            }
          } else {
            return response(res, 'failed approve klaim5', {}, 404, false)
          }
        } else {
          return response(res, 'failed approve klaim6', {}, 404, false)
        }
      } else {
        return response(res, 'failed approve klaim7', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  rejectKlaim: async (req, res) => {
    try {
      const level = req.user.level
      const name = req.user.fullname
      const schema = joi.object({
        no: joi.string().required(),
        alasan: joi.string().required(),
        menu: joi.string().required(),
        list: joi.array(),
        type: joi.string(),
        type_reject: joi.string()
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 404, false)
      } else {
        const no = results.no
        const typeReject = results.type_reject
        const findKlaim = await klaim.findAll({
          where: {
            no_transaksi: no
          }
        })
        if (findKlaim.length > 0) {
          if (results.type === 'verif') {
            const temp = []
            const histRev = `reject perbaikan by ${name} at ${moment().format('DD/MM/YYYY h:mm:ss a')}; reason: ${results.alasan}`
            const histBatal = `reject pembatalan by ${name} at ${moment().format('DD/MM/YYYY h:mm:ss a')}; reason: ${results.alasan}`
            for (let i = 0; i < findKlaim.length; i++) {
              const listId = results.list
              if (listId.find(e => e === findKlaim[i].id)) {
                const send = {
                  status_transaksi: typeReject === 'pembatalan' ? 0 : findKlaim[i].status_transaksi,
                  status_reject: 1,
                  isreject: 1,
                  reason: results.alasan,
                  menu_rev: results.menu,
                  people_reject: level,
                  history: `${findKlaim[i].history}, ${typeReject === 'pembatalan' ? histBatal : histRev}`
                }
                const findRes = await klaim.findByPk(findKlaim[i].id)
                if (findRes) {
                  await findRes.update(send)
                  temp.push(1)
                }
              } else {
                const send = {
                  status_transaksi: typeReject === 'pembatalan' ? 0 : findKlaim[i].status_transaksi,
                  status_reject: 1,
                  reason: results.alasan,
                  menu_rev: results.menu,
                  people_reject: level,
                  history: `${findKlaim[i].history}, ${typeReject === 'pembatalan' ? histBatal : histRev}`
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
            const findDepo = await finance.findOne({
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
                              const histRev = `reject perbaikan by ${name} at ${moment().format('DD/MM/YYYY h:mm:ss a')}; reason: ${results.alasan}`
                              const histBatal = `reject pembatalan by ${name} at ${moment().format('DD/MM/YYYY h:mm:ss a')}; reason: ${results.alasan}`
                              for (let i = 0; i < findKlaim.length; i++) {
                                const listId = results.list
                                if (listId.find(e => e === findKlaim[i].id)) {
                                  const send = {
                                    status_transaksi: typeReject === 'pembatalan' ? 0 : findKlaim[i].status_transaksi,
                                    status_reject: 1,
                                    isreject: 1,
                                    reason: results.alasan,
                                    menu_rev: results.menu,
                                    people_reject: level,
                                    history: `${findKlaim[i].history}, ${typeReject === 'pembatalan' ? histBatal : histRev}`
                                  }
                                  const findRes = await klaim.findByPk(findKlaim[i].id)
                                  if (findRes) {
                                    await findRes.update(send)
                                    temp.push(1)
                                  }
                                } else {
                                  const send = {
                                    status_transaksi: typeReject === 'pembatalan' ? 0 : findKlaim[i].status_transaksi,
                                    status_reject: 1,
                                    reason: results.alasan,
                                    menu_rev: results.menu,
                                    people_reject: level,
                                    history: `${findKlaim[i].history}, ${typeReject === 'pembatalan' ? histBatal : histRev}`
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
  rejectListKlaim: async (req, res) => {
    try {
      const level = req.user.level
      const name = req.user.fullname
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
            no_pembayaran: no
          }
        })
        if (findKlaim.length > 0) {
          const findDepo = await finance.findOne({
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
                            for (let i = 0; i < findKlaim.length; i++) {
                              const listId = results.list
                              if (listId.find(e => e === findKlaim[i].id)) {
                                const send = {
                                  status_reject: 1,
                                  isreject: 1,
                                  reason: results.alasan,
                                  menu_rev: results.menu,
                                  people_reject: level,
                                  history: `${findKlaim[i].history}, reject ajuan bayar by ${name} at ${moment().format('DD/MM/YYYY h:mm:ss a')}; reason: ${results.alasan}`
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
                                  people_reject: level,
                                  history: `${findKlaim[i].history}, reject ajuan bayar by ${name} at ${moment().format('DD/MM/YYYY h:mm:ss a')}; reason: ${results.alasan}`
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
      const name = req.user.fullname
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
        ppu: joi.string().allow(''),
        pa: joi.string().required(),
        nominal: joi.string().required(),
        kode_vendor: joi.string().required()
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
            nominal: results.nominal,
            kode_vendor: results.kode_vendor
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
      const name = req.user.fullname
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
                tgl_veriffin: level === 2 ? moment() : findRes.tgl_veriffin,
                tgl_verifklm: level !== 2 ? moment() : findRes.tgl_verifklm,
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
  },
  submitAjuanBayar: async (req, res) => {
    try {
      // const level = req.user.level
      const name = req.user.fullname
      const schema = joi.object({
        no_transfer: joi.string().required(),
        tgl_transfer: joi.string().required(),
        list: joi.array()
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 404, false)
      } else {
        const findNo = await reservoir.findOne({
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
            const findKlaim = await klaim.findAll({
              where: {
                no_transaksi: list[i]
              }
            })
            if (findKlaim.length > 0) {
              for (let j = 0; j < findKlaim.length; j++) {
                const send = {
                  status_transaksi: 6,
                  no_pembayaran: results.no_transfer,
                  tanggal_transfer: results.tgl_transfer,
                  tgl_sublist: moment(),
                  history: `${findKlaim[j].history}, submit ajuan bayar by ${name} at ${moment().format('DD/MM/YYYY h:mm:ss a')}`
                }
                const findRes = await klaim.findByPk(findKlaim[j].id)
                if (findRes) {
                  await findRes.update(send)
                  temp.push(1)
                }
              }
            }
          }
          if (temp.length) {
            return response(res, 'success submit ajuan bayar klaim', {})
          } else {
            return response(res, 'success submit ajuan bayar klaim', {})
          }
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
      const name = req.user.fullname
      const { status, reject, menu, time1, time2, type, search } = req.query
      const searchValue = search || ''
      const statTrans = status === 'undefined' || status === null ? 8 : status
      const statRej = reject === 'undefined' ? null : reject
      const statMenu = menu === 'undefined' ? null : menu
      const timeVal1 = time1 === 'undefined' ? 'all' : time1
      const timeVal2 = time2 === 'undefined' ? 'all' : time2
      const timeV1 = moment(timeVal1)
      const timeV2 = timeVal1 !== 'all' && timeVal1 === timeVal2 ? moment(timeVal2).add(1, 'd') : moment(timeVal2)
      if (level === 5) {
        const findKlaim = await klaim.findAll({
          where: {
            kode_plant: kode,
            [Op.and]: [
              statTrans === 'all' ? { [Op.not]: { id: null } } : { status_transaksi: statTrans },
              statRej === 'all' ? { [Op.not]: { id: null } } : { status_reject: statRej },
              statMenu === 'all' ? { [Op.not]: { id: null } } : { menu_rev: { [Op.like]: `%${statMenu}%` } },
              type === 'reject' ? { [Op.not]: { status_reject: null } } : { [Op.not]: { id: null } },
              type === 'reject' ? { [Op.not]: { status_reject: 0 } } : { [Op.not]: { id: null } },
              timeVal1 === 'all'
                ? { [Op.not]: { id: null } }
                : {
                    start_klaim: {
                      [Op.gte]: timeV1,
                      [Op.lt]: timeV2
                    }
                  },
              { [Op.not]: { status_transaksi: null } },
              { [Op.not]: { status_transaksi: 1 } }
            ],
            [Op.or]: [
              { kode_plant: { [Op.like]: `%${searchValue}%` } },
              { nama_tujuan: { [Op.like]: `%${searchValue}%` } },
              { nama_ktp: { [Op.like]: `%${searchValue}%` } },
              { nama_npwp: { [Op.like]: `%${searchValue}%` } },
              { no_ktp: { [Op.like]: `%${searchValue}%` } },
              { no_npwp: { [Op.like]: `%${searchValue}%` } },
              { no_surkom: { [Op.like]: `%${searchValue}%` } },
              { nama_program: { [Op.like]: `%${searchValue}%` } },
              { area: { [Op.like]: `%${searchValue}%` } },
              { cost_center: { [Op.like]: `%${searchValue}%` } },
              { no_coa: { [Op.like]: `%${searchValue}%` } },
              { sub_coa: { [Op.like]: `%${searchValue}%` } },
              { nama_coa: { [Op.like]: `%${searchValue}%` } },
              { keterangan: { [Op.like]: `%${searchValue}%` } },
              { no_transaksi: { [Op.like]: `%${searchValue}%` } },
              { no_pembayaran: { [Op.like]: `%${searchValue}%` } }
            ],
            [Op.not]: [
              { status_transaksi: 1 }
            ]
          },
          order: [
            ['start_klaim', 'DESC'],
            [{ model: ttd, as: 'appForm' }, 'id', 'DESC']
          ],
          include: [
            {
              model: ttd,
              as: 'appForm'
            },
            {
              model: finance,
              as: 'depo'
            },
            {
              model: depo,
              as: 'scarea'
            },
            {
              model: picklaim,
              as: 'picklaim'
            },
            {
              model: finance,
              as: 'finance'
            }
          ]
        })
        if (findKlaim) {
          return response(res, 'success get data klaim', { result: findKlaim })
        } else {
          return response(res, 'success get data klaim', { result: findKlaim })
        }
      } else if (access.find(item => item === level)) {
        const findDepo = await finance.findAll({
          where: {
            [Op.or]: [
              { bm: level === 10 ? name : 'undefined' },
              { rom: level === 11 ? name : 'undefined' },
              { nom: level === 12 ? name : 'undefined' },
              { pic_finance: level === 2 ? name : 'undefined' },
              { spv_finance: level === 7 ? name : 'undefined' },
              { asman_finance: level === 8 ? name : 'undefined' },
              { manager_finance: level === 9 ? name : 'undefined' }
            ]
          }
        })
        if (findDepo) {
          const hasil = []
          for (let i = 0; i < findDepo.length; i++) {
            const result = await klaim.findAll({
              where: {
                kode_plant: findDepo[i].kode_plant,
                [Op.and]: [
                  statTrans === 'all' ? { [Op.not]: { status_transaksi: null } } : { status_transaksi: statTrans },
                  statRej === 'all' ? { [Op.not]: { id: null } } : { status_reject: statRej },
                  statMenu === 'all' ? { [Op.not]: { id: null } } : { menu_rev: { [Op.like]: `%${statMenu}%` } },
                  timeVal1 === 'all'
                    ? { [Op.not]: { id: null } }
                    : {
                        tanggal_transfer: {
                          [Op.gte]: timeV1,
                          [Op.lt]: timeV2
                        }
                      }
                ],
                [Op.or]: [
                  { kode_plant: { [Op.like]: `%${searchValue}%` } },
                  { nama_tujuan: { [Op.like]: `%${searchValue}%` } },
                  { nama_ktp: { [Op.like]: `%${searchValue}%` } },
                  { nama_npwp: { [Op.like]: `%${searchValue}%` } },
                  { no_ktp: { [Op.like]: `%${searchValue}%` } },
                  { no_npwp: { [Op.like]: `%${searchValue}%` } },
                  { no_surkom: { [Op.like]: `%${searchValue}%` } },
                  { nama_program: { [Op.like]: `%${searchValue}%` } },
                  { area: { [Op.like]: `%${searchValue}%` } },
                  { cost_center: { [Op.like]: `%${searchValue}%` } },
                  { no_coa: { [Op.like]: `%${searchValue}%` } },
                  { sub_coa: { [Op.like]: `%${searchValue}%` } },
                  { nama_coa: { [Op.like]: `%${searchValue}%` } },
                  { keterangan: { [Op.like]: `%${searchValue}%` } },
                  { no_transaksi: { [Op.like]: `%${searchValue}%` } },
                  { no_pembayaran: { [Op.like]: `%${searchValue}%` } }
                ]
              },
              order: [
                ['start_klaim', 'DESC'],
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
                  model: finance,
                  as: 'depo'
                },
                {
                  model: depo,
                  as: 'scarea'
                },
                {
                  model: picklaim,
                  as: 'picklaim'
                },
                {
                  model: finance,
                  as: 'finance'
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
            const result = hasil
            return response(res, 'success get klaim', { result })
          } else {
            const result = hasil
            return response(res, 'success get klaim', { result })
          }
        } else {
          return response(res, 'failed get klaim', {}, 400, false)
        }
      } else if (accKlaim.find(item => item === level)) {
        const findPic = await spvklaim.findAll({
          where: {
            [Op.or]: [
              { pic_klaim: level === 3 ? name : 'undefined' },
              { spv_klaim: level === 23 ? name : 'undefined' },
              { manager_klaim: level === 13 ? name : 'undefined' }
            ]
          }
        })
        if (findPic.length > 0) {
          const tempDepo = []
          for (let i = 0; i < findPic.length; i++) {
            const findData = await picklaim.findAll({
              where: {
                [Op.or]: [
                  { ksni: { [Op.like]: `%${findPic[i].pic_klaim}%` } },
                  { nni: { [Op.like]: `%${findPic[i].pic_klaim}%` } },
                  { nsi: { [Op.like]: `%${findPic[i].pic_klaim}%` } },
                  { mas: { [Op.like]: `%${findPic[i].pic_klaim}%` } },
                  { mcp: { [Op.like]: `%${findPic[i].pic_klaim}%` } },
                  { simba: { [Op.like]: `%${findPic[i].pic_klaim}%` } },
                  { lotte: { [Op.like]: `%${findPic[i].pic_klaim}%` } },
                  { mun: { [Op.like]: `%${findPic[i].pic_klaim}%` } },
                  { eiti: { [Op.like]: `%${findPic[i].pic_klaim}%` } },
                  { edot: { [Op.like]: `%${findPic[i].pic_klaim}%` } },
                  { meiji: { [Op.like]: `%${findPic[i].pic_klaim}%` } }
                ]
              }
            })
            if (findData.length > 0) {
              for (let j = 0; j < findData.length; j++) {
                tempDepo.push(findData[j].kode_plant)
              }
            }
          }
          const cekDepo = new Set(tempDepo)
          const findDepo = [...cekDepo]
          if (findDepo.length > 0) {
            const hasil = []
            for (let i = 0; i < findDepo.length; i++) {
              const result = await klaim.findAll({
                where: {
                  kode_plant: findDepo[i],
                  [Op.and]: [
                    statTrans === 'all' ? { [Op.not]: { status_transaksi: null } } : { status_transaksi: statTrans },
                    statRej === 'all' ? { [Op.not]: { id: null } } : { status_reject: statRej },
                    statMenu === 'all' ? { [Op.not]: { id: null } } : { menu_rev: { [Op.like]: `%${statMenu}%` } },
                    timeVal1 === 'all'
                      ? { [Op.not]: { id: null } }
                      : {
                          tanggal_transfer: {
                            [Op.gte]: timeV1,
                            [Op.lt]: timeV2
                          }
                        }
                  ],
                  [Op.or]: [
                    { kode_plant: { [Op.like]: `%${searchValue}%` } },
                    { nama_tujuan: { [Op.like]: `%${searchValue}%` } },
                    { nama_ktp: { [Op.like]: `%${searchValue}%` } },
                    { nama_npwp: { [Op.like]: `%${searchValue}%` } },
                    { no_ktp: { [Op.like]: `%${searchValue}%` } },
                    { no_npwp: { [Op.like]: `%${searchValue}%` } },
                    { no_surkom: { [Op.like]: `%${searchValue}%` } },
                    { nama_program: { [Op.like]: `%${searchValue}%` } },
                    { area: { [Op.like]: `%${searchValue}%` } },
                    { cost_center: { [Op.like]: `%${searchValue}%` } },
                    { no_coa: { [Op.like]: `%${searchValue}%` } },
                    { sub_coa: { [Op.like]: `%${searchValue}%` } },
                    { nama_coa: { [Op.like]: `%${searchValue}%` } },
                    { keterangan: { [Op.like]: `%${searchValue}%` } },
                    { no_transaksi: { [Op.like]: `%${searchValue}%` } },
                    { no_pembayaran: { [Op.like]: `%${searchValue}%` } }
                  ]
                },
                order: [
                  ['start_klaim', 'DESC'],
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
                    model: finance,
                    as: 'depo'
                  },
                  {
                    model: depo,
                    as: 'scarea'
                  },
                  {
                    model: picklaim,
                    as: 'picklaim'
                  },
                  {
                    model: finance,
                    as: 'finance'
                  }
                ]
              })
              if (result.length > 0) {
                for (let j = 0; j < result.length; j++) {
                  hasil.push(result[j])
                }
              }
            }
            // const cekHasil = new Set(hasil)
            // const findHasil = [...cekHasil]
            if (hasil.length > 0) {
              const result = hasil
              return response(res, 'success get klaim', { result, findDepo })
            } else {
              const result = hasil
              return response(res, 'success get klaim', { result, findDepo })
            }
          } else {
            return response(res, 'success get klaim', { result: [] })
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
              statMenu === 'all' ? { [Op.not]: { id: null } } : { menu_rev: { [Op.like]: `%${statMenu}%` } },
              timeVal1 === 'all'
                ? { [Op.not]: { id: null } }
                : {
                    start_klaim: {
                      [Op.gte]: timeV1,
                      [Op.lt]: timeV2
                    }
                  }
            ],
            [Op.or]: [
              { kode_plant: { [Op.like]: `%${searchValue}%` } },
              { nama_tujuan: { [Op.like]: `%${searchValue}%` } },
              { nama_ktp: { [Op.like]: `%${searchValue}%` } },
              { nama_npwp: { [Op.like]: `%${searchValue}%` } },
              { no_ktp: { [Op.like]: `%${searchValue}%` } },
              { no_npwp: { [Op.like]: `%${searchValue}%` } },
              { no_surkom: { [Op.like]: `%${searchValue}%` } },
              { nama_program: { [Op.like]: `%${searchValue}%` } },
              { area: { [Op.like]: `%${searchValue}%` } },
              { cost_center: { [Op.like]: `%${searchValue}%` } },
              { no_coa: { [Op.like]: `%${searchValue}%` } },
              { sub_coa: { [Op.like]: `%${searchValue}%` } },
              { nama_coa: { [Op.like]: `%${searchValue}%` } },
              { keterangan: { [Op.like]: `%${searchValue}%` } },
              { no_transaksi: { [Op.like]: `%${searchValue}%` } },
              { no_pembayaran: { [Op.like]: `%${searchValue}%` } }
            ]
          },
          order: [
            ['start_klaim', 'DESC'],
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
              model: finance,
              as: 'depo'
            },
            {
              model: depo,
              as: 'scarea'
            },
            {
              model: picklaim,
              as: 'picklaim'
            },
            {
              model: finance,
              as: 'finance'
            }
          ]
        })
        if (findKlaim) {
          return response(res, 'success get data klaim', { result: findKlaim })
        } else {
          return response(res, 'success get data klaim', { result: findKlaim })
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getDocBayar: async (req, res) => {
    try {
      const { no } = req.body
      const findDoc = await docuser.findAll({
        where: {
          no_transaksi: no
        }
      })
      const send = {
        desc: 'BUKTI BAYAR',
        jenis_form: 'List Klaim',
        no_transaksi: no,
        tipe: 'List Ajuan Bayar Klaim',
        stat_upload: 1
      }
      if (findDoc.length > 0) {
        return response(res, 'success get dokumen', { result: findDoc })
      } else {
        const make = await docuser.create(send)
        if (make) {
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
          return response(res, 'failed get doc bukti bayar')
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  uploadBukti: async (req, res) => {
    try {
      const { id } = req.query
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
          const findDoc = await docuser.findByPk(id)
          const dokumen = `assets/documents/${req.file.filename}`
          const send = {
            path: dokumen,
            divisi: 'klaim',
            history: req.file.originalname,
            jenis_dok: 'lampiran'
          }
          if (findDoc) {
            const make = await findDoc.update(send)
            if (make) {
              return response(res, 'success upload bukti bayar')
            } else {
              return response(res, 'success upload bukti bayar')
            }
          } else {
            return response(res, 'failed upload bukti bayar', {}, 400, false)
          }
        } catch (error) {
          return response(res, error.message, {}, 500, false)
        }
      })
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  submitBuktiBayar: async (req, res) => {
    try {
      const { no } = req.body
      const name = req.user.fullname
      const findKlaim = await klaim.findAll({
        where: {
          no_pembayaran: no
        }
      })
      if (findKlaim.length > 0) {
        const temp = []
        for (let i = 0; i < findKlaim.length; i++) {
          const findData = await klaim.findByPk(findKlaim[i].id)
          if (findData) {
            const data = {
              tgl_submitbukti: moment(),
              status_transaksi: 8,
              status_reject: null,
              isreject: null,
              history: `${findKlaim[i].history}, submit bukti bayar by ${name} at ${moment().format('DD/MM/YYYY h:mm:ss a')}`
            }
            await findData.update(data)
            temp.push(findData)
          }
        }
        if (temp.length > 0) {
          return response(res, 'success submit bukti bayar')
        } else {
          return response(res, 'failed submit bukti bayar', {}, 400, false)
        }
      } else {
        return response(res, 'failed submit bukti bayar', {}, 400, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  updateNilaiVerif: async (req, res) => {
    try {
      const { no, type, id, nilai, tglGetDana } = req.body
      const name = req.user.fullname
      const dataDate = {
        end_klaim: moment()
      }
      const findKlaim = await klaim.findAll({
        where: {
          no_transaksi: no
        }
      })
      if (findKlaim.length > 0) {
        const temp = []
        for (let i = 0; i < findKlaim.length; i++) {
          if (type === 'all') {
            const findData = await klaim.findByPk(findKlaim[i].id)
            if (findData) {
              const data = {
                type_nilaiverif: type,
                nilai_verif: nilai,
                status_reject: null,
                isreject: null,
                end_klaim: moment(),
                tgl_getdana: tglGetDana,
                history: `${findKlaim[i].history}, input nilai yang diterima by ${name} at ${moment().format('DD/MM/YYYY h:mm:ss a')}`
              }
              await findData.update(data)
              temp.push(findData)
            }
          } else {
            const findData = await klaim.findByPk(id)
            if (findData) {
              const data = {
                type_nilaiverif: type,
                nilai_verif: nilai,
                status_reject: null,
                isreject: null,
                tgl_getdana: tglGetDana,
                history: `${findKlaim[i].history}, input nilai yang diterima by ${name} at ${moment().format('DD/MM/YYYY h:mm:ss a')}`
              }
              await findData.update(data)
              temp.push(findData)
            }
          }
        }
        if (type === 'all') {
          return response(res, 'success update nilai bayar')
        } else {
          const cekKlaim = await klaim.findAll({
            where: {
              no_transaksi: no,
              [Op.not]: [
                { nilai_verif: null }
              ]
            }
          })
          if (cekKlaim.length === findKlaim.length) {
            const cekData = []
            for (let i = 0; i < cekKlaim.length; i++) {
              const findData = await klaim.findByPk(cekKlaim[i].id)
              if (findData) {
                await findData.update(dataDate)
                cekData.push(findData)
              }
            }
            if (cekData.length > 0) {
              return response(res, 'success update nilai bayar')
            } else {
              return response(res, 'success update nilai bayar')
            }
          } else {
            return response(res, 'success update nilai bayar')
          }
        }
      } else {
        return response(res, 'failed update nilai bayar', {}, 400, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  uploadDataKlaim: async (req, res) => {
    // const level = req.user.level
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
        const cek = [
          'NO AJUAN',
          'PPU',
          'PA',
          'KODE VENDOR',
          'NOMINAL VERIFIKASI',
          'NO COA',
          'NAMA COA',
          'TGL AJUAN',
          'NILAI YANG DIAJUKAN',
          'DN AREA'
        ]
        const valid = rows[0]
        for (let i = 0; i < cek.length; i++) {
          if (valid[i] === cek[i]) {
            count.push(1)
          }
        }
        if (count.length === cek.length) {
          const plant = []
          const userName = []
          const cekData = []
          for (let i = 1; i < rows.length; i++) {
            const a = rows[i]
            cekData.push(`${a[0]}`)
          }
          const object = {}
          const result = []
          const obj = {}

          userName.forEach(item => {
            if (!obj[item]) { obj[item] = 0 }
            obj[item] += 1
          })

          for (const prop in obj) {
            if (obj[prop] >= 2) {
              result.push(prop)
            }
          }

          plant.forEach(item => {
            if (!object[item]) { object[item] = 0 }
            object[item] += 1
          })

          for (const prop in object) {
            if (object[prop] >= 2) {
              result.push(prop)
            }
          }
          if (result.length > 0) {
            return response(res, 'there is duplication in your file master', { result }, 404, false)
          } else {
            rows.shift()
            const create = []
            for (let i = 0; i < rows.length; i++) {
              const noun = []
              const process = rows[i]
              for (let j = 0; j < process.length + 1; j++) {
                noun.push(process[j])
              }
              create.push(noun)
            }
            if (create.length > 0) {
              const cekData = []
              const mesData = []
              for (let i = 0; i < create.length; i++) {
                const dataKlaim = create[i]
                const ppu = dataKlaim[1]
                const pa = dataKlaim[2]
                const kodeVendor = dataKlaim[3]
                const nominal = dataKlaim[4]

                const dataPpu = ppu.toString().length !== 10 ||
                ppu.toString().split('').map(item => { return isNaN(parseFloat(item))}) === true
                  ? { no_transaksi: dataKlaim[0], mess: 'Pastikan PPU Diisi dengan Sesuai' }
                  : null
                const dataPa = pa.toString().length !== 16 ||
                pa.toString().split('').map(item => { return (isNaN(parseFloat(item))) }) === true
                  ? { no_transaksi: dataKlaim[0], mess: 'Pastikan  PA Diisi dengan Sesuai' }
                  : null
                const dataVendor = kodeVendor.toString().length !== 10 ? { no_transaksi: dataKlaim[0], mess: 'Pastikan Kode Vendor Diisi dengan Sesuai' } : null
                const dataNominal = nominal.toString().split('').map(item => { return (isNaN(parseFloat(item))) }) === true
                  ? { no_transaksi: dataKlaim[0], mess: 'Pastikan Nominal Diisi dengan Sesuai' }
                  : null

                // console.log(ppu.toString().split('').map(item => { return isNaN(parseFloat(item)) === true && true }) === true)
                if (dataPpu !== null || dataPa !== null || dataVendor !== null || dataNominal !== null) {
                  const mesTemp = [dataPpu, dataPa, dataVendor, dataNominal]
                  mesData.push(mesTemp)
                  cekData.push(dataKlaim)
                }
              }
              if (cekData.length > 0) {
                fs.unlink(dokumen, function (err) {
                  if (err) throw err
                  console.log('success delete file')
                })
                return response(res, 'failed upload file master', { result: cekData, message: mesData })
              } else {
                const arr = []
                for (let i = 0; i < create.length; i++) {
                  const dataKlaim = create[i]
                  const ppu = dataKlaim[1]
                  const pa = dataKlaim[2]
                  const kodeVendor = dataKlaim[3]
                  const nominal = dataKlaim[4]
                  const data = {
                    ppu: ppu,
                    pa: pa,
                    kode_vendor: kodeVendor,
                    nominal: nominal
                  }
                  const findKlaim = await klaim.findOne({
                    where: {
                      no_transaksi: dataKlaim[0]
                    }
                  })
                  if (findKlaim.status_transaksi === 4) {
                    const upUser = await findKlaim.update(data)
                    if (upUser) {
                      arr.push(upUser)
                    }
                  } else {
                    arr.push(findKlaim)
                  }
                }
                if (arr.length) {
                  fs.unlink(dokumen, function (err) {
                    if (err) throw err
                    console.log('success delete file')
                  })
                  return response(res, 'successfully upload file master', { result: arr, message: mesData })
                } else {
                  fs.unlink(dokumen, function (err) {
                    if (err) throw err
                    console.log('success delete file')
                  })
                  return response(res, 'failed to upload file', {}, 404, false)
                }
              }
            } else {
              return response(res, 'failed to upload file', {}, 404, false)
            }
          }
        } else {
          fs.unlink(dokumen, function (err) {
            if (err) throw err
            console.log('success delete file')
          })
          return response(res, 'Failed to upload master file, please use the template provided', {}, 400, false)
        }
      } catch (error) {
        return response(res, error.message, {}, 500, false)
      }
    })
  }
}
