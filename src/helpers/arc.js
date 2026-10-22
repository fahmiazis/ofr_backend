const { mapping_arc, finance, ops, ttd, approve } = require('../models')
const { Op } = require('sequelize')

const LEVEL_SPV_ARC = 53
const NAMA_APPROVE_ARC = 'Pengajuan Ops ARC'

const isVacant = (val) => val === null || val === undefined || `${val}`.toLowerCase() === 'vacant'

// urutan ttd mengikuti urutan template approval (id ASC): pembuat lalu approver
const findTtdUrut = (no) => ttd.findAll({ where: { no_transaksi: no }, order: [['id', 'ASC']] })

module.exports = {
  LEVEL_SPV_ARC,
  NAMA_APPROVE_ARC,
  // daftar area yang boleh diwakili user AR Center, urut nama area
  getAreaArc: async (username) => {
    let listMap = []
    try {
      listMap = await mapping_arc.findAll({
        where: { username },
        include: [{ model: finance, as: 'finance', attributes: ['kode_plant', 'area', 'profit_center'] }]
      })
    } catch (error) {
      // tabel belum dimigrasi jangan sampai memblokir login
      console.log('mapping arc tidak dapat dibaca:', error.message)
    }
    return listMap
      .filter(item => item.finance !== null)
      .map(item => ({ kode_plant: item.kode_plant, area: item.finance.area, profit_center: item.finance.profit_center }))
      .sort((a, b) => `${a.area}`.localeCompare(`${b.area}`))
  },
  // area yang di-cover AR Center tidak boleh mengajukan jenis transaksi AR Center
  isCoveredArc: async (kodePlant) => {
    try {
      const findMap = await mapping_arc.findOne({ where: { kode_plant: kodePlant }, attributes: ['id'] })
      return findMap !== null
    } catch (error) {
      console.log('mapping arc tidak dapat dibaca:', error.message)
      return false
    }
  },
  // keranjang ajuan dipisah: AR Center per user, area hanya milik area sendiri
  ownerCart: (user) => user.arc
    ? { is_arc: 1, created_by: user.name }
    : { [Op.or]: [{ is_arc: 0 }, { is_arc: null }] },
  // siapkan ttd ajuan AR Center: PIC (pembuat) > SPV ARC > ROM > NOM > NODM dari template NAMA_APPROVE_ARC
  // return null bila template belum diatur di Setting Approval
  siapkanTtdArc: async (findOps) => {
    const no = findOps.no_transaksi
    const findDepo = await finance.findOne({ where: { kode_plant: findOps.kode_plant } })
    const romVacant = findDepo === null || isVacant(findDepo.rom)
    const listTtd = await findTtdUrut(no)
    if (listTtd.length === 0) {
      const findPlant = await approve.findAll({
        where: { nama_approve: NAMA_APPROVE_ARC, kode_plant: findOps.kode_plant },
        order: [['id', 'ASC']]
      })
      const findApp = findPlant.length > 0
        ? findPlant
        : await approve.findAll({
          where: { nama_approve: NAMA_APPROVE_ARC, kode_plant: 'all' },
          order: [['id', 'ASC']]
        })
      if (findApp.length === 0) return null
      for (let i = 0; i < findApp.length; i++) {
        const isPembuat = findApp[i].sebagai === 'pembuat'
        if (!(findApp[i].jabatan.toLowerCase() === 'rom' && romVacant)) {
          await ttd.create({
            jabatan: findApp[i].jabatan,
            nama: isPembuat ? findOps.created_name : null,
            status: isPembuat ? 1 : null,
            no_transaksi: no,
            sebagai: findApp[i].sebagai,
            jenis: findApp[i].jenis,
            kategori: findApp[i].kategori
          })
        }
      }
    } else if (findOps.status_transaksi <= 2) {
      // master finance bisa berubah setelah ttd dibuat
      for (let i = 0; i < listTtd.length; i++) {
        if (listTtd[i].jabatan.toLowerCase() === 'rom' && romVacant && listTtd[i].status === null) {
          await listTtd[i].destroy()
        } else if (listTtd[i].sebagai === 'pembuat' && listTtd[i].status !== '1') {
          await listTtd[i].update({ nama: findOps.created_name, status: 1 })
        }
      }
    }
    return findTtdUrut(no)
  },
  // dari daftar no transaksi, ambil ajuan AR Center yang sedang menunggu approval roleUser:
  // ttd roleUser belum approve dan ttd sebelumnya sudah approve
  cekGiliranArc: async (listNo, roleUser) => {
    const uniqNo = [...new Set(listNo)]
    if (uniqNo.length === 0) return []
    const listArc = await ops.findAll({
      where: { no_transaksi: uniqNo, is_arc: 1 },
      attributes: ['no_transaksi'],
      group: ['no_transaksi']
    })
    const listTtd = listArc.length === 0
      ? []
      : await ttd.findAll({
        where: { no_transaksi: listArc.map(x => x.no_transaksi) },
        order: [['id', 'ASC']]
      })
    return listArc.filter(item => {
      const app = listTtd.filter(x => x.no_transaksi === item.no_transaksi)
      const find = app.findIndex(x => x.jabatan === roleUser)
      return find > 0 && (app[find].status === null || app[find].status === '0') && app[find - 1].status === '1'
    }).map(item => ({ no_transaksi: item.no_transaksi }))
  },
  // data pembuat ajuan yang disimpan di ops
  dataPembuat: (user) => ({
    is_arc: user.arc ? 1 : 0,
    created_by: user.name,
    created_name: user.fullname
  })
}
