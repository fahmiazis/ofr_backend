const { ikk, depo, docuser, approve, ttd, role, document, veriftax, faktur } = require('../models')
const joi = require('joi')
const { Op } = require('sequelize')
const response = require('../helpers/response')
const moment = require('moment')
const uploadHelper = require('../helpers/upload')
const multer = require('multer')
const { filterApp, filter, filterBayar } = require('../helpers/pagination')
const access = [10, 11, 12, 2, 7, 8, 9, 4, 14]

module.exports = {
  addCart: async (req, res) => {
    try {
      const kode = req.user.kode
      const idTrans = req.params.id
      // const name = req.user.name
      // const level = req.user.level
      const schema = joi.object({
        no_coa: joi.string().required(),
        uraian: joi.string().required(),
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
        tgl_tagihanbayar: joi.date().required(),
        nilai_buku: joi.string().allow(''),
        nilai_utang: joi.string().allow(''),
        nilai_vendor: joi.string().allow(''),
        nilai_bayar: joi.string().allow(''),
        jenis_pph: joi.string().allow(''),
        user_jabatan: joi.string().allow(''),
        no_bpkk: joi.string().required(),
        tgl_faktur: joi.string().allow(''),
        typeniknpwp: joi.string().allow('')
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
            const findDraft = await ikk.findOne({
              where: {
                kode_plant: kode,
                [Op.or]: [
                  { status_transaksi: null },
                  { status_transaksi: 1 }
                ]
              }
            })
            const send = {
              no_bpkk: results.no_bpkk,
              user_jabatan: results.user_jabatan,
              kode_plant: findDepo[0].kode_plant,
              area: findDepo[0].area,
              cost_center: findDepo[0].cost_center,
              no_coa: results.no_coa,
              sub_coa: result.jenis_transaksi,
              nama_coa: result.gl_name,
              uraian: results.uraian,
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
              nilai_bayar: results.nilai_bayar,
              jenis_pph: results.jenis_pph,
              jenis_vendor: result.type_transaksi,
              tgl_faktur: results.tgl_faktur,
              typeniknpwp: results.typeniknpwp
            }
            if (findDraft) {
              // const month = moment(results.periode_awal).format('DD MMMM YYYY')
              // const monthLast = moment(results.periode_akhir).format('DD MMMM YYYY')
              // const monthCom = moment(findDraft.periode_awal).format('DD MMMM YYYY')
              // const monthComLast = moment(findDraft.periode_akhir).format('DD MMMM YYYY')
              // if (findDraft.no_coa === results.no_coa && month === monthCom && monthLast === monthComLast) {
              if (findDraft) {
                if (results.no_faktur !== '' && results.no_faktur !== undefined) {
                  const findFaktur = await faktur.findOne({
                    where: {
                      no_faktur: results.no_faktur
                    }
                  })
                  const findData = await ikk.findOne({
                    where: {
                      no_faktur: results.no_faktur
                    }
                  })
                  if (findData) {
                    return response(res, 'No faktur telah expired', {}, 400, false)
                  } else {
                    const dataEdit = {
                      status: 'inactive'
                    }
                    const editFaktur = await findFaktur.update(dataEdit)
                    if (editFaktur) {
                      const sendData = await ikk.create(send)
                      if (sendData) {
                        return response(res, 'success add ikk1', { result: sendData })
                      } else {
                        return response(res, 'failed add ikk 7', {}, 400, false)
                      }
                    } else {
                      return response(res, 'failed add ikk 8', {}, 400, false)
                    }
                  }
                } else {
                  const sendData = await ikk.create(send)
                  if (sendData) {
                    return response(res, 'success add ikk1', { result: sendData })
                  } else {
                    return response(res, 'failed add ikk 7', {}, 400, false)
                  }
                }
              } else {
                return response(res, 'Pastikan program dan periode sama dalam satu pengajuan', {}, 400, false)
              }
            } else {
              const findIkk = await ikk.findOne({
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
              if (findIkk) {
                const month = moment(results.periode_awal).format('DD MMMM YYYY')
                const monthLast = moment(results.periode_akhir).format('DD MMMM YYYY')
                const monthCom = moment(findIkk.periode_awall).format('DD MMMM YYYY')
                const monthComLast = moment(findIkk.periode_akhir).format('DD MMMM YYYY')
                if (findIkk.sub_coa === result.jenis_transaksi && month === monthCom && monthLast === monthComLast) {
                  return response(res, 'data ini telah diajukan pada pengajuan sebelumnya', { result: findIkk })
                } else {
                  if (results.no_faktur !== '' && results.no_faktur !== undefined) {
                    const findFaktur = await faktur.findOne({
                      where: {
                        no_faktur: results.no_faktur
                      }
                    })
                    const findData = await ikk.findOne({
                      where: {
                        no_faktur: results.no_faktur
                      }
                    })
                    if (findData) {
                      return response(res, 'No faktur telah expired', {}, 400, false)
                    } else {
                      const dataEdit = {
                        status: 'inactive'
                      }
                      const editFaktur = await findFaktur.update(dataEdit)
                      if (editFaktur) {
                        const sendData = await ikk.create(send)
                        if (sendData) {
                          return response(res, 'success add ikk1', { result: sendData })
                        } else {
                          return response(res, 'failed add ikk 7', {}, 400, false)
                        }
                      } else {
                        return response(res, 'failed add ikk 8', {}, 400, false)
                      }
                    }
                  } else {
                    const sendData = await ikk.create(send)
                    if (sendData) {
                      return response(res, 'success add ikk1', { result: sendData })
                    } else {
                      return response(res, 'failed add ikk 7', {}, 400, false)
                    }
                  }
                }
              } else {
                if (results.no_faktur !== '' && results.no_faktur !== undefined) {
                  const findFaktur = await faktur.findOne({
                    where: {
                      no_faktur: results.no_faktur
                    }
                  })
                  const findData = await ikk.findOne({
                    where: {
                      no_faktur: results.no_faktur
                    }
                  })
                  if (findData) {
                    return response(res, 'No faktur telah expired', {}, 400, false)
                  } else {
                    const dataEdit = {
                      status: 'inactive'
                    }
                    const editFaktur = await findFaktur.update(dataEdit)
                    if (editFaktur) {
                      const sendData = await ikk.create(send)
                      if (sendData) {
                        return response(res, 'success add ikk1', { result: sendData })
                      } else {
                        return response(res, 'failed add ikk 7', {}, 400, false)
                      }
                    } else {
                      return response(res, 'failed add ikk 8', {}, 400, false)
                    }
                  }
                } else {
                  const sendData = await ikk.create(send)
                  if (sendData) {
                    return response(res, 'success add ikk1', { result: sendData })
                  } else {
                    return response(res, 'failed add ikk 7', {}, 400, false)
                  }
                }
              }
            }
          } else {
            return response(res, 'failed add ikk 3', {}, 400, false)
          }
        } else {
          return response(res, 'failed add ikk 1', {}, 400, false)
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getCartIkk: async (req, res) => {
    try {
      const kode = req.user.kode
      const findDepo = await depo.findOne({
        where: {
          kode_plant: kode
        }
      })
      if (findDepo) {
        const findIkk = await ikk.findAll({
          where: {
            kode_plant: kode,
            [Op.or]: [
              { status_transaksi: 1 },
              { status_transaksi: null }
            ]
          }
        })
        if (findIkk) {
          return response(res, 'success get cart ikk', { result: findIkk, depo: findDepo })
        } else {
          return response(res, 'failed get cart', {}, 404, false)
        }
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
      const findIkk = await ikk.findByPk(id)
      if (findIkk.no_faktur !== null && findIkk.no_faktur !== undefined) {
        const findFaktur = await faktur.findOne({
          where: {
            no_faktur: findIkk.no_faktur
          }
        })
        if (findFaktur) {
          const dataEdit = {
            status: null
          }
          const editFaktur = await findFaktur.update(dataEdit)
          if (editFaktur) {
            await findIkk.destroy()
            return response(res, 'success delete cart ikk', { result: findIkk })
          } else {
            return response(res, 'failed delete carrt ikk 1', {}, 400, false)
          }
        } else {
          return response(res, 'failed delete carrt ikk 2', {}, 400, false)
        }
      } else {
        await findIkk.destroy()
        return response(res, 'success delete cart ikk', { result: findIkk })
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  submitIkk: async (req, res) => {
    try {
      const kode = req.user.kode
      const schema = joi.object({
        list: joi.array()
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 404, false)
      } else {
        const listId = results.list
        const findNo = await ikk.findAll({
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
        const noIkk = Math.max(...cekNo) + 1
        const findIkk = await ikk.findAll({
          where: {
            kode_plant: kode,
            [Op.or]: [
              { status_transaksi: null },
              { status_transaksi: 1 }
            ]
          }
        })
        if (findIkk.length > 0) {
          const temp = []
          const change = noIkk.toString().split('')
          const notrans = change.length === 2 ? '00' + noIkk : change.length === 1 ? '000' + noIkk : change.length === 3 ? '0' + noIkk : noIkk
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
          const tempData = findIkk.find(({no_transaksi}) => no_transaksi !== null) // eslint-disable-line
          const cekData = tempData === undefined ? 'ya' : 'no'
          const noTrans = `${notrans}/${kode}/${rome}/${year}-IKK`
          const data = {
            status_transaksi: 1,
            no_transaksi: noTrans
          }
          const dataRes = {
            status_transaksi: null,
            no_transaksi: null
          }
          for (let i = 0; i < findIkk.length; i++) {
            if (listId.find(e => e === findIkk[i].id)) {
              const findDraft = await ikk.findByPk(findIkk[i].id)
              if (findDraft) {
                const upIkk = await findDraft.update(data)
                if (upIkk) {
                  temp.push(1)
                }
              }
            } else {
              const findDraft = await ikk.findByPk(findIkk[i].id)
              if (findDraft) {
                const upIkk = await findDraft.update(dataRes)
                if (upIkk) {
                  temp.push(1)
                }
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
                  return response(res, 'success submit cart', { noikk: noTrans })
                } else {
                  return response(res, 'success submit cart', { noikk: noTrans })
                }
              } else {
                return response(res, 'success submit cart', { noikk: noTrans })
              }
            } else {
              return response(res, 'success submit cart', { noikk: noTrans })
            }
          } else {
            return response(res, 'failed submit cart', { noikk: noTrans })
          }
        } else {
          return response(res, 'failed submit cart', {}, 404, false)
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  submitIkkFinal: async (req, res) => {
    try {
      const { no } = req.body
      const kode = req.user.kode
      const findIkk = await ikk.findAll({
        where: {
          no_transaksi: no,
          kode_plant: kode,
          status_transaksi: 1
        }
      })
      if (findIkk) {
        const temp = []
        for (let i = 0; i < findIkk.length; i++) {
          const data = {
            status_transaksi: 2,
            history: `submit pengajuan ikk by ${kode} at ${moment().format('DD/MM/YYYY h:mm:ss a')}`,
            start_ikk: moment()
          }
          const findData = await ikk.findByPk(findIkk[i].id)
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
    const level = req.user.level
    const name = req.user.name
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
            divisi: 'ikk',
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
              { jenis: 'Ikk' },
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
            { jenis: 'Ikk' },
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
  getIkk: async (req, res) => {
    try {
      const level = req.user.level
      const kode = req.user.kode
      const name = req.user.name
      const role = req.user.role
      const { status, reject, menu, type, category, data, time1, time2 } = req.query
      const statTrans = status === 'undefined' || status === null ? 2 : status
      const statRej = reject === 'undefined' ? null : reject
      const statMenu = menu === 'undefined' ? null : menu
      const statData = data === 'undefined' ? null : data
      const timeVal1 = time1 === 'undefined' ? 'all' : time1
      const timeVal2 = time2 === 'undefined' ? 'all' : time2
      const timeV1 = new Date(timeVal1)
      const timeV2 = new Date(timeVal1 !== 'all' && timeVal1 === timeVal2 ? moment(timeVal2).add(1, 'd') : timeVal2)
      if (level === 5) {
        const findIkk = await ikk.findAll({
          where: {
            kode_plant: kode,
            [Op.and]: [
              statTrans === 'all' ? { [Op.not]: { id: null } } : { status_transaksi: statTrans },
              statRej === 'all' ? { [Op.not]: { id: null } } : { status_reject: statRej },
              statMenu === 'all' ? { [Op.not]: { id: null } } : { menu_rev: { [Op.like]: `%${statMenu}%` } },
              timeVal1 === 'all'
                ? { [Op.not]: { id: null } }
                : {
                    start_ikk: {
                      [Op.gte]: timeV1,
                      [Op.lt]: timeV2
                    }
                  },
              { [Op.not]: { status_transaksi: null } },
              { [Op.not]: { status_transaksi: 1 } }
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
        findIkk.map(x => {
          return (
            data.push(x.no_transaksi)
          )
        })
        const set = new Set(data)
        const noDis = [...set]
        if (findIkk) {
          const newIkk = category === 'verif' ? filter(type, findIkk, noDis, statData, role) : filterApp(type, findIkk, noDis, role)
          return response(res, 'success get data ikk', { result: findIkk, noDis, newIkk })
        } else {
          return response(res, 'success get data ikk', { result: findIkk, noDis, newIkk: [] })
        }
      } else if (access.find(item => item === level) !== undefined) {
        const findDepo = await depo.findAll({
          where: {
            [Op.or]: [
              { bm: level === 10 ? name : 'undefined' },
              { om: level === 11 ? name : 'undefined' },
              { nom: level === 12 ? name : 'undefined' },
              { pic_finance: level === 2 ? name : 'undefined' },
              { spv_finance: level === 7 ? name : 'undefined' },
              { asman_finance: level === 8 ? name : 'undefined' },
              { manager_finance: level === 9 ? name : 'undefined' },
              { pic_tax: level === 4 ? name : 'undefined' },
              { manager_tax: level === 14 ? name : 'undefined' }
            ]
          }
        })
        if (findDepo) {
          const hasil = []
          for (let i = 0; i < findDepo.length; i++) {
            const result = await ikk.findAll({
              where: {
                kode_plant: findDepo[i].kode_plant,
                [Op.and]: [
                  statTrans === 'all' ? { [Op.not]: { status_transaksi: null } } : { status_transaksi: statTrans },
                  statRej === 'all' ? { [Op.not]: { id: null } } : { status_reject: statRej },
                  statMenu === 'all' ? { [Op.not]: { id: null } } : { menu_rev: { [Op.like]: `%${statMenu}%` } },
                  category === 'ajuan bayar' ? { [Op.not]: { no_pembayaran: null } } : { [Op.not]: { id: null } },
                  timeVal1 === 'all'
                    ? { [Op.not]: { id: null } }
                    : {
                        start_ikk: {
                          [Op.gte]: timeV1,
                          [Op.lt]: timeV2
                        }
                      }
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
            const newIkk = category === 'ajuan bayar' ? filterBayar(type, result, noDis, statTrans, role) : category === 'verif' ? filter(type, result, noDis, statData, role) : filterApp(type, result, noDis, role)
            return response(res, 'success get ikk', { result, noDis, findDepo, newIkk })
          } else {
            const result = hasil
            const noDis = []
            return response(res, 'success get ikk', { result, noDis, findDepo, newIkk: [] })
          }
        } else {
          return response(res, 'failed get ikk', {}, 400, false)
        }
      } else {
        const findIkk = await ikk.findAll({
          where: {
            [Op.and]: [
              statTrans === 'all' ? { [Op.not]: { status_transaksi: null } } : { status_transaksi: statTrans },
              statRej === 'all' ? { [Op.not]: { id: null } } : { status_reject: statRej },
              statMenu === 'all' ? { [Op.not]: { id: null } } : { menu_rev: { [Op.like]: `%${statMenu}%` } },
              timeVal1 === 'all'
                ? { [Op.not]: { id: null } }
                : {
                    start_ikk: {
                      [Op.gte]: timeV1,
                      [Op.lt]: timeV2
                    }
                  }
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
        const data = []
        findIkk.map(x => {
          return (
            data.push(x.no_transaksi)
          )
        })
        const set = new Set(data)
        const noDis = [...set]
        if (findIkk) {
          const newIkk = category === 'verif' ? filter(type, findIkk, noDis, statData, role) : filterApp(type, findIkk, noDis, role)
          return response(res, 'success get data ikk', { result: findIkk, noDis, newIkk })
        } else {
          return response(res, 'success get data ikk', { result: findIkk, noDis })
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getDetailIkk: async (req, res) => {
    try {
      const { no, tipe } = req.body
      if (tipe === 'ajuan bayar') {
        const findIkk = await ikk.findAll({
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
        if (findIkk) {
          return response(res, 'success get dokumen', { result: findIkk })
        } else {
          return response(res, 'failed get dokumen', { result: [] })
        }
      } else {
        const findIkk = await ikk.findAll({
          where: {
            no_transaksi: no
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
        if (findIkk) {
          return response(res, 'success get dokumen', { result: findIkk })
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
      const findIkk = await ikk.findOne({
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
            model: depo,
            as: 'depo'
          }
        ]
      })
      if (findIkk) {
        return response(res, 'success get dokumen', { result: findIkk })
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
        const findIkk = await ikk.findOne({
          where: {
            no_transaksi: no
          }
        })
        if (findIkk) {
          const findDepo = await depo.findOne({
            where: {
              kode_plant: findIkk.kode_plant
            }
          })
          if (findDepo) {
            const findApp = await approve.findAll({
              where: {
                nama_approve: 'Pengajuan Ikk'
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
  approveIkk: async (req, res) => {
    try {
      const level = req.user.level
      const name = req.user.name
      const { no } = req.body
      const findIkk = await ikk.findAll({
        where: {
          no_transaksi: no
        }
      })
      if (findIkk.length > 0) {
        const findDepo = await depo.findOne({
          where: {
            kode_plant: findIkk[0].kode_plant
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
                          for (let i = 0; i < findIkk.length; i++) {
                            const send = {
                              status_transaksi: 3,
                              status_reject: null,
                              isreject: null,
                              tgl_fullarea: moment(),
                              history: `${findIkk[i].history}, approved by ${name} at ${moment().format('DD/MM/YYYY h:mm:ss a')}`
                            }
                            const findRes = await ikk.findByPk(findIkk[i].id)
                            if (findRes) {
                              await findRes.update(send)
                              temp.push(1)
                            }
                          }
                          if (temp.length) {
                            return response(res, 'success approve ikk', {})
                          } else {
                            return response(res, 'success approve ikk', {})
                          }
                        } else {
                          const temp = []
                          for (let i = 0; i < findIkk.length; i++) {
                            const send = {
                              status_reject: null,
                              isreject: null,
                              history: `${findIkk[i].history}, approved by ${name} at ${moment().format('DD/MM/YYYY h:mm:ss a')}`
                            }
                            const findRes = await ikk.findByPk(findIkk[i].id)
                            if (findRes) {
                              await findRes.update(send)
                              temp.push(1)
                            }
                          }
                          if (temp.length) {
                            return response(res, 'success approve ikk', {})
                          } else {
                            return response(res, 'success approve ikk', {})
                          }
                        }
                      } else {
                        return response(res, 'failed approve ikk', {}, 404, false)
                      }
                    } else {
                      return response(res, 'failed approve ikk', {}, 404, false)
                    }
                  } else {
                    return response(res, `${findTtd[arr - 1].jabatan} belum approve atau telah mereject`, {}, 404, false)
                  }
                }
              } else {
                return response(res, 'failed approve ikk', {}, 404, false)
              }
            } else {
              return response(res, 'failed approve ikk', {}, 404, false)
            }
          } else {
            return response(res, 'failed approve ikk', {}, 404, false)
          }
        } else {
          return response(res, 'failed approve ikk', {}, 404, false)
        }
      } else {
        return response(res, 'failed approve ikk', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  rejectIkk: async (req, res) => {
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
        const findIkk = await ikk.findAll({
          where: {
            no_transaksi: no
          }
        })
        if (findIkk.length > 0) {
          if (results.type === 'verif') {
            const temp = []
            for (let i = 0; i < findIkk.length; i++) {
              const listId = results.list
              if (listId.find(e => e === findIkk[i].id)) {
                const send = {
                  status_reject: 1,
                  isreject: 1,
                  reason: results.alasan,
                  menu_rev: results.menu,
                  history: `${findIkk[i].history}, reject by ${name} at ${moment().format('DD/MM/YYYY h:mm:ss a')}; reason: ${results.alasan}`
                }
                const findRes = await ikk.findByPk(findIkk[i].id)
                if (findRes) {
                  await findRes.update(send)
                  temp.push(1)
                }
              } else {
                const send = {
                  status_reject: 1,
                  reason: results.alasan,
                  menu_rev: results.menu,
                  history: `${findIkk[i].history}, reject by ${name} at ${moment().format('DD/MM/YYYY h:mm:ss a')}; reason: ${results.alasan}`
                }
                const findRes = await ikk.findByPk(findIkk[i].id)
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
            const findDepo = await depo.findOne({
              where: {
                kode_plant: findIkk[0].kode_plant
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
                              for (let i = 0; i < findIkk.length; i++) {
                                const listId = results.list
                                if (listId.find(e => e === findIkk[i].id)) {
                                  const send = {
                                    status_reject: 1,
                                    isreject: 1,
                                    reason: results.alasan,
                                    menu_rev: results.menu,
                                    history: `${findIkk[i].history}, reject by ${name} at ${moment().format('DD/MM/YYYY h:mm:ss a')}; reason: ${results.alasan}`
                                  }
                                  const findRes = await ikk.findByPk(findIkk[i].id)
                                  if (findRes) {
                                    await findRes.update(send)
                                    temp.push(1)
                                  }
                                } else {
                                  const send = {
                                    status_reject: 1,
                                    reason: results.alasan,
                                    menu_rev: results.menu,
                                    history: `${findIkk[i].history}, reject by ${name} at ${moment().format('DD/MM/YYYY h:mm:ss a')}; reason: ${results.alasan}`
                                  }
                                  const findRes = await ikk.findByPk(findIkk[i].id)
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
                              return response(res, 'failed reject ikk1', { findFull }, 404, false)
                            }
                          } else {
                            return response(res, 'failed reject ikk2', {}, 404, false)
                          }
                        } else {
                          return response(res, 'failed reject ikk3', {}, 404, false)
                        }
                      } else {
                        return response(res, `${findTtd[arr - 1].jabatan} belum approve atau telah mereject`, {}, 404, false)
                      }
                    }
                  } else {
                    return response(res, 'failed reject ikk4', {}, 404, false)
                  }
                } else {
                  return response(res, 'failed reject ikk5', {}, 404, false)
                }
              } else {
                return response(res, 'failed reject ikk6', {}, 404, false)
              }
            } else {
              return response(res, 'failed reject ikk7', {}, 404, false)
            }
          }
        } else {
          return response(res, 'failed reject ikk8', {}, 404, false)
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
        const findId = await ikk.findByPk(results.id)
        if (findId) {
          const data = {
            isreject: 0
          }
          const updateId = await findId.update(data)
          if (updateId) {
            return response(res, 'success revisi ikk')
          } else {
            return response(res, 'failed revisi ikk', {}, 404, false)
          }
        } else {
          return response(res, 'failed revisi ikk', {}, 404, false)
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  editIkk: async (req, res) => {
    try {
      const kode = req.user.kode
      const idTrans = req.params.idtrans
      const id = req.params.id
      // const name = req.user.name
      // const level = req.user.level
      const schema = joi.object({
        no_coa: joi.string().required(),
        uraian: joi.string().required(),
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
        tgl_tagihanbayar: joi.date().required(),
        nilai_buku: joi.string().allow(''),
        nilai_utang: joi.string().allow(''),
        nilai_vendor: joi.string().allow(''),
        nilai_bayar: joi.string().allow(''),
        jenis_pph: joi.string().allow(''),
        user_jabatan: joi.string().allow(''),
        no_bpkk: joi.string().required(),
        tgl_faktur: joi.string().allow(''),
        typeniknpwp: joi.string().allow('')
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
        const findUpdate = await ikk.findByPk(id)
        if (findUpdate && findDepo.length > 0) {
          const result = await veriftax.findByPk(idTrans)
          if (result) {
            const findDraft = await ikk.findOne({
              where: {
                kode_plant: kode,
                [Op.or]: [
                  { status_transaksi: null },
                  { status_transaksi: 1 }
                ]
              }
            })
            const send = {
              no_bpkk: results.no_bpkk,
              user_jabatan: results.user_jabatan,
              kode_plant: findDepo[0].kode_plant,
              area: findDepo[0].area,
              cost_center: findDepo[0].cost_center,
              no_coa: results.no_coa,
              sub_coa: result.jenis_transaksi,
              nama_coa: result.gl_name,
              uraian: results.uraian,
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
              nilai_bayar: results.nilai_bayar,
              jenis_pph: results.jenis_pph,
              jenis_vendor: result.type_transaksi,
              tgl_faktur: results.tgl_faktur,
              typeniknpwp: results.typeniknpwp
            }
            if (findDraft) {
              // const month = moment(results.periode_awal).format('DD MMMM YYYY')
              // const monthLast = moment(results.periode_akhir).format('DD MMMM YYYY')
              // const monthCom = moment(findDraft.periode_awal).format('DD MMMM YYYY')
              // const monthComLast = moment(findDraft.periode_akhir).format('DD MMMM YYYY')
              // if (findDraft.no_coa === results.no_coa && month === monthCom && monthLast === monthComLast) {
              if (findDraft) {
                if (results.no_faktur !== '' && results.no_faktur !== undefined) {
                  const findFaktur = await faktur.findOne({
                    where: {
                      no_faktur: results.no_faktur
                    }
                  })
                  const findFakdit = await faktur.findOne({
                    where: {
                      no_faktur: findUpdate.no_faktur
                    }
                  })
                  const findData = await ikk.findOne({
                    where: {
                      no_faktur: results.no_faktur,
                      [Op.not]: {
                        id: id
                      }
                    }
                  })
                  if (findData) {
                    return response(res, 'No faktur telah expired', {}, 400, false)
                  } else {
                    const dataEdit = {
                      status: 'inactive'
                    }
                    const dataNull = {
                      status: null
                    }
                    const editLate = await findFakdit.update(dataNull)
                    if (editLate) {
                      const editFaktur = await findFaktur.update(dataEdit)
                      const sendData = await findUpdate.update(send)
                      if (sendData && editFaktur) {
                        return response(res, 'success add ikk1', { result: sendData })
                      } else {
                        return response(res, 'failed add ikk 7', {}, 400, false)
                      }
                    } else {
                      return response(res, 'failed add ikk 8', {}, 400, false)
                    }
                  }
                } else {
                  const sendData = await findUpdate.update(send)
                  if (sendData) {
                    return response(res, 'success add ikk1', { result: sendData })
                  } else {
                    return response(res, 'failed add ikk 7', {}, 400, false)
                  }
                }
              } else {
                return response(res, 'Pastikan program dan periode sama dalam satu pengajuan', {}, 400, false)
              }
            } else {
              const findIkk = await ikk.findOne({
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
              if (findIkk) {
                const month = moment(results.periode_awal).format('DD MMMM YYYY')
                const monthLast = moment(results.periode_akhir).format('DD MMMM YYYY')
                const monthCom = moment(findIkk.periode_awall).format('DD MMMM YYYY')
                const monthComLast = moment(findIkk.periode_akhir).format('DD MMMM YYYY')
                if (findIkk.sub_coa === result.jenis_transaksi && month === monthCom && monthLast === monthComLast) {
                  return response(res, 'data ini telah diajukan pada pengajuan sebelumnya', { result: findIkk })
                } else {
                  if (results.no_faktur !== '' && results.no_faktur !== undefined) {
                    const findFaktur = await faktur.findOne({
                      where: {
                        no_faktur: results.no_faktur
                      }
                    })
                    const findFakdit = await faktur.findOne({
                      where: {
                        no_faktur: findUpdate.no_faktur
                      }
                    })
                    const findData = await ikk.findOne({
                      where: {
                        no_faktur: results.no_faktur,
                        [Op.not]: {
                          id: id
                        }
                      }
                    })
                    if (findData) {
                      return response(res, 'No faktur telah expired', {}, 400, false)
                    } else {
                      const dataEdit = {
                        status: 'inactive'
                      }
                      const dataNull = {
                        status: null
                      }
                      const editLate = await findFakdit.update(dataNull)
                      if (editLate) {
                        const editFaktur = await findFaktur.update(dataEdit)
                        const sendData = await findUpdate.update(send)
                        if (sendData && editFaktur) {
                          return response(res, 'success add ikk1', { result: sendData })
                        } else {
                          return response(res, 'failed add ikk 7', {}, 400, false)
                        }
                      } else {
                        return response(res, 'failed add ikk 8', {}, 400, false)
                      }
                    }
                  } else {
                    const sendData = await findUpdate.update(send)
                    if (sendData) {
                      return response(res, 'success add ikk1', { result: sendData })
                    } else {
                      return response(res, 'failed add ikk 7', {}, 400, false)
                    }
                  }
                }
              } else {
                if (results.no_faktur !== '' && results.no_faktur !== undefined) {
                  const findFaktur = await faktur.findOne({
                    where: {
                      no_faktur: results.no_faktur
                    }
                  })
                  const findFakdit = await faktur.findOne({
                    where: {
                      no_faktur: findUpdate.no_faktur
                    }
                  })
                  const findData = await ikk.findOne({
                    where: {
                      no_faktur: results.no_faktur,
                      [Op.not]: {
                        id: id
                      }
                    }
                  })
                  if (findData) {
                    return response(res, 'No faktur telah expired', {}, 400, false)
                  } else {
                    const dataEdit = {
                      status: 'inactive'
                    }
                    const dataNull = {
                      status: null
                    }
                    const editLate = await findFakdit.update(dataNull)
                    if (editLate) {
                      const editFaktur = await findFaktur.update(dataEdit)
                      const sendData = await findUpdate.update(send)
                      if (sendData && editFaktur) {
                        return response(res, 'success add ikk1', { result: sendData })
                      } else {
                        return response(res, 'failed add ikk 7', {}, 400, false)
                      }
                    } else {
                      return response(res, 'failed add ikk 8', {}, 400, false)
                    }
                  }
                } else {
                  const sendData = await findUpdate.update(send)
                  if (sendData) {
                    return response(res, 'success add ikk1', { result: sendData })
                  } else {
                    return response(res, 'failed add ikk 7', {}, 400, false)
                  }
                }
              }
            }
          } else {
            return response(res, 'failed add ikk 3', {}, 400, false)
          }
        } else {
          return response(res, 'failed add ikk 1', {}, 400, false)
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
        const findIkk = await ikk.findAll({
          where: {
            no_transaksi: results.no
          }
        })
        if (findIkk.length > 0) {
          const temp = []
          for (let i = 0; i < findIkk.length; i++) {
            const send = {
              status_reject: 0,
              history: `${findIkk[i].history}, submit revisi by ${name} at ${moment().format('DD/MM/YYYY h:mm:ss a')}`
            }
            const findRes = await ikk.findByPk(findIkk[i].id)
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
        const findIkk = await ikk.findByPk(id)
        if (findIkk) {
          const data = {
            dpp: results.dpp,
            ppn: results.ppn,
            nilai_utang: results.nilai_utang
          }
          const updateIkk = await findIkk.update(data)
          if (updateIkk) {
            return response(res, 'success edit verif ikk', { updateIkk })
          } else {
            return response(res, 'failed edit verif ikk', {}, 404, false)
          }
        } else {
          return response(res, 'failed edit verif ikk', {}, 404, false)
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
            const findIkk = await ikk.findAll({
              where: {
                no_transaksi: list[i]
              }
            })
            if (findIkk.length > 0) {
              const cekData = findIkk.find(({jenis_pph}) => jenis_pph !== 'Non PPh') === undefined ? 'ya' : 'no' // eslint-disable-line
              const resData = level === 2 && cekData === 'ya' ? 5 : 4
              for (let h = 0; h < findIkk.length; h++) {
                const findRes = await ikk.findByPk(findIkk[h].id)
                if (findRes) {
                  const data = {
                    status_transaksi: level === 2 ? resData : 5,
                    status_reject: null,
                    isreject: null,
                    tgl_veriffin: level === 2 ? moment() : findRes.tgl_veriffin,
                    tgl_veriftax: level !== 2 ? moment() : findRes.tgl_veriftax,
                    history: `${findIkk[h].history}, verifikasi ${level === 2 ? 'finance' : 'tax'} by ${name} at ${moment().format('DD/MM/YYYY h:mm:ss a')}`
                  }
                  await findRes.update(data)
                  temp.push(findRes)
                }
              }
            }
          }
          if (temp.length > 0) {
            return response(res, 'success verifikasi ikk', {})
          } else {
            return response(res, 'success verifikasi ikk', {})
          }
        } else {
          const findIkk = await ikk.findAll({
            where: {
              no_transaksi: results.no
            }
          })
          if (findIkk.length > 0) {
            const temp = []
            const cekData = findIkk.find(({jenis_pph}) => jenis_pph !== 'Non PPh') === undefined ? 'ya' : 'no' // eslint-disable-line
            const resData = level === 2 && cekData === 'ya' ? 5 : 4
            for (let i = 0; i < findIkk.length; i++) {
              const findRes = await ikk.findByPk(findIkk[i].id)
              if (findRes) {
                const data = {
                  status_transaksi: level === 2 ? resData : 5,
                  status_reject: null,
                  isreject: null,
                  tgl_veriffin: level === 2 ? moment() : findRes.tgl_veriffin,
                  tgl_veriftax: level !== 2 ? moment() : findRes.tgl_veriftax,
                  history: `${findIkk[i].history}, verifikasi ${level === 2 ? 'finance' : 'tax'} by ${name} at ${moment().format('DD/MM/YYYY h:mm:ss a')}`
                }
                await findRes.update(data)
                temp.push(findRes)
              }
            }
            if (temp.length > 0) {
              return response(res, 'success verifikasi ikk', {})
            } else {
              return response(res, 'success verifikasi ikk', {})
            }
          } else {
            return response(res, 'failed submit verifikasi ikk', {}, 404, false)
          }
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
            const findIkk = await ikk.findAll({
              where: {
                no_transaksi: list[i]
              }
            })
            if (findIkk.length > 0) {
              for (let j = 0; j < findIkk.length; j++) {
                const send = {
                  status_transaksi: 6,
                  no_pembayaran: results.no_transfer,
                  tanggal_transfer: results.tgl_transfer,
                  tgl_sublist: moment(),
                  history: `${findIkk[j].history}, submit ajuan bayar by ${name} at ${moment().format('DD/MM/YYYY h:mm:ss a')}`
                }
                const findRes = await ikk.findByPk(findIkk[j].id)
                if (findRes) {
                  await findRes.update(send)
                  temp.push(1)
                }
              }
            }
          }
          if (temp.length) {
            return response(res, 'success submit ajuan bayar ikk', {})
          } else {
            return response(res, 'success submit ajuan bayar ikk', {})
          }
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
        const findIkk = await ikk.findOne({
          where: {
            no_pembayaran: no
          }
        })
        if (findIkk) {
          const findDepo = await depo.findOne({
            where: {
              kode_plant: findIkk.kode_plant
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
  approveListIkk: async (req, res) => {
    try {
      const level = req.user.level
      const name = req.user.name
      const { no } = req.body
      const findIkk = await ikk.findAll({
        where: {
          no_pembayaran: no
        }
      })
      if (findIkk.length > 0) {
        const findDepo = await depo.findOne({
          where: {
            kode_plant: findIkk[0].kode_plant
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
                          for (let i = 0; i < findIkk.length; i++) {
                            const send = {
                              status_transaksi: 7,
                              status_reject: null,
                              isreject: null,
                              tgl_fullsublist: moment(),
                              history: `${findIkk[i].history}, approved by ${name} at ${moment().format('DD/MM/YYYY h:mm:ss a')}`
                            }
                            const findRes = await ikk.findByPk(findIkk[i].id)
                            if (findRes) {
                              await findRes.update(send)
                              temp.push(1)
                            }
                          }
                          if (temp.length) {
                            return response(res, 'success approve ikk', {})
                          } else {
                            return response(res, 'success approve ikk', {})
                          }
                        } else {
                          const temp = []
                          for (let i = 0; i < findIkk.length; i++) {
                            const send = {
                              status_reject: null,
                              isreject: null,
                              history: `${findIkk[i].history}, approved by ${name} at ${moment().format('DD/MM/YYYY h:mm:ss a')}`
                            }
                            const findRes = await ikk.findByPk(findIkk[i].id)
                            if (findRes) {
                              await findRes.update(send)
                              temp.push(1)
                            }
                          }
                          if (temp.length) {
                            return response(res, 'success approve ikk', {})
                          } else {
                            return response(res, 'success approve ikk', {})
                          }
                        }
                      } else {
                        return response(res, 'failed approve ikk1', {}, 404, false)
                      }
                    } else {
                      return response(res, 'failed approve ikk2', {}, 404, false)
                    }
                  } else {
                    return response(res, `${findTtd[arr - 1].jabatan} belum approve atau telah mereject`, {}, 404, false)
                  }
                }
              } else {
                return response(res, 'failed approve ikk3', {}, 404, false)
              }
            } else {
              return response(res, 'failed approve ikk4', {}, 404, false)
            }
          } else {
            return response(res, 'failed approve ikk5', {}, 404, false)
          }
        } else {
          return response(res, 'failed approve ikk6', {}, 404, false)
        }
      } else {
        return response(res, 'failed approve ikk7', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  rejectListIkk: async (req, res) => {
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
        const findIkk = await ikk.findAll({
          where: {
            no_pembayaran: no
          }
        })
        if (findIkk.length > 0) {
          const findDepo = await depo.findOne({
            where: {
              kode_plant: findIkk[0].kode_plant
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
                            for (let i = 0; i < findIkk.length; i++) {
                              const listId = results.list
                              if (listId.find(e => e === findIkk[i].id)) {
                                const send = {
                                  status_reject: 1,
                                  isreject: 1,
                                  reason: results.alasan,
                                  menu_rev: results.menu,
                                  history: `${findIkk[i].history}, reject ajuan bayar by ${name} at ${moment().format('DD/MM/YYYY h:mm:ss a')}; reason: ${results.alasan}`
                                }
                                const findRes = await ikk.findByPk(findIkk[i].id)
                                if (findRes) {
                                  await findRes.update(send)
                                  temp.push(1)
                                }
                              } else {
                                const send = {
                                  status_reject: 1,
                                  reason: results.alasan,
                                  menu_rev: results.menu,
                                  history: `${findIkk[i].history}, reject ajuan bayar by ${name} at ${moment().format('DD/MM/YYYY h:mm:ss a')}; reason: ${results.alasan}`
                                }
                                const findRes = await ikk.findByPk(findIkk[i].id)
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
                            return response(res, 'failed reject ikk1', { findFull }, 404, false)
                          }
                        } else {
                          return response(res, 'failed reject ikk2', {}, 404, false)
                        }
                      } else {
                        return response(res, 'failed reject ikk3', {}, 404, false)
                      }
                    } else {
                      return response(res, `${findTtd[arr - 1].jabatan} belum approve atau telah mereject`, {}, 404, false)
                    }
                  }
                } else {
                  return response(res, 'failed reject ikk4', {}, 404, false)
                }
              } else {
                return response(res, 'failed reject ikk5', {}, 404, false)
              }
            } else {
              return response(res, 'failed reject ikk6', {}, 404, false)
            }
          } else {
            return response(res, 'failed reject ikk7', {}, 404, false)
          }
        } else {
          return response(res, 'failed reject ikk8', {}, 404, false)
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
      const { status, reject, menu, time1, time2 } = req.query
      const statTrans = status === 'undefined' || status === null ? 8 : status
      const statRej = reject === 'undefined' ? null : reject
      const statMenu = menu === 'undefined' ? null : menu
      const timeVal1 = time1 === 'undefined' ? 'all' : time1
      const timeVal2 = time2 === 'undefined' ? 'all' : time2
      const timeV1 = moment(timeVal1)
      const timeV2 = timeVal1 !== 'all' && timeVal1 === timeVal2 ? moment(timeVal2).add(1, 'd') : moment(timeVal2)
      if (level === 5) {
        const findIkk = await ikk.findAll({
          where: {
            kode_plant: kode,
            [Op.and]: [
              statTrans === 'all' ? { [Op.not]: { id: null } } : { status_transaksi: statTrans },
              statRej === 'all' ? { [Op.not]: { id: null } } : { status_reject: statRej },
              statMenu === 'all' ? { [Op.not]: { id: null } } : { menu_rev: { [Op.like]: `%${statMenu}%` } },
              timeVal1 === 'all'
                ? { [Op.not]: { id: null } }
                : {
                    start_ikk: {
                      [Op.gte]: timeV1,
                      [Op.lt]: timeV2
                    }
                  },
              { [Op.not]: { status_transaksi: null } },
              { [Op.not]: { status_transaksi: 1 } }
            ],
            [Op.not]: [
              { status_transaksi: 1 }
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
        if (findIkk) {
          return response(res, 'success get data ikk', { result: findIkk })
        } else {
          return response(res, 'success get data ikk', { result: findIkk })
        }
      } else if (access.find(item => item === level) !== undefined) {
        const findDepo = await depo.findAll({
          where: {
            [Op.or]: [
              { bm: level === 10 ? name : 'undefined' },
              { om: level === 11 ? name : 'undefined' },
              { nom: level === 12 ? name : 'undefined' },
              { pic_finance: level === 2 ? name : 'undefined' },
              { spv_finance: level === 7 ? name : 'undefined' },
              { asman_finance: level === 8 ? name : 'undefined' },
              { manager_finance: level === 9 ? name : 'undefined' },
              { pic_tax: level === 4 ? name : 'undefined' },
              { manager_tax: level === 14 ? name : 'undefined' }
            ]
          }
        })
        if (findDepo) {
          const hasil = []
          for (let i = 0; i < findDepo.length > 0 ? 1 : 0; i++) {
            const result = await ikk.findAll({
              where: {
                kode_plant: findDepo[i].kode_plant,
                [Op.and]: [
                  statTrans === 'all' ? { [Op.not]: { status_transaksi: null } } : { status_transaksi: statTrans },
                  statRej === 'all' ? { [Op.not]: { id: null } } : { status_reject: statRej },
                  statMenu === 'all' ? { [Op.not]: { id: null } } : { menu_rev: { [Op.like]: `%${statMenu}%` } },
                  timeVal1 === 'all'
                    ? { [Op.not]: { id: null } }
                    : {
                        start_ikk: {
                          [Op.gte]: timeV1,
                          [Op.lt]: timeV2
                        }
                      }
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
            const result = hasil
            return response(res, 'success get ikk', { result })
          } else {
            const result = hasil
            return response(res, 'success get ikk', { result })
          }
        } else {
          return response(res, 'failed get ikk', {}, 400, false)
        }
      } else {
        const findIkk = await ikk.findAll({
          where: {
            [Op.and]: [
              statTrans === 'all' ? { [Op.not]: { status_transaksi: null } } : { status_transaksi: statTrans },
              statRej === 'all' ? { [Op.not]: { id: null } } : { status_reject: statRej },
              statMenu === 'all' ? { [Op.not]: { id: null } } : { menu_rev: { [Op.like]: `%${statMenu}%` } },
              timeVal1 === 'all'
                ? { [Op.not]: { id: null } }
                : {
                    start_ikk: {
                      [Op.gte]: timeV1,
                      [Op.lt]: timeV2
                    }
                  }
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
        if (findIkk) {
          return response(res, 'success get data ikk', { result: findIkk })
        } else {
          return response(res, 'success get data ikk', { result: findIkk })
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  confirmNewIdent: async (req, res) => {
    try {
      const id = req.params.id
      const findIkk = await ikk.findByPk(id)
      if (findIkk) {
        const data = {
          new_ident: 'confirm'
        }
        const dataNull = {
          new_ident: null
        }
        if (findIkk.new_ident === null || findIkk.new_ident === '') {
          const updateIkk = await findIkk.update(data)
          if (updateIkk) {
            return response(res, 'success edit verif ikk', { updateIkk })
          } else {
            return response(res, 'failed edit verif ikk', {}, 404, false)
          }
        } else {
          const updateIkk = await findIkk.update(dataNull)
          if (updateIkk) {
            return response(res, 'success edit verif ikk', { updateIkk })
          } else {
            return response(res, 'failed edit verif ikk', {}, 404, false)
          }
        }
      } else {
        return response(res, 'failed edit verif ikk', {}, 404, false)
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
        jenis_form: 'List Ikk',
        no_transaksi: no,
        tipe: 'List Ajuan Bayar Ikk',
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
            divisi: 'ikk',
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
      const name = req.user.name
      const findIkk = await ikk.findAll({
        where: {
          no_pembayaran: no
        }
      })
      if (findIkk.length > 0) {
        const temp = []
        for (let i = 0; i < findIkk.length; i++) {
          const findData = await ikk.findByPk(findIkk[i].id)
          if (findData) {
            const data = {
              end_ikk: moment(),
              status_transaksi: 8,
              status_reject: null,
              isreject: null,
              history: `${findIkk[i].history}, submit bukti bayar by ${name} at ${moment().format('DD/MM/YYYY h:mm:ss a')}`
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
  }
}
