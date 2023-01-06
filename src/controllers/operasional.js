const { pajak, coa, depo, docuser, approve, ttd, role } = require('../models')
const joi = require('joi')
const { Op } = require('sequelize')
const response = require('../helpers/response')
const moment = require('moment')
const uploadHelper = require('../helpers/upload')
const multer = require('multer')

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
            const findDraft = await pajak.findOne({
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
              periode: results.periode
            }
            if (findDraft) {
              const month = moment(results.periode_awal).format('MMMM YYYY')
              const monthLast = moment(results.periode_akhir).format('MMMM YYYY')
              const monthCom = moment(findDraft.periode_awal).format('MMMM YYYY')
              const monthComLast = moment(findDraft.periode_akhir).format('MMMM YYYY')
              console.log(month === monthCom)
              console.log(monthLast === monthComLast)
              if (findDraft.no_coa === results.no_coa && month === monthCom && monthLast === monthComLast) {
                const sendData = await pajak.create(send)
                if (sendData) {
                  return response(res, 'success add pajak1', { result: sendData })
                } else {
                  return response(res, 'failed add pajak 7', {}, 400, false)
                }
              } else {
                return response(res, 'Pastikan program dan periode sama dalam satu pengajuan', {}, 400, false)
              }
            } else {
              const findOps = await pajak.findOne({
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
                const month = moment(results.periode_awal).format('MMMM YYYY')
                const monthLast = moment(results.periode_akhir).format('MMMM YYYY')
                const monthCom = moment(findOps.periode_awall).format('MMMM YYYY')
                const monthComLast = moment(findOps.periode_akhir).format('MMMM YYYY')
                if (month === monthCom && monthLast === monthComLast) {
                  return response(res, 'data ini telah diajukan pada pengajuan sebelumnya', { result: findOps })
                } else {
                  const sendData = await pajak.create(send)
                  if (sendData) {
                    return response(res, 'success add pajak2', { result: sendData })
                  } else {
                    return response(res, 'failed add pajak 7', {}, 400, false)
                  }
                }
              } else {
                const sendData = await pajak.create(send)
                if (sendData) {
                  return response(res, 'success add pajak3', { result: sendData })
                } else {
                  return response(res, 'failed add pajak 7', {}, 400, false)
                }
              }
            }
          } else {
            return response(res, 'failed add pajak 3', {}, 400, false)
          }
        } else {
          return response(res, 'failed add pajak 1', {}, 400, false)
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getCartClaim: async (req, res) => {
    try {
      const kode = req.user.kode
      const findOps = await pajak.findAll({
        where: {
          kode_plant: kode,
          status_transaksi: null
        }
      })
      if (findOps) {
        return response(res, 'success get cart pajak', { result: findOps })
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
      const findOps = await pajak.findByPk(id)
      if (findOps) {
        await findOps.destroy()
        return response(res, 'success delete cart pajak', { result: findOps })
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
      const findNo = await pajak.findAll({
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
      const findOps = await pajak.findAll({
        where: {
          kode_plant: kode,
          status_transaksi: null
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
        const data = {
          status_transaksi: 2,
          no_transaksi: `${notrans}/${kode}/${rome}/${year}-OPS`
        }
        for (let i = 0; i < findOps.length; i++) {
          const findDraft = await pajak.findByPk(findOps[i].id)
          if (findDraft) {
            const upOps = await findDraft.update(data)
            if (upOps) {
              temp.push(1)
            }
          }
        }
        if (temp.length) {
          return response(res, 'success submit cart', { nopajak: `${notrans}/${kode}/${rome}/${year}-OPS` })
        } else {
          return response(res, 'failed submit cart', { nopajak: `${notrans}/${kode}/${rome}/${year}-OPS` })
        }
      } else {
        return response(res, 'failed submit cart', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  uploadDocument: async (req, res) => {
    const { no } = req.query
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
        console.log(req.file)
        const dokumen = `assets/documents/${req.file.filename}`
        const send = {
          status: 1,
          path: dokumen,
          divisi: 'pajak',
          desc: req.file.originalname,
          jenis_form: 'pajak',
          jenis_dok: 'lampiran',
          no_transaksi: no
        }
        const make = await docuser.create(send)
        if (make) {
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
      const { no } = req.body
      const findDoc = await docuser.findAll({
        where: {
          no_transaksi: no
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
      if (level === 5) {
        const findOps = await pajak.findAll({
          where: {
            kode_plant: kode,
            [Op.not]: { status_transaksi: null }
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
          return response(res, 'success get data pajak', { result: findOps, noDis })
        } else {
          return response(res, 'success get data pajak', { result: findOps, noDis })
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
            const result = await pajak.findAll({
              where: {
                kode_plant: findDepo[i].kode_plant,
                [Op.not]: { status_transaksi: null }
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
            return response(res, 'success get pajak', { result, noDis, findDepo })
          } else {
            const result = hasil
            const noDis = []
            return response(res, 'success get pajak', { result, noDis, findDepo })
          }
        } else {
          return response(res, 'failed get pajak', {}, 400, false)
        }
      } else {
        const findOps = await pajak.findAll({
          where: {
            [Op.not]: { status_transaksi: null }
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
          return response(res, 'success get data pajak', { result: findOps, noDis })
        } else {
          return response(res, 'success get data pajak', { result: findOps, noDis })
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getDetailOps: async (req, res) => {
    try {
      const { no } = req.body
      const findOps = await pajak.findAll({
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
      if (findOps) {
        return response(res, 'success get dokumen', { result: findOps })
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
        const findOps = await pajak.findOne({
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
                  return response(res, 'failed get approval', {}, 404, false)
                }
              } else {
                return response(res, 'failed get approval', {}, 404, false)
              }
            } else {
              return response(res, 'failed get approval', {}, 404, false)
            }
          } else {
            return response(res, 'failed get approval', {}, 404, false)
          }
        } else {
          return response(res, 'failed get approval', {}, 404, false)
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
      const findOps = await pajak.findAll({
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
                              { no_doc: no },
                              { status: 1 }
                            ]
                          }
                        })
                        if (findTtd.length === findFull.length) {
                          const temp = []
                          for (let i = 0; i < findOps.length; i++) {
                            const send = {
                              status_transaksi: 3
                            }
                            const findRes = pajak.findByPk(findOps[i].id)
                            if (findRes) {
                              await findRes.update(send)
                              temp.push(1)
                            }
                          }
                          if (temp.length) {
                            return response(res, 'success approve pajak', {})
                          } else {
                            return response(res, 'success approve pajak', {})
                          }
                        } else {
                          return response(res, 'success approve pajak', {})
                        }
                      } else {
                        return response(res, 'failed approve pajak', {}, 404, false)
                      }
                    } else {
                      return response(res, 'failed approve pajak', {}, 404, false)
                    }
                  } else {
                    return response(res, `${findTtd[arr - 1].jabatan} belum approve atau telah mereject`, {}, 404, false)
                  }
                }
              } else {
                return response(res, 'failed approve pajak', {}, 404, false)
              }
            } else {
              return response(res, 'failed approve pajak', {}, 404, false)
            }
          } else {
            return response(res, 'failed approve pajak', {}, 404, false)
          }
        } else {
          return response(res, 'failed approve pajak', {}, 404, false)
        }
      } else {
        return response(res, 'failed approve pajak', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  }
}
