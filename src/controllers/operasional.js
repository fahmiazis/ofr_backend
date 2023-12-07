const { ops, glikk, docuser, approve, ttd, role, document, veriftax, faktur, reservoir, finance, kliring, kpp, taxcode } = require('../models')
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
        jenis_pph: joi.string().allow(''),
        nilai_bayar: joi.string().allow(''),
        tgl_faktur: joi.string().allow(''),
        typeniknpwp: joi.string().allow(''),
        type_kasbon: joi.string().allow(''),
        type_po: joi.string().allow(''),
        no_po: joi.string().allow(''),
        nilai_po: joi.string().allow(''),
        nilai_pr: joi.string().allow(''),
        stat_skb: joi.string().allow(''),
        stat_bbm: joi.string().allow(''),
        km: joi.string().allow(''),
        liter: joi.string().allow(''),
        no_pol: joi.string().allow('')
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
          const result = await veriftax.findByPk(idTrans)
          if (result) {
            const findDraft = await ops.findOne({
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
              sub_coa: result.jenis_transaksi,
              nama_coa: result.gl_name,
              tax_type: result.tax_type,
              tax_code: result.tax_code,
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
              nilai_bayar: results.nilai_bayar,
              jenis_pph: results.jenis_pph,
              jenis_vendor: result.type_transaksi,
              tgl_faktur: results.tgl_faktur,
              typeniknpwp: results.typeniknpwp,
              type_kasbon: results.type_kasbon,
              type_po: results.type_po,
              no_po: results.no_po,
              nilai_po: results.nilai_po,
              nilai_pr: results.nilai_pr,
              stat_skb: results.stat_skb,
              stat_bbm: results.stat_bbm,
              km: results.km,
              liter: results.liter,
              no_pol: results.no_pol
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
                  const findData = await ops.findOne({
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
                      const sendData = await ops.create(send)
                      if (sendData) {
                        return response(res, 'success add ops1', { result: sendData })
                      } else {
                        return response(res, 'failed add ops 7', {}, 400, false)
                      }
                    } else {
                      return response(res, 'failed add ops 8', {}, 400, false)
                    }
                  }
                } else {
                  const sendData = await ops.create(send)
                  if (sendData) {
                    return response(res, 'success add ops1', { result: sendData })
                  } else {
                    return response(res, 'failed add ops 7', {}, 400, false)
                  }
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
                    { status_transaksi: 0 }
                    // { status_transaksi: 8 }
                  ]
                }
              })
              if (findOps) {
                const month = moment(results.periode_awal).format('DD MMMM YYYY')
                const monthLast = moment(results.periode_akhir).format('DD MMMM YYYY')
                const monthCom = moment(findOps.periode_awall).format('DD MMMM YYYY')
                const monthComLast = moment(findOps.periode_akhir).format('DD MMMM YYYY')
                if (findOps.sub_coa === result.jenis_transaksi && month === monthCom && monthLast === monthComLast) {
                  return response(res, 'data ini telah diajukan pada pengajuan sebelumnya', { result: findOps })
                } else {
                  if (results.no_faktur !== '' && results.no_faktur !== undefined) {
                    const findFaktur = await faktur.findOne({
                      where: {
                        no_faktur: results.no_faktur
                      }
                    })
                    const findData = await ops.findOne({
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
                        const sendData = await ops.create(send)
                        if (sendData) {
                          return response(res, 'success add ops1', { result: sendData })
                        } else {
                          return response(res, 'failed add ops 7', {}, 400, false)
                        }
                      } else {
                        return response(res, 'failed add ops 8', {}, 400, false)
                      }
                    }
                  } else {
                    const sendData = await ops.create(send)
                    if (sendData) {
                      return response(res, 'success add ops1', { result: sendData })
                    } else {
                      return response(res, 'failed add ops 7', {}, 400, false)
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
                  const findData = await ops.findOne({
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
                      const sendData = await ops.create(send)
                      if (sendData) {
                        return response(res, 'success add ops1', { result: sendData })
                      } else {
                        return response(res, 'failed add ops 7', {}, 400, false)
                      }
                    } else {
                      return response(res, 'failed add ops 8', {}, 400, false)
                    }
                  }
                } else {
                  const sendData = await ops.create(send)
                  if (sendData) {
                    return response(res, 'success add ops1', { result: sendData })
                  } else {
                    return response(res, 'failed add ops 7', {}, 400, false)
                  }
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
      // const name = req.user.fullname
      // const level = req.user.level
      const kode = req.user.kode
      const idTrans = req.params.idtrans
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
        jenis_pph: joi.string().allow(''),
        nilai_bayar: joi.string().allow(''),
        tgl_faktur: joi.string().allow(''),
        typeniknpwp: joi.string().allow(''),
        type_kasbon: joi.string().allow(''),
        type_po: joi.string().allow(''),
        no_po: joi.string().allow(''),
        nilai_po: joi.string().allow(''),
        nilai_pr: joi.string().allow(''),
        stat_skb: joi.string().allow(''),
        stat_bbm: joi.string().allow(''),
        km: joi.string().allow(''),
        liter: joi.string().allow(''),
        no_pol: joi.string().allow('')
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
        const findUpdate = await ops.findByPk(id)

        if (findDepo.length > 0 && findUpdate) {
          const result = await veriftax.findByPk(idTrans)
          if (result) {
            const findDraft = await ops.findOne({
              where: {
                kode_plant: kode,
                status_transaksi: null,
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
              sub_coa: result.jenis_transaksi,
              nama_coa: result.gl_name,
              tax_type: result.tax_type,
              tax_code: result.tax_code,
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
              nilai_bayar: results.nilai_bayar,
              jenis_pph: results.jenis_pph,
              jenis_vendor: result.type_transaksi,
              tgl_faktur: results.tgl_faktur,
              typeniknpwp: results.typeniknpwp,
              type_po: results.type_po,
              no_po: results.no_po,
              nilai_po: results.nilai_po,
              nilai_pr: results.nilai_pr,
              stat_skb: results.stat_skb,
              stat_bbm: results.stat_bbm,
              km: results.km,
              liter: results.liter,
              no_pol: results.no_pol
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
                  const findData = await ops.findOne({
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
                        return response(res, 'success add ops1', { result: sendData })
                      } else {
                        return response(res, 'failed add ops 7', {}, 400, false)
                      }
                    } else {
                      return response(res, 'failed add ops 8', {}, 400, false)
                    }
                  }
                } else {
                  const sendData = await findUpdate.update(send)
                  if (sendData) {
                    return response(res, 'success add ops1', { result: sendData })
                  } else {
                    return response(res, 'failed add ops 7', {}, 400, false)
                  }
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
                    { status_transaksi: 1 },
                    { status_transaksi: 8 }
                  ]
                }
              })
              if (findOps) {
                const month = moment(results.periode_awal).format('DD MMMM YYYY')
                const monthLast = moment(results.periode_akhir).format('DD MMMM YYYY')
                const monthCom = moment(findOps.periode_awall).format('DD MMMM YYYY')
                const monthComLast = moment(findOps.periode_akhir).format('DD MMMM YYYY')
                if (findOps.sub_coa === result.jenis_transaksi && month === monthCom && monthLast === monthComLast) {
                  return response(res, 'data ini telah diajukan pada pengajuan sebelumnya', { result: findOps })
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
                    const findData = await ops.findOne({
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
                        if (editFaktur && sendData) {
                          return response(res, 'success add ops1', { result: sendData })
                        } else {
                          return response(res, 'failed add ops 7', {}, 400, false)
                        }
                      } else {
                        return response(res, 'failed add ops 8', {}, 400, false)
                      }
                    }
                  } else {
                    const sendData = await findUpdate.update(send)
                    if (sendData) {
                      return response(res, 'success add ops1', { result: sendData })
                    } else {
                      return response(res, 'failed add ops 7', {}, 400, false)
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
                  const findData = await ops.findOne({
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
                      if (editFaktur && sendData) {
                        return response(res, 'success add ops1', { result: sendData })
                      } else {
                        return response(res, 'failed add ops 7', {}, 400, false)
                      }
                    } else {
                      return response(res, 'failed add ops 8', {}, 400, false)
                    }
                  }
                } else {
                  const sendData = await findUpdate.update(send)
                  if (sendData) {
                    return response(res, 'success add ops1', { result: sendData })
                  } else {
                    return response(res, 'failed add ops 7', {}, 400, false)
                  }
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
  getCartOps: async (req, res) => {
    try {
      const kode = req.user.kode
      const { tipe } = req.query
      const findOps = await ops.findAll({
        where: {
          [Op.and]: [
            { kode_plant: kode },
            tipe === 'kasbon' ? { type_kasbon: tipe } : { [Op.not]: { type_kasbon: 'kasbon' } }
          ],
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
      if (findOps.no_transaksi === null) {
        if (findOps.no_faktur !== null && findOps.no_faktur !== undefined) {
          const findFaktur = await faktur.findOne({
            where: {
              no_faktur: findOps.no_faktur
            }
          })
          if (findFaktur) {
            const dataEdit = {
              status: null
            }
            const editFaktur = await findFaktur.update(dataEdit)
            if (editFaktur) {
              await findOps.destroy()
              return response(res, 'success delete cart ops', { result: findOps })
            } else {
              return response(res, 'failed delete carrt ops 1', {}, 400, false)
            }
          } else {
            await findOps.destroy()
            return response(res, 'success delete cart ops', { result: findOps })
          }
        } else {
          await findOps.destroy()
          return response(res, 'success delete cart ops', { result: findOps })
        }
      } else {
        const findAllOps = await ops.findAll({
          where: {
            no_transaksi: findOps.no_transaksi
          }
        })
        if (findAllOps.length === 1) {
          const findDoc = await docuser.findAll({
            where: {
              no_transaksi: findOps.no_transaksi
            }
          })
          if (findDoc.length > 0) {
            const tempDoc = []
            for (let i = 0; i < findDoc.length; i++) {
              const upDoc = await docuser.findByPk(findDoc[i].id)
              if (upDoc) {
                await upDoc.destroy()
                tempDoc.push(upDoc)
              }
            }
            if (tempDoc.length > 0) {
              if (findOps.no_faktur !== null && findOps.no_faktur !== undefined) {
                const findFaktur = await faktur.findOne({
                  where: {
                    no_faktur: findOps.no_faktur
                  }
                })
                if (findFaktur) {
                  const dataEdit = {
                    status: null
                  }
                  const editFaktur = await findFaktur.update(dataEdit)
                  if (editFaktur) {
                    await findOps.destroy()
                    return response(res, 'success delete cart ops', { result: findOps })
                  } else {
                    return response(res, 'failed delete carrt ops 1', {}, 400, false)
                  }
                } else {
                  await findOps.destroy()
                  return response(res, 'success delete cart ops', { result: findOps })
                }
              } else {
                await findOps.destroy()
                return response(res, 'success delete cart ops', { result: findOps })
              }
            } else {
              return response(res, 'failed delete carrt ops 1', {}, 400, false)
            }
          } else {
            if (findOps.no_faktur !== null && findOps.no_faktur !== undefined) {
              const findFaktur = await faktur.findOne({
                where: {
                  no_faktur: findOps.no_faktur
                }
              })
              if (findFaktur) {
                const dataEdit = {
                  status: null
                }
                const editFaktur = await findFaktur.update(dataEdit)
                if (editFaktur) {
                  await findOps.destroy()
                  return response(res, 'success delete cart ops', { result: findOps })
                } else {
                  return response(res, 'failed delete carrt ops 1', {}, 400, false)
                }
              } else {
                await findOps.destroy()
                return response(res, 'success delete cart ops', { result: findOps })
              }
            } else {
              await findOps.destroy()
              return response(res, 'success delete cart ops', { result: findOps })
            }
          }
        } else {
          if (findOps.no_faktur !== null && findOps.no_faktur !== undefined) {
            const findFaktur = await faktur.findOne({
              where: {
                no_faktur: findOps.no_faktur
              }
            })
            if (findFaktur) {
              const dataEdit = {
                status: null
              }
              const editFaktur = await findFaktur.update(dataEdit)
              if (editFaktur) {
                await findOps.destroy()
                return response(res, 'success delete cart ops', { result: findOps })
              } else {
                return response(res, 'failed delete carrt ops 1', {}, 400, false)
              }
            } else {
              await findOps.destroy()
              return response(res, 'success delete cart ops', { result: findOps })
            }
          } else {
            await findOps.destroy()
            return response(res, 'success delete cart ops', { result: findOps })
          }
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  submitOps: async (req, res) => {
    try {
      const kode = req.user.kode
      const timeV1 = moment().startOf('month')
      const timeV2 = moment().endOf('month').add(1, 'd')
      const schema = joi.object({
        list: joi.array(),
        tipe: joi.string()
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 404, false)
      } else {
        const listId = results.list
        const findNo = await reservoir.findAll({
          where: {
            transaksi: 'ops',
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
        const noOps = Math.max(...cekNo) + 1
        const finTipe = results.tipe === 'kasbon' ? 'kasbon' : null
        const findOps = await ops.findAll({
          where: {
            [Op.and]: [
              { kode_plant: kode },
              finTipe === 'kasbon' ? { type_kasbon: finTipe } : { [Op.not]: { type_kasbon: 'kasbon' } }
            ],
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
          const cekTipe = findOps.find(({jenis_pph}) => jenis_pph !== 'Non PPh') === undefined ? 'ya' : 'no' // eslint-disable-line
          const tipe = cekTipe === 'ya' ? 'OPS' : 'OPSX'
          const tempData = findOps.find(({no_transaksi}) => no_transaksi !== null) // eslint-disable-line
          const cekData = tempData === undefined ? 'ya' : 'no'
          const noNow = `${notrans}/${kode}/${rome}/${year}-${tipe}`
          const noTrans = noNow
          const data = {
            status_transaksi: 1,
            no_transaksi: noTrans
          }
          const dataRes = {
            status_transaksi: null,
            no_transaksi: null
          }
          for (let i = 0; i < findOps.length; i++) {
            if (listId.find(e => e === findOps[i].id)) {
              const findDraft = await ops.findByPk(findOps[i].id)
              if (findDraft) {
                const upOps = await findDraft.update(data)
                if (upOps) {
                  temp.push(1)
                }
              }
            } else {
              const findDraft = await ops.findByPk(findOps[i].id)
              if (findDraft) {
                const upOps = await findDraft.update(dataRes)
                if (upOps) {
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
                  // const data = {
                  //   no_transaksi: noTrans
                  // }
                  const upDoc = await docuser.findByPk(findDoc[i].id)
                  if (upDoc) {
                    await upDoc.destroy()
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
                    transaksi: 'ops',
                    tipe: 'area',
                    status: 'delayed'
                  }
                  if (findReser && !findNewReser) {
                    const updateReser = await findReser.update(upDataReser)
                    if (updateReser) {
                      const createReser = await reservoir.create(creDataReser)
                      if (createReser) {
                        return response(res, 'success submit cart2', { noops: noTrans })
                      }
                    }
                  } else {
                    return response(res, 'success submit cart', { noops: noTrans })
                  }
                } else {
                  return response(res, 'success submit cart', { noops: noTrans })
                }
              } else {
                return response(res, 'success submit cart', { noops: noTrans })
              }
            } else {
              const findNewReser = await reservoir.findOne({
                where: {
                  no_transaksi: noTrans
                }
              })
              if (findNewReser) {
                return response(res, 'success submit cart', { noops: noTrans })
              } else {
                const creDataReser = {
                  no_transaksi: noTrans,
                  kode_plant: kode,
                  transaksi: 'ops',
                  tipe: 'area',
                  status: 'delayed'
                }
                await reservoir.create(creDataReser)
                return response(res, 'success submit cart', { noops: noTrans })
              }
            }
          } else {
            return response(res, 'failed submit cart1', { noops: noTrans })
          }
        } else {
          return response(res, 'failed submit cart2', {}, 404, false)
        }
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
            divisi: 'ops',
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
        const findReser = await reservoir.findOne({
          where: {
            no_transaksi: no
          }
        })
        const findOps = await ops.findAll({
          where: {
            no_transaksi: no
          }
        })
        if (findReser !== undefined && findReser.status === 'delayed' && findOps.length > 0) {
          const findMaster = await document.findAll({
            where: {
              [Op.and]: [
                { jenis: 'Operasional' },
                { type: name }
              ]
            }
          })
          const cek = findOps.find(({stat_skb}) => stat_skb === 'ya') === undefined ? 'ya' : 'no' // eslint-disable-line
          const resData = cek === 'ya' ? findMaster.length : findMaster.length + 1
          const cekDoc = []
          for (let i = 0; i < resData.length; i++) {
            // if (cek === 'no') {
            //   if (i === resData - 1) {
            //     const data = {
            //       desc: 'Dokumen SKB',
            //       jenis_form: findMaster[0].jenis,
            //       no_transaksi: no,
            //       tipe: findMaster[0].type,
            //       stat_upload: 1
            //     }
            //     const creDoc = await docuser.create(data)
            //     if (creDoc) {
            //       cekDoc.push(creDoc)
            //     }
            //   } else {
            //     const data = {
            //       desc: findMaster[i].name,
            //       jenis_form: findMaster[i].jenis,
            //       no_transaksi: no,
            //       tipe: findMaster[i].type,
            //       stat_upload: findMaster[i].stat_upload
            //     }
            //     const creDoc = await docuser.create(data)
            //     if (creDoc) {
            //       cekDoc.push(creDoc)
            //     }
            //   }
            // } else {
            const data = {
              desc: findMaster[i].name,
              jenis_form: findMaster[i].jenis,
              no_transaksi: no,
              tipe: findMaster[i].type,
              stat_upload: findMaster[i].stat_upload
            }
            const creDoc = await docuser.create(data)
            if (creDoc) {
              cekDoc.push(creDoc)
            }
            // }
          }
          if (cekDoc.length > 0) {
            const findFinDoc = await docuser.findAll({
              where: {
                no_transaksi: no
              }
            })
            if (findFinDoc.length > 0) {
              return response(res, 'success get dokumen flowles', { result: findFinDoc })
            } else {
              return response(res, 'success get dokumen gagl', { result: findDoc })
            }
          } else {
            return response(res, 'success get dokumen ggl', { result: findDoc })
          }
        } else {
          return response(res, 'success get dokumen gtl', { result: findDoc })
        }
      } else {
        const findOps = await ops.findAll({
          where: {
            no_transaksi: no
          }
        })
        if (findOps.length > 0) {
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
            const cek = findOps.find(({stat_skb}) => stat_skb === 'ya') === undefined ? 'ya' : 'no' // eslint-disable-line
            // const resData = cek === 'ya' ? findMaster.length : findMaster.length + 1
            const resData = cek === 'ya' ? findMaster.length : findMaster.length
            for (let i = 0; i < resData; i++) {
              // if (cek === 'no') {
              //   if (i === resData - 1) {
              //     const data = {
              //       desc: 'Dokumen SKB',
              //       jenis_form: findMaster[0].jenis,
              //       no_transaksi: no,
              //       tipe: findMaster[0].type,
              //       stat_upload: 1
              //     }
              //     const creDoc = await docuser.create(data)
              //     if (creDoc) {
              //       temp.push(creDoc)
              //     }
              //   } else {
              //     const data = {
              //       desc: findMaster[i].name,
              //       jenis_form: findMaster[i].jenis,
              //       no_transaksi: no,
              //       tipe: findMaster[i].type,
              //       stat_upload: findMaster[i].stat_upload
              //     }
              //     const creDoc = await docuser.create(data)
              //     if (creDoc) {
              //       temp.push(creDoc)
              //     }
              //   }
              // } else {
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
              // }
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
      const name = req.user.fullname
      const role = req.user.role
      const { status, reject, menu, type, category, data, time1, time2, kasbon, realisasi, search } = req.query
      const searchValue = search || ''
      const statTrans = status === 'undefined' || status === null ? 2 : status
      const statRej = reject === 'undefined' ? 'all' : reject
      const statMenu = menu === 'undefined' ? 'all' : menu
      const statData = data === 'undefined' ? 'all' : data
      const statKasbon = kasbon === 'undefined' ? 'all' : kasbon
      const timeVal1 = time1 === 'undefined' ? 'all' : time1
      const timeVal2 = time2 === 'undefined' ? 'all' : time2
      const timeV1 = moment(timeVal1)
      const timeV2 = timeVal1 !== 'all' && timeVal1 === timeVal2 ? moment(timeVal2).add(1, 'd') : moment(timeVal2).add(1, 'd')
      if (level === 5) {
        const findOps = await ops.findAll({
          where: {
            kode_plant: kode,
            [Op.and]: [
              statTrans === 'all' && realisasi === 'realisasi' ? { status_transaksi: { [Op.gte]: 8 } } : statTrans === 'all' && realisasi !== 'realisasi' ? { [Op.not]: { id: null } } : { status_transaksi: statTrans },
              statRej === 'all' ? { [Op.not]: { id: null } } : { status_reject: statRej },
              statMenu === 'all' ? { [Op.not]: { id: null } } : { menu_rev: { [Op.like]: `%${statMenu}%` } },
              statKasbon === 'kasbon'
                ? { type_kasbon: statKasbon }
                : statKasbon === 'non kasbon'
                  ? {
                      [Op.or]: [
                        { [Op.not]: { type_kasbon: 'kasbon' } },
                        { type_kasbon: null }
                      ]
                    }
                  : {
                      [Op.not]: { id: null }
                    },
              timeVal1 === 'all'
                ? { [Op.not]: { id: null } }
                : {
                    start_ops: {
                      [Op.gte]: timeV1,
                      [Op.lt]: timeV2
                    }
                  },
              { [Op.not]: { status_transaksi: null } },
              { [Op.not]: { status_transaksi: 1 } },
              category === 'revisi' ? { [Op.not]: { status_transaksi: 0 } } : { [Op.not]: { id: null } }
            ],
            [Op.or]: [
              { no_coa: { [Op.like]: `%${searchValue}%` } },
              { sub_coa: { [Op.like]: `%${searchValue}%` } },
              { nama_coa: { [Op.like]: `%${searchValue}%` } },
              { keterangan: { [Op.like]: `%${searchValue}%` } },
              { no_faktur: { [Op.like]: `%${searchValue}%` } },
              { nama_vendor: { [Op.like]: `%${searchValue}%` } },
              { alamat_vendor: { [Op.like]: `%${searchValue}%` } },
              // { tgl_tagihanbayar: { [Op.like]: `%${searchValue}%` } },
              { nama_tujuan: { [Op.like]: `%${searchValue}%` } },
              { nama_ktp: { [Op.like]: `%${searchValue}%` } },
              { nama_npwp: { [Op.like]: `%${searchValue}%` } },
              { no_ktp: { [Op.like]: `%${searchValue}%` } },
              { no_npwp: { [Op.like]: `%${searchValue}%` } },
              { no_transaksi: { [Op.like]: `%${searchValue}%` } },
              { no_pembayaran: { [Op.like]: `%${searchValue}%` } }
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
              model: finance,
              as: 'depo',
              include: [{ model: kpp, as: 'kpp' }, { model: glikk, as: 'glikk' }]
            },
            {
              model: veriftax,
              as: 'veriftax'
            },
            {
              model: kliring,
              as: 'kliring'
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
      } else if (access.find(item => item === level) !== undefined) {
        const findDepo = await finance.findAll({
          where: {
            [Op.or]: [
              { bm: level === 10 ? name : 'undefined' },
              { rom: level === 11 ? name : 'undefined' },
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
            const result = await ops.findAll({
              where: {
                kode_plant: findDepo[i].kode_plant,
                [Op.and]: [
                  statTrans === 'all' ? { [Op.not]: { status_transaksi: null } } : { status_transaksi: statTrans },
                  statRej === 'all' ? { [Op.not]: { start_ops: null } } : { status_reject: statRej },
                  statMenu === 'all' ? { [Op.not]: { start_ops: null } } : { menu_rev: { [Op.like]: `%${statMenu}%` } },
                  category === 'ajuan bayar' ? { [Op.not]: { no_pembayaran: null } } : { [Op.not]: { id: null } },
                  statKasbon === 'kasbon'
                    ? { type_kasbon: statKasbon }
                    : statKasbon === 'non kasbon'
                      ? {
                          [Op.or]: [
                            { [Op.not]: { type_kasbon: 'kasbon' } },
                            { type_kasbon: null }
                          ]
                        }
                      : {
                          [Op.not]: { id: null }
                        },
                  timeVal1 === 'all'
                    ? { [Op.not]: { id: null } }
                    : {
                        start_ops: {
                          [Op.gte]: timeV1,
                          [Op.lt]: timeV2
                        }
                      }
                ],
                [Op.or]: [
                  { kode_plant: { [Op.like]: `%${searchValue}%` } },
                  { area: { [Op.like]: `%${searchValue}%` } },
                  { cost_center: { [Op.like]: `%${searchValue}%` } },
                  { no_coa: { [Op.like]: `%${searchValue}%` } },
                  { sub_coa: { [Op.like]: `%${searchValue}%` } },
                  { nama_coa: { [Op.like]: `%${searchValue}%` } },
                  { keterangan: { [Op.like]: `%${searchValue}%` } },
                  { no_faktur: { [Op.like]: `%${searchValue}%` } },
                  { nama_vendor: { [Op.like]: `%${searchValue}%` } },
                  { alamat_vendor: { [Op.like]: `%${searchValue}%` } },
                  // { tgl_tagihanbayar: { [Op.like]: `%${searchValue}%` } },
                  { nama_tujuan: { [Op.like]: `%${searchValue}%` } },
                  { nama_ktp: { [Op.like]: `%${searchValue}%` } },
                  { nama_npwp: { [Op.like]: `%${searchValue}%` } },
                  { no_ktp: { [Op.like]: `%${searchValue}%` } },
                  { no_npwp: { [Op.like]: `%${searchValue}%` } },
                  { no_transaksi: { [Op.like]: `%${searchValue}%` } },
                  { no_pembayaran: { [Op.like]: `%${searchValue}%` } }
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
                  model: finance,
                  as: 'depo',
                  include: [{ model: kpp, as: 'kpp' }, { model: glikk, as: 'glikk' }]
                },
                {
                  model: veriftax,
                  as: 'veriftax'
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
            const newOps = category === 'ajuan bayar' ? filterBayar(type, result, noDis, statTrans, role) : category === 'verif' ? filter(type, result, noDis, statData, role) : filterApp(type, result, noDis, role)
            console.log(moment(timeV1).format('DD MMMM YYYY'))
            return response(res, 'success get ops', { result, noDis, findDepo, newOps })
          } else {
            const result = hasil
            const noDis = []
            console.log(moment(timeV1).format('DD MMMM YYYY'))
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
              statMenu === 'all' ? { [Op.not]: { id: null } } : { menu_rev: { [Op.like]: `%${statMenu}%` } },
              statKasbon === 'kasbon'
                ? { type_kasbon: statKasbon }
                : statKasbon === 'non kasbon'
                  ? {
                      [Op.or]: [
                        { [Op.not]: { type_kasbon: 'kasbon' } },
                        { type_kasbon: null }
                      ]
                    }
                  : {
                      [Op.not]: { id: null }
                    },
              timeVal1 === 'all'
                ? { [Op.not]: { id: null } }
                : {
                    start_ops: {
                      [Op.gte]: timeV1,
                      [Op.lt]: timeV2
                    }
                  }
            ],
            [Op.or]: [
              { kode_plant: { [Op.like]: `%${searchValue}%` } },
              { area: { [Op.like]: `%${searchValue}%` } },
              { cost_center: { [Op.like]: `%${searchValue}%` } },
              { no_coa: { [Op.like]: `%${searchValue}%` } },
              { sub_coa: { [Op.like]: `%${searchValue}%` } },
              { nama_coa: { [Op.like]: `%${searchValue}%` } },
              { keterangan: { [Op.like]: `%${searchValue}%` } },
              { no_faktur: { [Op.like]: `%${searchValue}%` } },
              { nama_vendor: { [Op.like]: `%${searchValue}%` } },
              { alamat_vendor: { [Op.like]: `%${searchValue}%` } },
              // { tgl_tagihanbayar: { [Op.like]: `%${searchValue}%` } },
              { nama_tujuan: { [Op.like]: `%${searchValue}%` } },
              { nama_ktp: { [Op.like]: `%${searchValue}%` } },
              { nama_npwp: { [Op.like]: `%${searchValue}%` } },
              { no_ktp: { [Op.like]: `%${searchValue}%` } },
              { no_npwp: { [Op.like]: `%${searchValue}%` } },
              { no_transaksi: { [Op.like]: `%${searchValue}%` } },
              { no_pembayaran: { [Op.like]: `%${searchValue}%` } }
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
              model: finance,
              as: 'depo',
              include: [{ model: kpp, as: 'kpp' }, { model: glikk, as: 'glikk' }]
            },
            {
              model: veriftax,
              as: 'veriftax'
            },
            {
              model: kliring,
              as: 'kliring'
            },
            {
              model: taxcode,
              as: 'taxcode'
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
              model: finance,
              as: 'depo',
              include: [{ model: kpp, as: 'kpp' }, { model: glikk, as: 'glikk' }]
            },
            {
              model: veriftax,
              as: 'veriftax'
            },
            {
              model: kliring,
              as: 'kliring'
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
              as: 'depo',
              include: [{ model: kpp, as: 'kpp' }, { model: glikk, as: 'glikk' }]
            },
            {
              model: veriftax,
              as: 'veriftax'
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
  getDetailId: async (req, res) => {
    try {
      const { id } = req.params
      const findOps = await ops.findOne({
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
            as: 'depo',
            include: [{ model: kpp, as: 'kpp' }, { model: glikk, as: 'glikk' }]
          },
          {
            model: veriftax,
            as: 'veriftax'
          },
          {
            model: kliring,
            as: 'kliring'
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
        const findOps = await ops.findOne({
          where: {
            no_transaksi: no
          }
        })
        if (findOps) {
          const findDepo = await finance.findOne({
            where: {
              kode_plant: findOps.kode_plant
            }
          })
          if (findDepo) {
            const findApp = await approve.findAll({
              where: {
                [Op.and]: [
                  { kode_plant: findOps.kode_plant },
                  { nama_approve: 'Pengajuan Ops' }
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
                    { nama_approve: 'Pengajuan Ops' }
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
        const findOps = await ops.findOne({
          where: {
            no_pembayaran: no
          }
        })
        if (findOps) {
          const findDepo = await finance.findOne({
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
  approveOps: async (req, res) => {
    try {
      const level = req.user.level
      const name = req.user.fullname
      const { no } = req.body
      const findOps = await ops.findAll({
        where: {
          no_transaksi: no
        }
      })
      if (findOps.length > 0) {
        const findDepo = await finance.findOne({
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
                          const cekData = findOps.find(({stat_skb}) => stat_skb === 'ya') === undefined ? 'ya' : 'no' // eslint-disable-line
                          // const resData = cekData === 'ya' ? 3 : 4
                          const resData = 3
                          for (let i = 0; i < findOps.length; i++) {
                            const send = {
                              status_transaksi: resData,
                              status_reject: null,
                              isreject: null,
                              tgl_fullarea: moment(),
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
      const name = req.user.fullname
      const { no } = req.body
      const findOps = await ops.findAll({
        where: {
          no_pembayaran: no
        }
      })
      if (findOps.length > 0) {
        const findDepo = await finance.findOne({
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
                              tgl_fullsublist: moment(),
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
        const findOps = await ops.findAll({
          where: {
            no_transaksi: no
          }
        })
        if (findOps.length > 0) {
          if (results.type === 'verif') {
            const temp = []
            const histRev = `reject perbaikan by ${name} at ${moment().format('DD/MM/YYYY h:mm:ss a')}; reason: ${results.alasan}`
            const histBatal = `reject pembatalan by ${name} at ${moment().format('DD/MM/YYYY h:mm:ss a')}; reason: ${results.alasan}`
            for (let i = 0; i < findOps.length; i++) {
              const listId = results.list
              if (typeReject === 'pembatalan') {
                const findFaktur = await faktur.findOne({
                  where: {
                    no_faktur: findOps[i].no_faktur
                  }
                })
                if (findFaktur) {
                  const dataEdit = {
                    status: null
                  }
                  const editFaktur = await findFaktur.update(dataEdit)
                  if (editFaktur) {
                    if (listId.find(e => e === findOps[i].id)) {
                      const send = {
                        status_transaksi: typeReject === 'pembatalan' ? 0 : findOps[i].status_transaksi,
                        status_reject: 1,
                        isreject: 1,
                        reason: results.alasan,
                        menu_rev: results.menu,
                        people_reject: level,
                        history: `${findOps[i].history}, ${typeReject === 'pembatalan' ? histBatal : histRev}`
                      }
                      const findRes = await ops.findByPk(findOps[i].id)
                      if (findRes) {
                        await findRes.update(send)
                        temp.push(1)
                      }
                    } else {
                      const send = {
                        status_transaksi: typeReject === 'pembatalan' ? 0 : findOps[i].status_transaksi,
                        status_reject: 1,
                        reason: results.alasan,
                        menu_rev: results.menu,
                        people_reject: level,
                        history: `${findOps[i].history}, ${typeReject === 'pembatalan' ? histBatal : histRev}`
                      }
                      const findRes = await ops.findByPk(findOps[i].id)
                      if (findRes) {
                        await findRes.update(send)
                        temp.push(1)
                      }
                    }
                  } else {
                    return response(res, 'failed reject batal cause edit faktur', {}, 400, false)
                  }
                } else {
                  if (listId.find(e => e === findOps[i].id)) {
                    const send = {
                      status_transaksi: typeReject === 'pembatalan' ? 0 : findOps[i].status_transaksi,
                      status_reject: 1,
                      isreject: 1,
                      reason: results.alasan,
                      menu_rev: results.menu,
                      people_reject: level,
                      history: `${findOps[i].history}, ${typeReject === 'pembatalan' ? histBatal : histRev}`
                    }
                    const findRes = await ops.findByPk(findOps[i].id)
                    if (findRes) {
                      await findRes.update(send)
                      temp.push(1)
                    }
                  } else {
                    const send = {
                      status_transaksi: typeReject === 'pembatalan' ? 0 : findOps[i].status_transaksi,
                      status_reject: 1,
                      reason: results.alasan,
                      menu_rev: results.menu,
                      people_reject: level,
                      history: `${findOps[i].history}, ${typeReject === 'pembatalan' ? histBatal : histRev}`
                    }
                    const findRes = await ops.findByPk(findOps[i].id)
                    if (findRes) {
                      await findRes.update(send)
                      temp.push(1)
                    }
                  }
                }
              } else {
                if (listId.find(e => e === findOps[i].id)) {
                  const send = {
                    status_transaksi: typeReject === 'pembatalan' ? 0 : findOps[i].status_transaksi,
                    status_reject: 1,
                    isreject: 1,
                    reason: results.alasan,
                    menu_rev: results.menu,
                    people_reject: level,
                    history: `${findOps[i].history}, ${typeReject === 'pembatalan' ? histBatal : histRev}`
                  }
                  const findRes = await ops.findByPk(findOps[i].id)
                  if (findRes) {
                    await findRes.update(send)
                    temp.push(1)
                  }
                } else {
                  const send = {
                    status_transaksi: typeReject === 'pembatalan' ? 0 : findOps[i].status_transaksi,
                    status_reject: 1,
                    reason: results.alasan,
                    menu_rev: results.menu,
                    people_reject: level,
                    history: `${findOps[i].history}, ${typeReject === 'pembatalan' ? histBatal : histRev}`
                  }
                  const findRes = await ops.findByPk(findOps[i].id)
                  if (findRes) {
                    await findRes.update(send)
                    temp.push(1)
                  }
                }
              }
            }
            if (temp.length) {
              return response(res, 'success reject ops', {})
            } else {
              return response(res, 'success reject ops', {})
            }
          } else {
            const findDepo = await finance.findOne({
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
                              const histRev = `reject perbaikan by ${name} at ${moment().format('DD/MM/YYYY h:mm:ss a')}; reason: ${results.alasan}`
                              const histBatal = `reject pembatalan by ${name} at ${moment().format('DD/MM/YYYY h:mm:ss a')}; reason: ${results.alasan}`
                              for (let i = 0; i < findOps.length; i++) {
                                const listId = results.list
                                if (typeReject === 'pembatalan') {
                                  const findFaktur = await faktur.findOne({
                                    where: {
                                      no_faktur: findOps[i].no_faktur
                                    }
                                  })
                                  if (findFaktur) {
                                    const dataEdit = {
                                      status: null
                                    }
                                    const editFaktur = await findFaktur.update(dataEdit)
                                    if (editFaktur) {
                                      if (listId.find(e => e === findOps[i].id)) {
                                        const send = {
                                          status_transaksi: typeReject === 'pembatalan' ? 0 : findOps[i].status_transaksi,
                                          status_reject: 1,
                                          isreject: 1,
                                          reason: results.alasan,
                                          menu_rev: results.menu,
                                          people_reject: level,
                                          history: `${findOps[i].history}, ${typeReject === 'pembatalan' ? histBatal : histRev}`
                                        }
                                        const findRes = await ops.findByPk(findOps[i].id)
                                        if (findRes) {
                                          await findRes.update(send)
                                          temp.push(1)
                                        }
                                      } else {
                                        const send = {
                                          status_transaksi: typeReject === 'pembatalan' ? 0 : findOps[i].status_transaksi,
                                          status_reject: 1,
                                          reason: results.alasan,
                                          menu_rev: results.menu,
                                          people_reject: level,
                                          history: `${findOps[i].history}, ${typeReject === 'pembatalan' ? histBatal : histRev}`
                                        }
                                        const findRes = await ops.findByPk(findOps[i].id)
                                        if (findRes) {
                                          await findRes.update(send)
                                          temp.push(1)
                                        }
                                      }
                                    } else {
                                      return response(res, 'failed reject batal cause edit faktur', {}, 400, false)
                                    }
                                  } else {
                                    if (listId.find(e => e === findOps[i].id)) {
                                      const send = {
                                        status_transaksi: typeReject === 'pembatalan' ? 0 : findOps[i].status_transaksi,
                                        status_reject: 1,
                                        isreject: 1,
                                        reason: results.alasan,
                                        menu_rev: results.menu,
                                        people_reject: level,
                                        history: `${findOps[i].history}, ${typeReject === 'pembatalan' ? histBatal : histRev}`
                                      }
                                      const findRes = await ops.findByPk(findOps[i].id)
                                      if (findRes) {
                                        await findRes.update(send)
                                        temp.push(1)
                                      }
                                    } else {
                                      const send = {
                                        status_transaksi: typeReject === 'pembatalan' ? 0 : findOps[i].status_transaksi,
                                        status_reject: 1,
                                        reason: results.alasan,
                                        menu_rev: results.menu,
                                        people_reject: level,
                                        history: `${findOps[i].history}, ${typeReject === 'pembatalan' ? histBatal : histRev}`
                                      }
                                      const findRes = await ops.findByPk(findOps[i].id)
                                      if (findRes) {
                                        await findRes.update(send)
                                        temp.push(1)
                                      }
                                    }
                                  }
                                } else {
                                  if (listId.find(e => e === findOps[i].id)) {
                                    const send = {
                                      status_transaksi: typeReject === 'pembatalan' ? 0 : findOps[i].status_transaksi,
                                      status_reject: 1,
                                      isreject: 1,
                                      reason: results.alasan,
                                      menu_rev: results.menu,
                                      people_reject: level,
                                      history: `${findOps[i].history}, ${typeReject === 'pembatalan' ? histBatal : histRev}`
                                    }
                                    const findRes = await ops.findByPk(findOps[i].id)
                                    if (findRes) {
                                      await findRes.update(send)
                                      temp.push(1)
                                    }
                                  } else {
                                    const send = {
                                      status_transaksi: typeReject === 'pembatalan' ? 0 : findOps[i].status_transaksi,
                                      status_reject: 1,
                                      reason: results.alasan,
                                      menu_rev: results.menu,
                                      people_reject: level,
                                      history: `${findOps[i].history}, ${typeReject === 'pembatalan' ? histBatal : histRev}`
                                    }
                                    const findRes = await ops.findByPk(findOps[i].id)
                                    if (findRes) {
                                      await findRes.update(send)
                                      temp.push(1)
                                    }
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
        const findOps = await ops.findAll({
          where: {
            no_pembayaran: no
          }
        })
        if (findOps.length > 0) {
          const findDepo = await finance.findOne({
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
                                  people_reject: level,
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
                                  people_reject: level,
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
      const name = req.user.fullname
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
        nilai_utang: joi.string().required(),
        nilai_bayar: joi.string().required(),
        nilai_buku: joi.string().required(),
        no_skb: joi.string().required(),
        jenis_pph: joi.string().required(),
        datef_skb: joi.date().required(),
        datel_skb: joi.date().required()
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 404, false)
      } else {
        const findOps = await ops.findByPk(id)
        if (findOps) {
          const updateOps = await findOps.update(results)
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
  confirmNewIdent: async (req, res) => {
    try {
      const id = req.params.id
      const findOps = await ops.findByPk(id)
      if (findOps) {
        const data = {
          new_ident: 'confirm'
        }
        const dataNull = {
          new_ident: null
        }
        if (findOps.new_ident === null || findOps.new_ident === '') {
          const updateOps = await findOps.update(data)
          if (updateOps) {
            return response(res, 'success edit verif ops', { updateOps })
          } else {
            return response(res, 'failed edit verif ops', {}, 404, false)
          }
        } else {
          const updateOps = await findOps.update(dataNull)
          if (updateOps) {
            return response(res, 'success edit verif ops', { updateOps })
          } else {
            return response(res, 'failed edit verif ops', {}, 404, false)
          }
        }
      } else {
        return response(res, 'failed edit verif ops', {}, 404, false)
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
            const findOps = await ops.findAll({
              where: {
                no_transaksi: list[i]
              }
            })
            if (findOps.length > 0) {
              const cekKasbon = findOps.find(({type_kasbon}) => type_kasbon === 'kasbon') // eslint-disable-line
              if (cekKasbon !== undefined) {
                const cekPph = findOps.find(({jenis_pph}) => jenis_pph !== 'Non PPh') === undefined ? 'ya' : 'no' // eslint-disable-line
                const cekData = findOps.find(({stat_skb}) => stat_skb === 'ya') === undefined ? 'ya' : 'no' // eslint-disable-line
                const resData = level === 2 && (cekPph === 'ya') ? 5 : 4
                // const resData = 5
                for (let j = 0; j < findOps.length; j++) {
                  const findRes = await ops.findByPk(findOps[j].id)
                  if (findRes) {
                    const data = {
                      status_transaksi: level === 2 ? resData : 5,
                      status_reject: null,
                      isreject: null,
                      tgl_veriffin: level === 2 ? moment() : findRes.tgl_veriffin,
                      tgl_veriftax: level !== 2 ? moment() : findRes.tgl_veriftax,
                      history: `${findOps[j].history}, verifikasi ${level === 2 ? 'finance' : 'tax'} pengajuan by ${name} at ${moment().format('DD/MM/YYYY h:mm:ss a')}`
                    }
                    await findRes.update(data)
                    temp.push(findRes)
                  }
                }
              } else {
                const cekData = findOps.find(({stat_skb}) => stat_skb === 'ya') === undefined ? 'ya' : 'no' // eslint-disable-line
                // const resData = level === 2 && cekData === 'ya' ? 5 : 4
                const resData = 5
                for (let j = 0; j < findOps.length; j++) {
                  const findRes = await ops.findByPk(findOps[j].id)
                  if (findRes) {
                    const data = {
                      status_transaksi: level === 2 ? resData : 5,
                      status_reject: null,
                      isreject: null,
                      tgl_veriffin: level === 2 ? moment() : findRes.tgl_veriffin,
                      tgl_veriftax: level !== 2 ? moment() : findRes.tgl_veriftax,
                      history: `${findOps[j].history}, verifikasi ${level === 2 ? 'finance' : 'tax'} pengajuan by ${name} at ${moment().format('DD/MM/YYYY h:mm:ss a')}`
                    }
                    await findRes.update(data)
                    temp.push(findRes)
                  }
                }
              }
            }
          }
          if (temp.length > 0) {
            return response(res, 'success verifikasi ops', { temp })
          } else {
            return response(res, 'success verifikasi ops', { temp })
          }
        } else {
          const findOps = await ops.findAll({
            where: {
              no_transaksi: results.no
            }
          })
          if (findOps.length > 0) {
            const cekKasbon = findOps.find(({type_kasbon}) => type_kasbon === 'kasbon') // eslint-disable-line
            if (cekKasbon !== undefined) {
              const temp = []
              const cekPph = findOps.find(({jenis_pph}) => jenis_pph !== 'Non PPh') === undefined ? 'ya' : 'no' // eslint-disable-line
              const cekData = findOps.find(({stat_skb}) => stat_skb === 'ya') === undefined ? 'ya' : 'no' // eslint-disable-line
              const resData = level === 2 && (cekPph === 'ya') ? 5 : 4
              for (let i = 0; i < findOps.length; i++) {
                const findRes = await ops.findByPk(findOps[i].id)
                if (findRes) {
                  const data = {
                    status_transaksi: level === 2 ? resData : 5,
                    status_reject: null,
                    isreject: null,
                    tgl_veriffin: level === 2 ? moment() : findRes.tgl_veriffin,
                    tgl_veriftax: level !== 2 ? moment() : findRes.tgl_veriftax,
                    history: `${findOps[i].history}, verifikasi ${level === 2 ? 'finance' : 'tax'} pengajuan by ${name} at ${moment().format('DD/MM/YYYY h:mm:ss a')}`
                  }
                  await findRes.update(data)
                  temp.push(findRes)
                }
              }
              if (temp.length > 0) {
                return response(res, 'success verifikasi ops', { cekData, resData })
              } else {
                return response(res, 'success verifikasi ops', { cekData, resData })
              }
            } else {
              const temp = []
              const cekData = findOps.find(({stat_skb}) => stat_skb === 'ya') === undefined ? 'ya' : 'no' // eslint-disable-line
              // const resData = level === 2 && cekData === 'ya' ? 5 : 4
              const resData = 5
              for (let i = 0; i < findOps.length; i++) {
                const findRes = await ops.findByPk(findOps[i].id)
                if (findRes) {
                  const data = {
                    status_transaksi: level === 2 ? resData : 5,
                    status_reject: null,
                    isreject: null,
                    tgl_veriffin: level === 2 ? moment() : findRes.tgl_veriffin,
                    tgl_veriftax: level !== 2 ? moment() : findRes.tgl_veriftax,
                    history: `${findOps[i].history}, verifikasi ${level === 2 ? 'finance' : 'tax'} pengajuan by ${name} at ${moment().format('DD/MM/YYYY h:mm:ss a')}`
                  }
                  await findRes.update(data)
                  temp.push(findRes)
                }
              }
              if (temp.length > 0) {
                return response(res, 'success verifikasi ops', { cekData, resData })
              } else {
                return response(res, 'success verifikasi ops', { cekData, resData })
              }
            }
          } else {
            return response(res, 'failed submit verifikasi ops', {}, 404, false)
          }
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  submitRealisasi: async (req, res) => {
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
            const findOps = await ops.findAll({
              where: {
                no_transaksi: list[i]
              }
            })
            if (findOps.length > 0) {
              const temp = []
              const cekData = findOps.find(({jenis_pph}) => jenis_pph !== 'Non PPh') === undefined ? 'ya' : 'no' // eslint-disable-line
              const resData = level === 2 && cekData === 'ya' ? 11 : 10
              for (let j = 0; j < findOps.length; j++) {
                const findRes = await ops.findByPk(findOps[j].id)
                if (findRes) {
                  const data = {
                    status_transaksi: level === 5 ? 9 : level === 2 ? resData : 11,
                    status_reject: null,
                    isreject: null,
                    history: `${findOps[j].history}, ${level === 5 ? 'submit' : 'verifikasi'}  ${level === 5 ? '' : level === 2 ? 'finance' : 'tax'} realisasi kasbon by ${name} at ${moment().format('DD/MM/YYYY h:mm:ss a')}`
                  }
                  await findRes.update(data)
                  temp.push(findRes)
                }
              }
            }
          }
          if (temp.length > 0) {
            return response(res, 'success verifikasi ops', { temp })
          } else {
            return response(res, 'success verifikasi ops', { temp })
          }
        } else {
          const findOps = await ops.findAll({
            where: {
              no_transaksi: results.no
            }
          })
          if (findOps.length > 0) {
            const temp = []
            const cekData = findOps.find(({jenis_pph}) => jenis_pph !== 'Non PPh') === undefined ? 'ya' : 'no' // eslint-disable-line
            const resData = level === 2 && cekData === 'ya' ? 11 : 10
            for (let i = 0; i < findOps.length; i++) {
              const findRes = await ops.findByPk(findOps[i].id)
              if (findRes) {
                const data = {
                  status_transaksi: level === 5 ? 9 : level === 2 ? resData : 11,
                  status_reject: null,
                  isreject: null,
                  history: `${findOps[i].history}, ${level === 5 ? 'submit' : 'verifikasi'}  ${level === 5 ? '' : level === 2 ? 'finance' : 'tax'} realisasi kasbon by ${name} at ${moment().format('DD/MM/YYYY h:mm:ss a')}`
                }
                await findRes.update(data)
                temp.push(findRes)
              }
            }
            if (temp.length > 0) {
              return response(res, 'success verifikasi ops', { cekData, resData })
            } else {
              return response(res, 'success verifikasi ops', { cekData, resData })
            }
          } else {
            return response(res, 'failed submit verifikasi ops', {}, 404, false)
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
                  tgl_sublist: moment(),
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
  },
  getReport: async (req, res) => {
    try {
      const level = req.user.level
      const kode = req.user.kode
      const name = req.user.fullname
      const { status, reject, menu, time1, time2, search } = req.query
      const searchValue = search || ''
      const statTrans = status === 'undefined' || status === null ? 8 : status
      const statRej = reject === 'undefined' ? null : reject
      const statMenu = menu === 'undefined' ? null : menu
      const timeVal1 = time1 === 'undefined' ? 'all' : time1
      const timeVal2 = time2 === 'undefined' ? 'all' : time2
      const timeV1 = moment(timeVal1)
      const timeV2 = timeVal1 !== 'all' && timeVal1 === timeVal2 ? moment(timeVal2).add(1, 'd') : moment(timeVal2)
      if (level === 5) {
        const findOps = await ops.findAll({
          where: {
            kode_plant: kode,
            [Op.and]: [
              statTrans === 'all' ? { [Op.not]: { id: null } } : { status_transaksi: statTrans },
              statRej === 'all' ? { [Op.not]: { id: null } } : { status_reject: statRej },
              statMenu === 'all' ? { [Op.not]: { id: null } } : { menu_rev: { [Op.like]: `%${statMenu}%` } },
              timeVal1 === 'all'
                ? { [Op.not]: { id: null } }
                : {
                    start_ops: {
                      [Op.gte]: timeV1,
                      [Op.lt]: timeV2
                    }
                  },
              { [Op.not]: { status_transaksi: null } },
              { [Op.not]: { status_transaksi: 1 } }
            ],
            [Op.or]: [
              { no_coa: { [Op.like]: `%${searchValue}%` } },
              { sub_coa: { [Op.like]: `%${searchValue}%` } },
              { nama_coa: { [Op.like]: `%${searchValue}%` } },
              { keterangan: { [Op.like]: `%${searchValue}%` } },
              { no_faktur: { [Op.like]: `%${searchValue}%` } },
              { nama_vendor: { [Op.like]: `%${searchValue}%` } },
              { alamat_vendor: { [Op.like]: `%${searchValue}%` } },
              // { tgl_tagihanbayar: { [Op.like]: `%${searchValue}%` } },
              { nama_tujuan: { [Op.like]: `%${searchValue}%` } },
              { nama_ktp: { [Op.like]: `%${searchValue}%` } },
              { nama_npwp: { [Op.like]: `%${searchValue}%` } },
              { no_ktp: { [Op.like]: `%${searchValue}%` } },
              { no_npwp: { [Op.like]: `%${searchValue}%` } },
              { no_transaksi: { [Op.like]: `%${searchValue}%` } },
              { no_pembayaran: { [Op.like]: `%${searchValue}%` } }
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
              model: finance,
              as: 'depo',
              include: [{ model: kpp, as: 'kpp' }, { model: glikk, as: 'glikk' }]
            },
            {
              model: veriftax,
              as: 'veriftax'
            },
            {
              model: finance,
              as: 'finance'
            },
            {
              model: taxcode,
              as: 'taxcode'
            }
          ]
        })
        if (findOps) {
          return response(res, 'success get data ops', { result: findOps })
        } else {
          return response(res, 'success get data ops', { result: findOps })
        }
      } else if (access.find(item => item === level) !== undefined) {
        const findDepo = await finance.findAll({
          where: {
            [Op.or]: [
              { bm: level === 10 ? name : 'undefined' },
              { rom: level === 11 ? name : 'undefined' },
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
            const result = await ops.findAll({
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
                  { area: { [Op.like]: `%${searchValue}%` } },
                  { cost_center: { [Op.like]: `%${searchValue}%` } },
                  { no_coa: { [Op.like]: `%${searchValue}%` } },
                  { sub_coa: { [Op.like]: `%${searchValue}%` } },
                  { nama_coa: { [Op.like]: `%${searchValue}%` } },
                  { keterangan: { [Op.like]: `%${searchValue}%` } },
                  { no_faktur: { [Op.like]: `%${searchValue}%` } },
                  { nama_vendor: { [Op.like]: `%${searchValue}%` } },
                  { alamat_vendor: { [Op.like]: `%${searchValue}%` } },
                  // { tgl_tagihanbayar: { [Op.like]: `%${searchValue}%` } },
                  { nama_tujuan: { [Op.like]: `%${searchValue}%` } },
                  { nama_ktp: { [Op.like]: `%${searchValue}%` } },
                  { nama_npwp: { [Op.like]: `%${searchValue}%` } },
                  { no_ktp: { [Op.like]: `%${searchValue}%` } },
                  { no_npwp: { [Op.like]: `%${searchValue}%` } },
                  { no_transaksi: { [Op.like]: `%${searchValue}%` } },
                  { no_pembayaran: { [Op.like]: `%${searchValue}%` } }
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
                  model: finance,
                  as: 'depo',
                  include: [{ model: kpp, as: 'kpp' }, { model: glikk, as: 'glikk' }]
                },
                {
                  model: veriftax,
                  as: 'veriftax'
                },
                {
                  model: finance,
                  as: 'finance'
                },
                {
                  model: taxcode,
                  as: 'taxcode'
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
            return response(res, 'success get ops', { result })
          } else {
            const result = hasil
            return response(res, 'success get ops', { result })
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
              statMenu === 'all' ? { [Op.not]: { id: null } } : { menu_rev: { [Op.like]: `%${statMenu}%` } },
              timeVal1 === 'all'
                ? { [Op.not]: { id: null } }
                : {
                    start_ops: {
                      [Op.gte]: timeV1,
                      [Op.lt]: timeV2
                    }
                  }
            ],
            [Op.or]: [
              { kode_plant: { [Op.like]: `%${searchValue}%` } },
              { area: { [Op.like]: `%${searchValue}%` } },
              { cost_center: { [Op.like]: `%${searchValue}%` } },
              { no_coa: { [Op.like]: `%${searchValue}%` } },
              { sub_coa: { [Op.like]: `%${searchValue}%` } },
              { nama_coa: { [Op.like]: `%${searchValue}%` } },
              { keterangan: { [Op.like]: `%${searchValue}%` } },
              { no_faktur: { [Op.like]: `%${searchValue}%` } },
              { nama_vendor: { [Op.like]: `%${searchValue}%` } },
              { alamat_vendor: { [Op.like]: `%${searchValue}%` } },
              // { tgl_tagihanbayar: { [Op.like]: `%${searchValue}%` } },
              { nama_tujuan: { [Op.like]: `%${searchValue}%` } },
              { nama_ktp: { [Op.like]: `%${searchValue}%` } },
              { nama_npwp: { [Op.like]: `%${searchValue}%` } },
              { no_ktp: { [Op.like]: `%${searchValue}%` } },
              { no_npwp: { [Op.like]: `%${searchValue}%` } },
              { no_transaksi: { [Op.like]: `%${searchValue}%` } },
              { no_pembayaran: { [Op.like]: `%${searchValue}%` } }
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
              model: finance,
              as: 'depo',
              include: [{ model: kpp, as: 'kpp' }, { model: glikk, as: 'glikk' }]
            },
            {
              model: veriftax,
              as: 'veriftax'
            },
            {
              model: finance,
              as: 'finance'
            },
            {
              model: taxcode,
              as: 'taxcode'
            }
          ]
        })
        if (findOps) {
          return response(res, 'success get data ops', { result: findOps })
        } else {
          return response(res, 'success get data ops', { result: findOps })
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
        jenis_form: 'List Ops',
        no_transaksi: no,
        tipe: 'List Ajuan Bayar Ops',
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
            divisi: 'ops',
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
      const findOps = await ops.findAll({
        where: {
          no_pembayaran: no
        }
      })
      if (findOps.length > 0) {
        const temp = []
        for (let i = 0; i < findOps.length; i++) {
          const findData = await ops.findByPk(findOps[i].id)
          if (findData) {
            const data = {
              tgl_submitbukti: moment(),
              status_transaksi: 8,
              status_reject: null,
              isreject: null,
              history: `${findOps[i].history}, submit bukti bayar by ${name} at ${moment().format('DD/MM/YYYY h:mm:ss a')}`
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
  revisiKasbon: async (req, res) => {
    try {
      const level = req.user.level
      const name = req.user.fullname
      const schema = joi.object({
        no: joi.string().required(),
        alasan: joi.string().required(),
        list: joi.array(),
        type: joi.string(),
        stat_kasbon: joi.string()
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
          const temp = []
          for (let i = 0; i < findOps.length; i++) {
            const listId = results.list
            if (listId.find(e => e === findOps[i].id)) {
              const send = {
                status_reject: 1,
                isreject: 1,
                reason: results.alasan,
                people_reject: level,
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
                stat_kasbon: results.stat_kasbon,
                people_reject: level,
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
          return response(res, 'failed revisi kasbon', {}, 400, false)
        }
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
        end_ops: moment()
      }
      const findOps = await ops.findAll({
        where: {
          no_transaksi: no
        }
      })
      if (findOps.length > 0) {
        const temp = []
        for (let i = 0; i < findOps.length; i++) {
          if (type === 'all') {
            const findData = await ops.findByPk(findOps[i].id)
            if (findData) {
              const data = {
                type_nilaiverif: type,
                nilai_verif: nilai,
                status_reject: null,
                isreject: null,
                tgl_getdana: tglGetDana,
                end_ops: moment(),
                history: `${findOps[i].history}, input nilai yang diterima by ${name} at ${moment().format('DD/MM/YYYY h:mm:ss a')}`
              }
              await findData.update(data)
              temp.push(findData)
            }
          } else {
            const findData = await ops.findByPk(id)
            if (findData) {
              const data = {
                type_nilaiverif: type,
                nilai_verif: nilai,
                status_reject: null,
                isreject: null,
                tgl_getdana: tglGetDana,
                history: `${findOps[i].history}, input nilai yang diterima by ${name} at ${moment().format('DD/MM/YYYY h:mm:ss a')}`
              }
              await findData.update(data)
              temp.push(findData)
            }
          }
        }
        if (type === 'all') {
          return response(res, 'success update nilai bayar')
        } else {
          const cekOps = await ops.findAll({
            where: {
              no_transaksi: no,
              [Op.not]: [
                { nilai_verif: null }
              ]
            }
          })
          if (cekOps.length === findOps.length) {
            const cekData = []
            for (let i = 0; i < cekOps.length; i++) {
              const findData = await ops.findByPk(cekOps[i].id)
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
  }
}
