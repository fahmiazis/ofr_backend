const { vendor, vervendor, reservoir, finance, docuser, document } = require('../models')
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
const moment = require('moment')
const uploadHelper = require('../helpers/upload')
const { APP_URL } = process.env
const access = [4, 14]
const { filter } = require('../helpers/pagination')

module.exports = {
  generateNoVendor: async (req, res) => {
    try {
      const timeV1 = moment().startOf('month')
      const timeV2 = moment().endOf('month').add(1, 'd')
      const kode = req.user.kode
      const findNo = await reservoir.findAll({
        where: {
          transaksi: 'vendor',
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
      const noVendor = Math.max(...cekNo) + 1
      const change = noVendor.toString().split('')
      const notrans = change.length === 2 ? '00' + noVendor : change.length === 1 ? '000' + noVendor : change.length === 3 ? '0' + noVendor : noVendor
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
      const noTrans = `${notrans}/${kode}/${rome}/${year}-VDR`
      const creDataReser = {
        no_transaksi: noTrans,
        kode_plant: kode,
        transaksi: 'vendor',
        tipe: 'area',
        status: 'delayed'
      }
      const upDataReser = {
        status: 'expired'
      }
      const findVdr = await reservoir.findOne({
        where: {
          kode_plant: kode,
          transaksi: 'vendor',
          tipe: 'area',
          status: 'delayed'
        }
      })
      if (findVdr) {
        const findDoc = await docuser.findAll({
          where: {
            no_transaksi: findVdr.no_transaksi
          }
        })
        if (findDoc.length > 0) {
          const cekDoc = []
          for (let i = 0; i < findDoc.length; i++) {
            const findData = await docuser.findByPk(findDoc[i].id)
            if (findData) {
              const data = {
                no_transaksi: noTrans
              }
              await findData.update(data)
              cekDoc.push(findData)
            }
          }
          if (cekDoc.length > 0) {
            const upReser = await findVdr.update(upDataReser)
            if (upReser) {
              await reservoir.create(creDataReser)
              return response(res, 'success create no ajuan vendor', { result: noTrans })
            } else {
              return response(res, 'failed create no ajuan vendor', {}, 404, false)
            }
          } else {
            return response(res, 'failed create no ajuan vendor', {}, 404, false)
          }
        } else {
          const upReser = await findVdr.update(upDataReser)
          if (upReser) {
            await reservoir.create(creDataReser)
            return response(res, 'success create no ajuan vendor', { result: noTrans })
          } else {
            return response(res, 'failed create no ajuan vendor', {}, 404, false)
          }
        }
      } else {
        await reservoir.create(creDataReser)
        return response(res, 'success create no ajuan vendor', { result: noTrans })
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
            divisi: 'tax',
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
  addVendor: async (req, res) => {
    try {
      // const timeV1 = moment().startOf('month')
      // const timeV2 = moment().endOf('month').add(1, 'd')
      const kode = req.user.kode
      const schema = joi.object({
        nama: joi.string().required(),
        no_npwp: joi.string().allow(''),
        no_ktp: joi.string().allow(''),
        alamat: joi.string().required(),
        no: joi.string().required(),
        jenis: joi.string().allow(''),
        type_skb: joi.string().required(),
        no_skb: joi.string().allow(''),
        no_skt: joi.string().allow(''),
        datef_skb: joi.string().allow(''),
        datel_skb: joi.string().allow('')
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 404, false)
      } else {
        const findNameVendor = await vendor.findOne({
          where: {
            [Op.or]: [
              // { nama: { [Op.like]: `%${results.nama}` } },
              // { no_npwp: { [Op.like]: `%${results.no_npwp}%` } },
              results.no_ktp === '' || results.no_ktp === '0000000000000000' ? { id: 'undefined' } : { no_ktp: { [Op.like]: `%${results.no_ktp}%` } },
              results.no_npwp === '' || results.no_npwp === '000000000000000' ? { id: 'undefined' } : { no_npwp: { [Op.like]: `%${results.no_npwp}%` } }
              // { alamat: { [Op.like]: `%${results.alamat}%` } }
            ],
            [Op.and]: [
              results.type_skb === 'SKB'
                ? { no_skb: { [Op.like]: `%${results.no_skb}%` } }
                : results.type_skb === 'SKT'
                  ? { no_skt: { [Op.like]: `%${results.no_skt}%` } }
                  : {
                      [Op.or]: [
                        { type_skb: 'tidak' },
                        { type_skb: null }
                      ]
                    }
            ]
          }
        })
        const findAjuanVendor = await vervendor.findOne({
          where: {
            [Op.or]: [
              // { nama: { [Op.like]: `%${results.nama}` } },
              // { npwp: { [Op.like]: `%${results.no_npwp}%` } },
              results.no_ktp === '' || results.no_ktp === '0000000000000000' ? { id: 'undefined' } : { nik: { [Op.like]: `%${results.no_ktp}%` } },
              results.no_npwp === '' || results.no_npwp === '000000000000000' ? { id: 'undefined' } : { npwp: { [Op.like]: `%${results.no_npwp}%` } }
              // { alamat: { [Op.like]: `%${results.alamat}%` } }
            ],
            [Op.and]: [
              results.type_skb === 'SKB'
                ? { no_skb: { [Op.like]: `%${results.no_skb}%` } }
                : results.type_skb === 'SKT'
                  ? { no_skt: { [Op.like]: `%${results.no_skt}%` } }
                  : {
                      [Op.or]: [
                        { type_skb: 'tidak' },
                        { type_skb: null }
                      ]
                    }
            ]
          }
        })
        if (findNameVendor || findAjuanVendor) {
          return response(res, 'vendor telah terdaftar', { findAjuanVendor, findNameVendor }, 404, false)
        } else {
          const noTrans = results.no
          const tipe = results.type_skb
          const data = {
            status_transaksi: 2,
            no_transaksi: noTrans,
            start_transaksi: moment(),
            kode_plant: kode,
            nama: results.nama,
            npwp: results.no_npwp,
            nik: results.no_ktp,
            alamat: results.alamat,
            type_skb: tipe,
            jenis_vendor: results.jenis,
            no_skb: tipe === 'SKB' ? results.no_skb : null,
            no_skt: tipe === 'SKT' ? results.no_skt : null,
            datef_skb: tipe !== 'tidak' ? results.datef_skb : null,
            datel_skb: tipe !== 'tidak' ? results.datel_skb : null,
            tipe_ajuan: 'add',
            history: `submit ajuan data vendor by ${kode} at ${moment().format('DD/MM/YYYY h:mm:ss a')}`
          }
          const createVendor = await vervendor.create(data)
          if (createVendor) {
            const findReser = await reservoir.findOne({
              where: {
                no_transaksi: noTrans
              }
            })
            const upDataReser = {
              status: 'used'
            }
            if (findReser) {
              await findReser.update(upDataReser)
              return response(res, 'success create ajuan vendor', { result: data })
            } else {
              return response(res, 'failed create ajuan vendor', {}, 404, false)
            }
          } else {
            return response(res, 'failed create ajuan vendor', {}, 404, false)
          }
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getDocumentSkb: async (req, res) => {
    try {
      const { no, name, tipeSkb, modalOpen } = req.body
      const findDoc = await docuser.findAll({
        where: {
          no_transaksi: no
        }
      })
      if (findDoc.length > 0) {
        const findReser = await reservoir.findOne({
          where: {
            no_transaksi: no
          }
        })
        if (findReser !== undefined && findReser !== null && findReser.status !== undefined && findReser.status === 'delayed') {
          const findMaster = await document.findAll({
            where: {
              [Op.and]: [
                { jenis: 'Verifikasi Data Vendor' },
                { type: name }
              ]
            }
          })
          if (modalOpen === 'ya') {
            const pardoc = []
            for (let i = 0; i < findDoc.length; i++) {
              const send = {
                path: null,
                divisi: 'tax',
                history: null,
                jenis_dok: 'lampiran',
                status: null
              }
              const findId = await docuser.findByPk(findDoc[i].id)
              if (findId) {
                await findId.update(send)
                pardoc.push(findId)
              }
            }
            if (pardoc.length > 0) {
              const cek = tipeSkb === undefined ? 'tidak' : tipeSkb // eslint-disable-line
              const resData = cek === 'ya' ? findMaster.length + 1 : findMaster.length
              const cekDoc = []
              for (let i = 0; i < resData; i++) {
                const findSkb = findDoc.find(({ desc }) => desc === 'Dokumen SKB/SKT')
                if (cek === 'ya') {
                  if (findSkb !== undefined) {
                    cekDoc.push(1)
                  } else {
                    if (i === resData - 1) {
                      const data = {
                        desc: 'Dokumen SKB/SKT',
                        jenis_form: findMaster[0].jenis,
                        no_transaksi: no,
                        tipe: findMaster[0].type,
                        stat_upload: 1
                      }
                      const creDoc = await docuser.create(data)
                      if (creDoc) {
                        console.log('berhasil create doc skb')
                        cekDoc.push(creDoc)
                      }
                    } else {
                      cekDoc.push(1)
                    }
                  }
                } else {
                  cekDoc.push(1)
                }
              }
              if (cekDoc.length > 0) {
                if (cek === 'tidak') {
                  const findSkb = findDoc.find(({ desc }) => desc === 'Dokumen SKB/SKT')
                  if (findSkb !== undefined) {
                    const findId = await docuser.findByPk(findSkb.id)
                    if (findId) {
                      await findId.destroy()
                      const findFinDoc = await docuser.findAll({
                        where: {
                          no_transaksi: no
                        }
                      })
                      if (findFinDoc.length > 0) {
                        return response(res, 'success get dokumen flowles1', { result: findFinDoc })
                      } else {
                        return response(res, 'success get dokumen gagl1', { result: findDoc })
                      }
                    } else {
                      const findFinDoc = await docuser.findAll({
                        where: {
                          no_transaksi: no
                        }
                      })
                      if (findFinDoc.length > 0) {
                        return response(res, 'success get dokumen flowles2', { result: findFinDoc })
                      } else {
                        return response(res, 'success get dokumen gagl2', { result: findDoc })
                      }
                    }
                  } else {
                    const findFinDoc = await docuser.findAll({
                      where: {
                        no_transaksi: no
                      }
                    })
                    if (findFinDoc.length > 0) {
                      return response(res, 'success get dokumen flowles3', { result: findFinDoc })
                    } else {
                      return response(res, 'success get dokumen gagl3', { result: findDoc })
                    }
                  }
                } else {
                  const findFinDoc = await docuser.findAll({
                    where: {
                      no_transaksi: no
                    }
                  })
                  if (findFinDoc.length > 0) {
                    return response(res, 'success get dokumen flowles4', { result: findFinDoc })
                  } else {
                    return response(res, 'success get dokumen gagl4', { result: findDoc })
                  }
                }
              } else {
                return response(res, 'success get dokumen ggl', { result: findDoc, cekDoc, findMaster })
              }
            } else {
              return response(res, 'success get dokumen gjl', { result: findDoc })
            }
          } else {
            const cek = tipeSkb === undefined ? 'tidak' : tipeSkb // eslint-disable-line
            const resData = cek === 'ya' ? findMaster.length + 1 : findMaster.length
            const cekDoc = []
            for (let i = 0; i < resData; i++) {
              const findSkb = findDoc.find(({ desc }) => desc === 'Dokumen SKB/SKT')
              if (cek === 'ya') {
                if (findSkb !== undefined) {
                  cekDoc.push(1)
                } else {
                  if (i === resData - 1) {
                    const data = {
                      desc: 'Dokumen SKB/SKT',
                      jenis_form: findMaster[0].jenis,
                      no_transaksi: no,
                      tipe: findMaster[0].type,
                      stat_upload: 1
                    }
                    const creDoc = await docuser.create(data)
                    if (creDoc) {
                      console.log('berhasil create doc skb')
                      cekDoc.push(creDoc)
                    }
                  } else {
                    cekDoc.push(1)
                  }
                }
              } else {
                cekDoc.push(1)
              }
            }
            if (cekDoc.length > 0) {
              if (cek === 'tidak') {
                const findSkb = findDoc.find(({ desc }) => desc === 'Dokumen SKB/SKT')
                if (findSkb !== undefined) {
                  const findId = await docuser.findByPk(findSkb.id)
                  if (findId) {
                    await findId.destroy()
                    const findFinDoc = await docuser.findAll({
                      where: {
                        no_transaksi: no
                      }
                    })
                    if (findFinDoc.length > 0) {
                      return response(res, 'success get dokumen flowles1', { result: findFinDoc })
                    } else {
                      return response(res, 'success get dokumen gagl1', { result: findDoc })
                    }
                  } else {
                    const findFinDoc = await docuser.findAll({
                      where: {
                        no_transaksi: no
                      }
                    })
                    if (findFinDoc.length > 0) {
                      return response(res, 'success get dokumen flowles2', { result: findFinDoc })
                    } else {
                      return response(res, 'success get dokumen gagl2', { result: findDoc })
                    }
                  }
                } else {
                  const findFinDoc = await docuser.findAll({
                    where: {
                      no_transaksi: no
                    }
                  })
                  if (findFinDoc.length > 0) {
                    return response(res, 'success get dokumen flowles3', { result: findFinDoc })
                  } else {
                    return response(res, 'success get dokumen gagl3', { result: findDoc })
                  }
                }
              } else {
                const findFinDoc = await docuser.findAll({
                  where: {
                    no_transaksi: no
                  }
                })
                if (findFinDoc.length > 0) {
                  return response(res, 'success get dokumen flowles4', { result: findFinDoc })
                } else {
                  return response(res, 'success get dokumen gagl4', { result: findDoc })
                }
              }
            } else {
              return response(res, 'success get dokumen ggl', { result: findDoc, cekDoc, findMaster })
            }
          }
        } else {
          return response(res, 'success get dokumen', { result: findDoc })
        }
      } else {
        const findMaster = await document.findAll({
          where: {
            [Op.and]: [
              { jenis: 'Verifikasi Data Vendor' },
              { type: name }
            ]
          }
        })
        if (findMaster.length > 0) {
          const temp = []
          const cek = tipeSkb === undefined ? 'tidak' : tipeSkb // eslint-disable-line
          const resData = cek === 'ya' ? findMaster.length + 1 : findMaster.length
          for (let i = 0; i < resData; i++) {
            if (cek === 'ya') {
              if (i === resData - 1) {
                const data = {
                  desc: 'Dokumen SKB/SKT',
                  jenis_form: findMaster[0].jenis,
                  no_transaksi: no,
                  tipe: findMaster[0].type,
                  stat_upload: 1
                }
                const creDoc = await docuser.create(data)
                if (creDoc) {
                  temp.push(creDoc)
                }
              } else {
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
            } else {
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
              return response(res, 'failed get dokumen1', { result: [] })
            }
          } else {
            return response(res, 'failed get dokumen2', { result: [] })
          }
        } else {
          return response(res, 'failed get dokumen3', { result: [] })
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
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
              { jenis: 'Verifikasi Data Vendor' },
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
  submitVerif: async (req, res) => {
    try {
      const name = req.user.fullname
      const level = req.user.level
      const schema = joi.object({
        no: joi.string().required(),
        list: joi.array()
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 404, false)
      } else {
        const list = results.list
        if (list.length > 0) {
          const temp = []
          for (let i = 0; i < list.length; i++) {
            const findVerif = await vervendor.findAll({
              where: {
                no_transaksi: list[i]
              }
            })
            if (findVerif.length > 0) {
              for (let h = 0; h < findVerif.length; h++) {
                const findRes = await vervendor.findByPk(findVerif[h].id)
                if (findRes) {
                  const data = {
                    status_transaksi: 8,
                    status_reject: null,
                    isreject: null,
                    tgl_verif: level === 2 ? moment() : findRes.tgl_veriffin,
                    history: `${findVerif[h].history}, verifikasi data vendor by ${name} at ${moment().format('DD/MM/YYYY h:mm:ss a')}`
                  }
                  const dataVen = {
                    nama: findVerif[h].nama,
                    no_npwp: findVerif[h].npwp,
                    no_ktp: findVerif[h].nik,
                    alamat: findVerif[h].alamat,
                    kode_plant: findVerif[h].kode_plant,
                    jenis_vendor: findVerif[h].jenis_vendor,
                    type_skb: findVerif[h].type_skb,
                    no_skb: findVerif[h].no_skb,
                    no_skt: findVerif[h].no_skt,
                    datef_skb: findVerif[h].datef_skb,
                    datel_skb: findVerif[h].datel_skb
                  }
                  await vendor.create(dataVen)
                  await findRes.update(data)
                  temp.push(findRes)
                }
              }
            }
          }
          if (temp.length > 0) {
            return response(res, 'success verifikasi data vendor', {})
          } else {
            return response(res, 'success verifikasi data vendor', {})
          }
        } else {
          const findVerif = await vervendor.findAll({
            where: {
              no_transaksi: results.no
            }
          })
          if (findVerif.length > 0) {
            const temp = []
            for (let i = 0; i < findVerif.length; i++) {
              const findRes = await vervendor.findByPk(findVerif[i].id)
              if (findRes) {
                const data = {
                  status_transaksi: 8,
                  status_reject: null,
                  isreject: null,
                  tgl_verif: level === 2 ? moment() : findRes.tgl_veriffin,
                  history: `${findVerif[i].history}, verifikasi data vendor by ${name} at ${moment().format('DD/MM/YYYY h:mm:ss a')}`
                }
                const dataVen = {
                  nama: findVerif[i].nama,
                  no_npwp: findVerif[i].npwp,
                  no_ktp: findVerif[i].nik,
                  alamat: findVerif[i].alamat,
                  kode_plant: findVerif[i].kode_plant,
                  jenis_vendor: findVerif[i].jenis_vendor,
                  type_skb: findVerif[i].type_skb,
                  no_skb: findVerif[i].no_skb,
                  no_skt: findVerif[i].no_skt,
                  datef_skb: findVerif[i].datef_skb,
                  datel_skb: findVerif[i].datel_skb
                }
                await vendor.create(dataVen)
                await findRes.update(data)
                temp.push(findRes)
              }
            }
            if (temp.length > 0) {
              return response(res, 'success verifikasi data vendor', {})
            } else {
              return response(res, 'success verifikasi data vendor', {})
            }
          } else {
            return response(res, 'failed submit verifikasi data vendor', {}, 404, false)
          }
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  rejectVerven: async (req, res) => {
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
        const typeReject = results.type_reject
        const no = results.no
        const findVerven = await vervendor.findAll({
          where: {
            no_transaksi: no
          }
        })
        if (findVerven.length > 0) {
          const temp = []
          const histRev = `reject perbaikan by ${name} at ${moment().format('DD/MM/YYYY h:mm:ss a')}; reason: ${results.alasan}`
          const histBatal = `reject pembatalan by ${name} at ${moment().format('DD/MM/YYYY h:mm:ss a')}; reason: ${results.alasan}`
          for (let i = 0; i < findVerven.length; i++) {
            const listId = results.list
            if (listId.find(e => e === findVerven[i].id)) {
              const send = {
                status_transaksi: typeReject === 'pembatalan' ? 0 : findVerven[i].status_transaksi, // eslint-disable-line
                status_reject: 1,
                isreject: 1,
                reason: results.alasan,
                menu_rev: results.menu,
                people_reject: level,
                history: `${findVerven[i].history}, ${typeReject === 'pembatalan' ? histBatal : histRev}` // eslint-disable-line
              }
              const findRes = await vervendor.findByPk(findVerven[i].id)
              if (findRes) {
                await findRes.update(send)
                temp.push(1)
              }
            } else {
              const send = {
                status_transaksi: typeReject === 'pembatalan' ? 0 : findVerven[i].status_transaksi, // eslint-disable-line
                status_reject: 1,
                reason: results.alasan,
                menu_rev: results.menu,
                people_reject: level,
                history: `${findVerven[i].history}, ${typeReject === 'pembatalan' ? histBatal : histRev}` // eslint-disable-line
              }
              const findRes = await vervendor.findByPk(findVerven[i].id)
              if (findRes) {
                await findRes.update(send)
                temp.push(1)
              }
            }
          }
          if (temp.length) {
            return response(res, 'success reject ikk', {})
          } else {
            return response(res, 'success reject ikk', {})
          }
        } else {
          return response(res, 'failed reject ikk', {}, 404, false)
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
        no: joi.string().required(),
        list: joi.array()
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 404, false)
      } else {
        const findVerven = await vervendor.findAll({
          where: {
            no_transaksi: results.no
          }
        })
        if (findVerven.length > 0) {
          const temp = []
          for (let i = 0; i < findVerven.length; i++) {
            const send = {
              status_reject: 0,
              history: `${findVerven[i].history}, submit revisi by ${name} at ${moment().format('DD/MM/YYYY h:mm:ss a')}`
            }
            const findRes = await vervendor.findByPk(findVerven[i].id)
            if (findRes) {
              await findRes.update(send)
              temp.push(1)
            }
          }
          if (temp.length) {
            return response(res, 'success submit revisi ikk', {})
          } else {
            return response(res, 'success submit revisi ikk', {})
          }
        } else {
          return response(res, 'failed revisi ikk', {}, 404, false)
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getVerifVendor: async (req, res) => {
    try {
      const level = req.user.level
      const kode = req.user.kode
      const name = req.user.fullname
      const role = req.user.role
      const { status, reject, type, category, data, time1, time2, search } = req.query
      const searchValue = search || ''
      const statTrans = status === 'undefined' || status === null ? 2 : status
      const statRej = reject === 'undefined' ? 'all' : reject
      const statData = data === 'undefined' ? 'all' : data
      const timeVal1 = time1 === 'undefined' ? 'all' : time1
      const timeVal2 = time2 === 'undefined' ? 'all' : time2
      const timeV1 = new Date(timeVal1)
      const timeV2 = new Date(timeVal1 !== 'all' && timeVal1 === timeVal2 ? moment(timeVal2).add(1, 'd') : moment(timeVal2).add(1, 'd'))
      if (level === 5) {
        const findVerif = await vervendor.findAll({
          where: {
            kode_plant: kode,
            [Op.and]: [
              statTrans === 'all' ? { [Op.not]: { id: null } } : { status_transaksi: statTrans },
              statRej === 'all' ? { [Op.not]: { id: null } } : { status_reject: statRej },
              timeVal1 === 'all'
                ? { [Op.not]: { id: null } }
                : {
                    start_transaksi: {
                      [Op.gte]: timeV1,
                      [Op.lt]: timeV2
                    }
                  },
              { [Op.not]: { status_transaksi: null } },
              { [Op.not]: { status_transaksi: 1 } },
              category === 'revisi' ? { [Op.not]: { status_transaksi: 0 } } : { [Op.not]: { id: null } }
            ],
            [Op.or]: [
              { no_transaksi: { [Op.like]: `%${searchValue}%` } },
              { nama: { [Op.like]: `%${searchValue}%` } },
              { npwp: { [Op.like]: `%${searchValue}%` } },
              { alamat: { [Op.like]: `%${searchValue}%` } },
              { nik: { [Op.like]: `%${searchValue}%` } }
            ]
          },
          order: [
            ['id', 'ASC']
          ],
          include: [
            {
              model: finance,
              as: 'depo'
            }
          ]
        })
        const data = []
        findVerif.map(x => {
          return (
            data.push(x.no_transaksi)
          )
        })
        const set = new Set(data)
        const noDis = [...set]
        if (findVerif) {
          const newVerven = filter(type, findVerif, noDis, statData, role)
          return response(res, 'success get data verven', { result: findVerif, noDis, newVerven })
        } else {
          return response(res, 'success get data verven', { result: findVerif, noDis, newVerven: [] })
        }
      } else if (access.find(item => item === level) !== undefined) {
        const findDepo = await finance.findAll({
          where: {
            [Op.or]: [
              { pic_tax: level === 4 ? name : 'undefined' },
              { manager_tax: level === 14 ? name : 'undefined' }
            ]
          }
        })
        if (findDepo) {
          const hasil = []
          for (let i = 0; i < findDepo.length; i++) {
            const result = await vervendor.findAll({
              where: {
                kode_plant: findDepo[i].kode_plant,
                [Op.and]: [
                  statTrans === 'all' ? { [Op.not]: { status_transaksi: null } } : { status_transaksi: statTrans },
                  statRej === 'all' ? { [Op.not]: { start_transaksi: null } } : { status_reject: statRej },
                  timeVal1 === 'all'
                    ? { [Op.not]: { id: null } }
                    : {
                        start_transaksi: {
                          [Op.gte]: timeV1,
                          [Op.lt]: timeV2
                        }
                      }
                ],
                [Op.or]: [
                  { no_transaksi: { [Op.like]: `%${searchValue}%` } },
                  { kode_plant: { [Op.like]: `%${searchValue}%` } },
                  { nama: { [Op.like]: `%${searchValue}%` } },
                  { npwp: { [Op.like]: `%${searchValue}%` } },
                  { alamat: { [Op.like]: `%${searchValue}%` } },
                  { nik: { [Op.like]: `%${searchValue}%` } }
                ]
              },
              order: [
                ['id', 'ASC']
              ],
              include: [
                {
                  model: finance,
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
                data.push(x.no_transaksi)
              )
            })
            const set = new Set(data)
            const noDis = [...set]
            const result = hasil
            const newVerven = filter(type, result, noDis, statData, role)
            return response(res, 'success get verven', { result, noDis, findDepo, newVerven })
          } else {
            const result = hasil
            const noDis = []
            return response(res, 'success get verven', { result, noDis, findDepo, newVerven: [] })
          }
        } else {
          return response(res, 'failed get verven', {}, 400, false)
        }
      } else {
        const findVerif = await vervendor.findAll({
          where: {
            [Op.and]: [
              statTrans === 'all' ? { [Op.not]: { status_transaksi: null } } : { status_transaksi: statTrans },
              statRej === 'all' ? { [Op.not]: { id: null } } : { status_reject: statRej },
              timeVal1 === 'all'
                ? { [Op.not]: { id: null } }
                : {
                    start_transaksi: {
                      [Op.gte]: timeV1,
                      [Op.lt]: timeV2
                    }
                  }
            ],
            [Op.or]: [
              { no_transaksi: { [Op.like]: `%${searchValue}%` } },
              { kode_plant: { [Op.like]: `%${searchValue}%` } },
              { nama: { [Op.like]: `%${searchValue}%` } },
              { npwp: { [Op.like]: `%${searchValue}%` } },
              { alamat: { [Op.like]: `%${searchValue}%` } },
              { nik: { [Op.like]: `%${searchValue}%` } }
            ]
          },
          order: [
            ['id', 'ASC']
          ],
          include: [
            {
              model: finance,
              as: 'depo'
            }
          ]
        })
        const data = []
        findVerif.map(x => {
          return (
            data.push(x.no_transaksi)
          )
        })
        const set = new Set(data)
        const noDis = [...set]
        if (findVerif) {
          const newVerven = filter(type, findVerif, noDis, statData, role)
          return response(res, 'success get data verven', { result: findVerif, noDis, newVerven })
        } else {
          return response(res, 'success get data verven', { result: findVerif, noDis })
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getDetailVerven: async (req, res) => {
    try {
      const { no } = req.body
      const findVerven = await vervendor.findAll({
        where: {
          no_transaksi: no
        },
        order: [
          ['id', 'ASC']
        ],
        include: [
          {
            model: finance,
            as: 'depo'
          }
        ]
      })
      if (findVerven) {
        return response(res, 'success get dokumen', { result: findVerven })
      } else {
        return response(res, 'failed get dokumen', { result: [] })
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getDetailId: async (req, res) => {
    try {
      const { id } = req.params
      const findVerven = await vervendor.findOne({
        where: {
          id: id
        },
        order: [
          ['id', 'ASC']
        ],
        include: [
          {
            model: finance,
            as: 'depo'
          }
        ]
      })
      if (findVerven) {
        return response(res, 'success get dokumen', { result: findVerven })
      } else {
        return response(res, 'failed get dokumen', { result: [] })
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  EditVerven: async (req, res) => {
    try {
      const id = req.params.id
      const schema = joi.object({
        nama: joi.string().required(),
        no_npwp: joi.string().allow(''),
        no_ktp: joi.string().allow(''),
        alamat: joi.string().required(),
        jenis: joi.string().allow(''),
        type_skb: joi.string().required(),
        no_skb: joi.string().allow(''),
        no_skt: joi.string().allow(''),
        datef_skb: joi.string().allow(''),
        datel_skb: joi.string().allow('')
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 404, false)
      } else {
        const findAjuanVendor = await vervendor.findOne({
          where: {
            [Op.or]: [
              // { nama: { [Op.like]: `%${results.nama}` } },
              // { npwp: { [Op.like]: `%${results.no_npwp}%` } },
              // { nik: { [Op.like]: `%${results.no_ktp}%` } },
              // { alamat: { [Op.like]: `%${results.alamat}%` } }
              results.no_ktp === '' || results.no_ktp === '0000000000000000' ? { id: 'undefined' } : { nik: { [Op.like]: `%${results.no_ktp}%` } },
              results.no_npwp === '' || results.no_npwp === '000000000000000' ? { id: 'undefined' } : { npwp: { [Op.like]: `%${results.no_npwp}%` } }
            ],
            [Op.and]: [
              results.type_skb === 'SKB'
                ? { no_skb: { [Op.like]: `%${results.no_skb}%` } }
                : results.type_skb === 'SKT'
                  ? { no_skt: { [Op.like]: `%${results.no_skt}%` } }
                  : {
                      [Op.or]: [
                        { type_skb: 'tidak' },
                        { type_skb: null }
                      ]
                    }
            ],
            [Op.not]: {
              id: id
            }
          }
        })
        const findNameVendor = await vendor.findOne({
          where: {
            [Op.or]: [
              // { nama: { [Op.like]: `%${results.nama}` } },
              // { no_npwp: { [Op.like]: `%${results.no_npwp}%` } },
              results.no_ktp === '' || results.no_ktp === '0000000000000000' ? { id: 'undefined' } : { no_ktp: { [Op.like]: `%${results.no_ktp}%` } },
              results.no_npwp === '' || results.no_npwp === '000000000000000' ? { id: 'undefined' } : { no_npwp: { [Op.like]: `%${results.no_npwp}%` } }
              // { alamat: { [Op.like]: `%${results.alamat}%` } }
            ],
            [Op.and]: [
              results.type_skb === 'SKB'
                ? { no_skb: { [Op.like]: `%${results.no_skb}%` } }
                : results.type_skb === 'SKT'
                  ? { no_skt: { [Op.like]: `%${results.no_skt}%` } }
                  : {
                      [Op.or]: [
                        { type_skb: 'tidak' },
                        { type_skb: null }
                      ]
                    }
            ]
          }
        })
        if (findNameVendor || findAjuanVendor) {
          return response(res, 'vendor telah terdftar', {}, 404, false)
        } else {
          const tipe = results.type_skb
          const findVendor = await vervendor.findByPk(id)
          if (findVendor) {
            const data = {
              nama: results.nama,
              npwp: results.no_npwp,
              nik: results.no_ktp,
              alamat: results.alamat,
              type_skb: tipe,
              jenis_vendor: results.jenis,
              no_skb: tipe === 'SKB' ? results.no_skb : null,
              no_skt: tipe === 'SKT' ? results.no_skt : null,
              datef_skb: tipe !== 'tidak' ? results.datef_skb : null,
              datel_skb: tipe !== 'tidak' ? results.datel_skb : null
            }
            const updateVendor = await findVendor.update(data)
            if (updateVendor) {
              return response(res, 'success update vendor')
            } else {
              return response(res, 'false update vendor', {}, 404, false)
            }
          } else {
            return response(res, 'false create vendor', {}, 404, false)
          }
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  uploadMasterVendor: async (req, res) => {
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
        const cek = ['NAMA', 'NO NPWP', 'NO KTP', 'ALAMAT']
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
            cost.push(`Nama ${a[0]} ${i} dan alamat ${a[3]}`)
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
              const dataVendor = rows[i]
              const select = await vendor.findOne({
                where: {
                  [Op.and]: [
                    { nama: { [Op.like]: `%${dataVendor[0]}%` } },
                    { no_npwp: { [Op.like]: `%${dataVendor[1]}%` } },
                    { no_ktp: { [Op.like]: `%${dataVendor[2]}%` } },
                    { alamat: { [Op.like]: `%${dataVendor[3]}%` } }
                  ]
                }
              })
              if (select) {
                const data = {
                  nama: dataVendor[0],
                  no_npwp: dataVendor[1],
                  no_ktp: dataVendor[2],
                  alamat: dataVendor[3]
                }
                const upbank = await select.update(data)
                if (upbank) {
                  arr.push(1)
                }
              } else {
                const data = {
                  nama: dataVendor[0],
                  no_npwp: dataVendor[1],
                  no_ktp: dataVendor[2],
                  alamat: dataVendor[3]
                }
                const createVendor = await vendor.create(data)
                if (createVendor) {
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
  getVendor: async (req, res) => {
    try {
      // const kode = req.user.kode
      const findVendor = await vendor.findAll()
      if (findVendor.length > 0) {
        return response(res, 'succes get vendor', { result: findVendor, length: findVendor.length })
      } else {
        return response(res, 'failed get vendor', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getAllVendor: async (req, res) => {
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
      const findVendor = await vendor.findAndCountAll({
        where: {
          [Op.or]: [
            { nama: { [Op.like]: `%${searchValue}%` } },
            { no_npwp: { [Op.like]: `%${searchValue}%` } },
            { no_ktp: { [Op.like]: `%${searchValue}%` } },
            { alamat: { [Op.like]: `%${searchValue}%` } }
          ]
        },
        order: [[sortValue, 'ASC']],
        limit: limit,
        offset: (page - 1) * limit
      })
      const pageInfo = pagination('/vendor/get', req.query, page, limit, findVendor.count)
      if (findVendor) {
        return response(res, 'succes get vendor', { result: findVendor, pageInfo })
      } else {
        return response(res, 'failed get vendor', { result: [], pageInfo })
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getDetailVendor: async (req, res) => {
    try {
      const id = req.params.id
      const findVendor = await vendor.findByPk(id)
      if (findVendor) {
        return response(res, 'succes get detail vendor', { result: findVendor })
      } else {
        return response(res, 'failed get vendor', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  deleteVendor: async (req, res) => {
    try {
      const id = req.params.id
      const findVendor = await vendor.findByPk(id)
      if (findVendor) {
        const delVendor = await findVendor.destroy()
        if (delVendor) {
          return response(res, 'succes delete vendor', { result: findVendor })
        } else {
          return response(res, 'failed destroy vendor', {}, 404, false)
        }
      } else {
        return response(res, 'failed get vendor', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  exportSqlVendor: async (req, res) => {
    try {
      const result = await vendor.findAll()
      if (result) {
        const workbook = new excel.Workbook()
        const worksheet = workbook.addWorksheet()
        const arr = []
        const header = ['NAMA', 'NO NPWP', 'NO KTP', 'ALAMAT']
        const key = ['nama', 'no_npwp', 'no_ktp', 'alamat']
        for (let i = 0; i < header.length; i++) {
          let temp = { header: header[i], key: key[i] }
          arr.push(temp)
          temp = {}
        }
        worksheet.columns = arr
        const cek = worksheet.addRows(result)
        if (cek) {
          const name = new Date().getTime().toString().concat('-vendor').concat('.xlsx')
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
      const findVendor = await vendor.findAll()
      if (findVendor) {
        const temp = []
        for (let i = 0; i < findVendor.length; i++) {
          const findDel = await vendor.findByPk(findVendor[i].id)
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
