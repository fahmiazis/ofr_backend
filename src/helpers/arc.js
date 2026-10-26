const { mapping_arc, finance, ops, ttd, approve } = require('../models')
const { Op } = require('sequelize')

const LEVEL_SPV_ARC = 53
const LEVEL_ROM_ARC = 54
const NAMA_APPROVE_ARC = 'Pengajuan Ops ARC'
// kolom master finance untuk approver ajuan AR Central per level (NOM sama dengan area)
const KOLOM_APPROVER_ARC = { [LEVEL_SPV_ARC]: 'spv_arc', [LEVEL_ROM_ARC]: 'rom_arc', 12: 'nom' }
// level yang bukan approver ajuan AR Central / khusus AR Central: list area & ARC dipisah
const LEVEL_PISAH_ARC = [10, 11, LEVEL_SPV_ARC, LEVEL_ROM_ARC]
// kolom master finance yang hanya berlaku untuk ajuan area / ajuan AR Central
const KOLOM_KHUSUS_AREA = ['rom', 'bm']
const KOLOM_KHUSUS_ARC = ['rom_arc', 'spv_arc']

const isVacant = (val) => val === null || val === undefined || ['', 'vacant'].includes(`${val}`.trim().toLowerCase())

// urutan ttd mengikuti urutan template approval (id ASC): pembuat lalu approver
const findTtdUrut = (no) => ttd.findAll({ where: { no_transaksi: no }, order: [['id', 'ASC']] })

module.exports = {
  LEVEL_SPV_ARC,
  LEVEL_ROM_ARC,
  NAMA_APPROVE_ARC,
  LEVEL_PISAH_ARC,
  // daftar area yang boleh diwakili user AR Central, urut nama area
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
  // filter area list ajuan user AR Central: 'all' = seluruh area mapping, area mapping tertentu, selain itu area aktif
  // tanpa area_arc (halaman lain, mis. revisi) = seluruh area mapping
  kodeFilterArc: async (user, areaArc) => {
    if (areaArc === user.kode) return user.kode
    const listKode = (await module.exports.getAreaArc(user.name)).map(x => x.kode_plant)
    if (areaArc === undefined || areaArc === '' || areaArc === 'all') return listKode.length > 0 ? listKode : [user.kode]
    return listKode.includes(areaArc) ? areaArc : user.kode
  },
  // area yang di-cover AR Central tidak boleh mengajukan jenis transaksi AR Central
  isCoveredArc: async (kodePlant) => {
    try {
      const findMap = await mapping_arc.findOne({ where: { kode_plant: kodePlant }, attributes: ['id'] })
      return findMap !== null
    } catch (error) {
      console.log('mapping arc tidak dapat dibaca:', error.message)
      return false
    }
  },
  // keranjang ajuan dipisah: AR Central per user, area hanya milik area sendiri
  ownerCart: (user) => user.arc
    ? { is_arc: 1, created_by: user.name }
    : { [Op.or]: [{ is_arc: 0 }, { is_arc: null }] },
  // siapkan ttd ajuan AR Central: PIC (pembuat) > SPV ARC > ROM ARC > NOM > NODM dari template NAMA_APPROVE_ARC
  // return null bila template belum diatur di Setting Approval
  siapkanTtdArc: async (findOps) => {
    const no = findOps.no_transaksi
    const findDepo = await finance.findOne({ where: { kode_plant: findOps.kode_plant } })
    // ROM ajuan AR Central (role ROM_ARC) dari kolom rom_arc, bukan ROM area
    const romVacant = findDepo === null || isVacant(findDepo.rom_arc)
    const isJabatanRom = (jabatan) => ['rom', 'rom_arc'].includes(`${jabatan}`.toLowerCase())
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
        if (!(isJabatanRom(findApp[i].jabatan) && romVacant)) {
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
        if (isJabatanRom(listTtd[i].jabatan) && romVacant && listTtd[i].status === null) {
          await listTtd[i].destroy()
        } else if (listTtd[i].sebagai === 'pembuat' && listTtd[i].status !== '1') {
          await listTtd[i].update({ nama: findOps.created_name, status: 1 })
        }
      }
    }
    return findTtdUrut(no)
  },
  // kode plant yang approver ajuan AR Central-nya user ini (by nama / email di master finance)
  getAreaApproverArc: async (level, name, email, listDepo = 'all') => {
    const kolom = KOLOM_APPROVER_ARC[parseInt(level)]
    if (!kolom) return []
    const listArea = await finance.findAll({
      where: { [kolom]: [name, email].filter(x => x) },
      attributes: ['kode_plant']
    })
    const depoArr = listDepo === 'all' ? null : `${listDepo}`.split(',')
    return listArea.map(x => x.kode_plant).filter(kode => depoArr === null || depoArr.includes(kode))
  },
  // ajuan AR Central di area listKode yang sedang menunggu approval roleUser:
  // ttd roleUser belum approve dan ttd sebelumnya sudah approve
  cekGiliranArc: async (roleUser, listKode) => {
    if (listKode.length === 0) return []
    const listArc = await ops.findAll({
      where: { kode_plant: listKode, is_arc: 1, status_transaksi: 2 },
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
  // no transaksi ajuan AR Central dari daftar no transaksi
  getNoArc: async (listNo) => {
    const uniqNo = [...new Set(listNo)]
    if (uniqNo.length === 0) return []
    const listArc = await ops.findAll({
      where: { no_transaksi: uniqNo, is_arc: 1 },
      attributes: ['no_transaksi'],
      group: ['no_transaksi']
    })
    return listArc.map(x => x.no_transaksi)
  },
  // nilai master finance untuk mencari penerima email (to / cc):
  // ajuan AR Central pakai rom_arc/spv_arc dan PIC pembuat menggantikan AOS area, ajuan area pakai rom/bm/aos
  namaApproverArea: (findDepo, isArc, pembuat = null) => {
    const buang = isArc ? [...KOLOM_KHUSUS_AREA, 'aos'] : KOLOM_KHUSUS_ARC
    const listName = Object.keys(findDepo.dataValues).filter(key => !buang.includes(key)).map(key => findDepo.dataValues[key])
    return isArc && pembuat ? [...listName, pembuat.fullname, pembuat.email] : listName
  },
  // ajuan AR Central hanya diubah / direvisi user AR Central, ajuan area hanya oleh area
  cekPemilikArc: (user, trans) => {
    if (parseInt(user.level) !== 5 || !trans) return null
    const isArc = parseInt(trans.is_arc) === 1
    if (isArc && !user.arc) return 'Ajuan AR Central hanya dapat diubah oleh user AR Central'
    if (!isArc && user.arc) return 'Ajuan area hanya dapat diubah oleh area tersebut'
    return null
  },
  // data pembuat ajuan yang disimpan di ops
  dataPembuat: (user) => ({
    is_arc: user.arc ? 1 : 0,
    created_by: user.name,
    created_name: user.fullname
  })
}
