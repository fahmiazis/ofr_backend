const { ikk, coa, depo, docuser, approve, ttd, role, document } = require('../models')
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
            const findDraft = await ikk.findOne({
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
              periode: results.periode
            }
            if (findDraft) {
              const month = moment(results.periode_awal).format('MMMM YYYY')
              const monthLast = moment(results.periode_akhir).format('MMMM YYYY')
              const monthCom = moment(findDraft.periode_awal).format('MMMM YYYY')
              const monthComLast = moment(findDraft.periode_akhir).format('MMMM YYYY')
              if (findDraft.no_coa === results.no_coa && month === monthCom && monthLast === monthComLast) {
                const sendData = await ikk.create(send)
                if (sendData) {
                  return response(res, 'success add ikk1', { result: sendData })
                } else {
                  return response(res, 'failed add ikk 7', {}, 400, false)
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
                    { status_transaksi: 0 },
                    { status_transaksi: 8 }
                  ]
                }
              })
              if (findIkk) {
                const month = moment(results.periode_awal).format('MMMM YYYY')
                const monthLast = moment(results.periode_akhir).format('MMMM YYYY')
                const monthCom = moment(findIkk.periode_awall).format('MMMM YYYY')
                const monthComLast = moment(findIkk.periode_akhir).format('MMMM YYYY')
                if (month === monthCom && monthLast === monthComLast) {
                  return response(res, 'data ini telah diajukan pada pengajuan sebelumnya', { result: findIkk })
                } else {
                  const sendData = await ikk.create(send)
                  if (sendData) {
                    return response(res, 'success add ikk2', { result: sendData })
                  } else {
                    return response(res, 'failed add ikk 7', {}, 400, false)
                  }
                }
              } else {
                const sendData = await ikk.create(send)
                if (sendData) {
                  return response(res, 'success add ikk3', { result: sendData })
                } else {
                  return response(res, 'failed add ikk 7', {}, 400, false)
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
        return response(res, 'success get cart ikk', { result: findIkk })
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
      if (findIkk) {
        await findIkk.destroy()
        return response(res, 'success delete cart ikk', { result: findIkk })
      } else {
        return response(res, 'failed get cart', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  submitIkk: async (req, res) => {
    try {
      const kode = req.user.kode
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
        const noTrans = findIkk[0].no_transaksi === null ? `${notrans}/${kode}/${rome}/${year}-IKK` : findIkk[0].no_transaksi
        const data = {
          status_transaksi: 1,
          no_transaksi: noTrans
        }
        for (let i = 0; i < findIkk.length; i++) {
          const findDraft = await ikk.findByPk(findIkk[i].id)
          if (findDraft) {
            const upIkk = await findDraft.update(data)
            if (upIkk) {
              temp.push(1)
            }
          }
        }
        if (temp.length) {
          return response(res, 'success submit cart', { noikk: noTrans })
        } else {
          return response(res, 'failed submit cart', { noikk: noTrans })
        }
      } else {
        return response(res, 'failed submit cart', {}, 404, false)
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
          divisi: 'ikk',
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
      const { status, reject, menu, type, category, data } = req.query
      const statTrans = status === 'undefined' || status === null ? 2 : status
      const statRej = reject === 'undefined' ? null : reject
      const statMenu = menu === 'undefined' ? null : menu
      const statData = data === 'undefined' ? null : data
      if (level === 5) {
        const findIkk = await ikk.findAll({
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
            const result = await ikk.findAll({
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
          return response(res, 'success get dokumen', { result: findIkk })
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
  }
}
