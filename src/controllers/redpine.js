const { ikk, glikk, ttd, veriftax, finance, kliring, kpp, taxcode, ops, scylla } = require('../models')
const { Op } = require('sequelize')
const response = require('../helpers/response')
const moment = require('moment')
const axios = require('axios')
const jurnal2 = [1, 2]
const jurnal3 = [1, 2, 3]
const jurnal4 = [1, 2, 3, 4]
const cek21 = 'PPh Pasal 21'
const cek23 = 'PPh Pasal 23'
const cek4a2 = 'PPh Pasal 4(2)'
const dataPph = {
  pph21: '21050107',
  pph23: '21050102',
  ppn: '11060204',
  pph4a2: '21050101',
  kasbon: 'V100IN0001',
  bankops: '11010401',
  pc_ho: 'P01H000001'
}
const dataPphSc = {
  pph21: '213710',
  pph23: '213210',
  ppn: '11060204',
  pph4a2: '213110',
  kasbon: 'V100IN0001',
  bankops: '11010401',
  pc_ho: 'P01H000001'
}

module.exports = {
  getRedpine: async (req, res) => {
    try {
      const { kode, notrans, time1, time2, tipe } = req.body.filters
      const statTrans = 8
      const statKode = kode === 'undefined' || kode === undefined || kode === null || kode === '' ? 'all' : kode
      const statNo = notrans === 'undefined' || notrans === undefined || notrans === null || notrans === '' ? 'all' : notrans
      const timeVal1 = time1 === 'undefined' || time1 === undefined || time1 === null || time1 === '' || time2 === 'undefined' || time2 === undefined || time2 === null || time2 === '' ? 'all' : moment(time1).format('DD-MM-YYYY')
      const timeVal2 = time2 === 'undefined' || time2 === undefined || time2 === null || time2 === '' ? 'all' : moment(time2).format('DD-MM-YYYY')
      const tipeVal = tipe === 'undefined' || tipe === undefined || tipe === null || tipe === '' ? 'ikk' : tipe

      console.log(timeVal1)
      console.log(timeVal2)

      const timeV1 = new Date(timeVal1)
      const timeV2 = new Date(timeVal1 !== 'all' && timeVal1 === timeVal2 ? moment(timeVal2).add(1, 'd') : moment(timeVal2).add(1, 'd'))
      const transaksi = tipeVal === 'ikk' ? ikk : ops
      const findTrans = await transaksi.findAll({
        where: {
          status_transaksi: { [Op.like]: `%${statTrans}%` },
          [Op.and]: [
            statKode === 'all' ? { [Op.not]: { id: null } } : { kode_plant: statKode },
            statNo === 'all' ? { [Op.not]: { id: null } } : { no_transaksi: { [Op.like]: `%${statNo}%` } },
            timeVal1 === 'all'
              ? { [Op.not]: { id: null } }
              : {
                  [tipeVal === 'ikk' ? 'start_ikk' : 'start_ops']: {
                    [Op.gte]: timeV1,
                    [Op.lt]: timeV2
                  }
                }
          ]
        },
        order: [['id', 'desc']],
        include: [
          {
            model: finance,
            as: 'depo',
            include: [{ model: kpp, as: 'kpp' }, { model: glikk, as: 'glikk' }, { model: scylla, as: 'scylla' }]
          }
        ]
      })
      const data = []
      findTrans.map(x => {
        return (
          data.push(x.no_transaksi)
        )
      })
      const set = new Set(data)
      const noDis = [...set]
      if (findTrans.length > 0) {
        const dataJurnal = []
        for (let i = 0; i < noDis.length; i++) {
          const findData = await transaksi.findAll({
            where: {
              no_transaksi: noDis[i]
            },
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
              },
              {
                model: taxcode,
                as: 'taxcode'
              }
            ]
          })
          const tempTrans = []
          if (findData.length > 0) {
            for (let j = 0; j < findData.length; j++) {
              console.log('king findData')
              const system = findData.length > 0 && findData[j].depo.type_live === 'NON LIVE SAP (SCYLLA)' ? 'SCYLAA' : 'SAP'
              const glkk = findData.length > 0 && findData[j].depo !== null && findData[j].depo.glikk !== null ? findData[j].depo.glikk.gl_account : ''

              //   if (findData[j].no_transaksi === noDis[i]) {
              // if ((jenisPph === 'Non PPh' || jenisPph === null) && tipeTrans !== 'Ya') {
              //   data.item = [[
              //     { no_gl: findData[j].nama_coa, nama_gl: null, value: findData[j].nilai_ajuan, type: null, keterangan: ketCoa },
              //     { no_gl: 'Kas Kecil', nama_gl: null, value: null, type: findData[j].nilai_ajuan, keterangan: ketCoa }
              //   ]]
              // } else if (jenisPph !== 'Non PPh' && tipeTrans !== 'Ya') {
              //   data.item = [[
              //     { no_gl: findData[j].nama_coa, nama_gl: jenisPph, value: findData[j].nilai_ajuan, type: null, keterangan: ketCoa },
              //     { no_gl: `Utang ${jenisPph}`, nama_gl: jenisPph, value: null, type: findData[j].nilai_utang, keterangan: ketCoa },
              //     { no_gl: 'Kas Kecil', nama_gl: jenisPph, value: null, type: findData[j].nilai_bayar, keterangan: ketCoa }
              //   ]]
              // } else if (jenisPph !== 'Non PPh' && tipeTrans === 'Ya') {
              //   data.item = [[
              //     { no_gl: findData[j].nama_coa, nama_gl: jenisPph, value: findData[j].dpp, type: null, keterangan: ketCoa },
              //     { no_gl: 'PPN Masukan Non Dagang', nama_gl: jenisPph, value: findData[j].ppn, type: null, keterangan: ketCoa },
              //     { no_gl: `Utang ${jenisPph}`, nama_gl: jenisPph, value: null, type: findData[j].nilai_utang, keterangan: ketCoa },
              //     { no_gl: 'Kas Kecil', nama_gl: jenisPph, value: null, type: findData[j].nilai_bayar, keterangan: ketCoa }
              //   ]]
              // }
              if ((findData[j].jenis_pph === 'Non PPh' || findData[j].jenis_pph === null) && findData[j].type_transaksi !== 'Ya') {
                console.log('king non pph non ppn')
                tempTrans.push(
                  jurnal2.map((e, index) => {
                    return (
                      {
                        no_gl: index === 0 ? findData[j].no_coa : glkk,
                        nama_gl: index === 0 ? findData[j].nama_coa : 'Kas Kecil',
                        tipe: index === 0 ? 'debit' : 'credit',
                        value: index === 0
                          ? findData[j].nilai_buku !== null && findData[j].nilai_buku.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
                          : index === 1 ? findData[j].nilai_buku !== null && findData[j].nilai_buku.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') : '',
                        keterangan: index === 0 ? findData[j].sub_coa : ''
                      }
                    )
                  })
                )
              } else if (findData[j].jenis_pph !== 'Non PPh' && findData[j].type_transaksi !== 'Ya') {
                console.log('king pph non ppn')
                tempTrans.push(
                  jurnal3.map((e, index) => {
                    return (
                      {
                        no_gl: index === 0
                          ? findData[j].no_coa
                          : index === 1 && system === 'SAP'
                            ? (findData[j].jenis_pph === cek21
                                ? dataPph.pph21
                                : findData[j].jenis_pph === cek23
                                  ? dataPph.pph23
                                  : findData[j].jenis_pph === cek4a2 && dataPph.pph4a2)
                            : index === 1 && system !== 'SAP'
                              ? (findData[j].jenis_pph === cek21
                                  ? dataPphSc.pph21
                                  : findData[j].jenis_pph === cek23
                                    ? dataPphSc.pph23
                                    : findData[j].jenis_pph === cek4a2 && dataPphSc.pph4a2)
                              : glkk,
                        nama_gl: index === 0 ? findData[j].nama_coa : index === 1 ? `Utang ${findData[j].jenis_pph}` : index === 2 ? 'Kas Kecil' : '',
                        tipe: index === 0 ? 'debit' : 'credit',
                        value: index === 0
                          ? findData[j].nilai_buku !== null && findData[j].nilai_buku.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
                          : index === 1
                            ? findData[j].nilai_utang !== null && findData[j].nilai_utang.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
                            : index === 2
                              ? findData[j].nilai_bayar !== null && findData[j].nilai_bayar.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
                              : '',
                        keterangan: index === 0 || index === 1 ? findData[j].sub_coa : ''
                      }
                    )
                  })
                )
              } else if (findData[j].jenis_pph === 'Non PPh' && findData[j].type_transaksi === 'Ya') {
                console.log('king ppn non pph')
                tempTrans.push(
                  jurnal3.map((e, index) => {
                    return (
                      {
                        no_gl: index === 0 ? findData[j].no_coa : index === 1 ? dataPph.ppn : glkk,
                        nama_gl: index === 0 ? findData[j].nama_coa : index === 1 ? 'PPN Masukan Non Dagang' : index === 2 ? 'Kas Kecil' : '',
                        tipe: index === 2 ? 'credit' : 'debit',
                        value: index === 0
                          ? findData[j].dpp !== null && findData[j].dpp.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
                          : index === 1
                            ? findData[j].ppn !== null && findData[j].ppn.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
                            : index === 2
                              ? findData[j].nilai_bayar !== null && findData[j].nilai_bayar.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
                              : '',
                        keterangan: index === 0 || index === 1 ? findData[j].sub_coa : ''
                      }
                    )
                  })
                )
              } else if (findData[j].jenis_pph !== 'Non PPh' && findData[j].type_transaksi === 'Ya') {
                console.log('king ppn pph')
                tempTrans.push(
                  jurnal4.map((e, index) => {
                    return (
                      {
                        no_gl: index === 0
                          ? findData[j].no_coa
                          : index === 1
                            ? dataPph.ppn
                            : index === 2 && system === 'SAP'
                              ? (findData[j].jenis_pph === cek21
                                  ? dataPph.pph21
                                  : findData[j].jenis_pph === cek23
                                    ? dataPph.pph23
                                    : findData[j].jenis_pph === cek4a2 && dataPph.pph4a2)
                              : index === 2 && system !== 'SAP'
                                ? (findData[j].jenis_pph === cek21
                                    ? dataPphSc.pph21
                                    : findData[j].jenis_pph === cek23
                                      ? dataPphSc.pph23
                                      : findData[j].jenis_pph === cek4a2 && dataPphSc.pph4a2)
                                : glkk,
                        nama_gl: index === 0 ? findData[j].nama_coa : index === 1 ? 'PPN Masukan Non Dagang' : index === 2 ? `Utang ${findData[j].jenis_pph}` : index === 3 ? 'Kas Kecil' : '',
                        tipe: index === 0 || index === 1 ? 'debit' : 'credit',
                        value: index === 0
                          ? findData[j].dpp !== null && findData[j].dpp.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
                          : index === 1
                            ? findData[j].ppn !== null && findData[j].ppn.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
                            : index === 2
                              ? findData[j].nilai_utang !== null && findData[j].nilai_utang.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
                              : index === 3
                                ? findData[j].nilai_bayar !== null && findData[j].nilai_bayar.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
                                : '',
                        keterangan: index === 0 || index === 1 || index === 2 ? findData[j].sub_coa : ''
                      }
                    )
                  })
                )
              }
            //   }
            }
          }
          const data = {
            no_ofr: noDis[i],
            kode_plant: findTrans.find(({no_transaksi}) => no_transaksi === noDis[i]).kode_plant,  // eslint-disable-line
            kode_depo: findTrans.find(({no_transaksi}) => no_transaksi === noDis[i]).depo.scylla.kode_depo,  // eslint-disable-line
            area: findTrans.find(({no_transaksi}) => no_transaksi === noDis[i]).depo.area,  // eslint-disable-line
            tgl_ajuan: moment(findTrans.find(({no_transaksi}) => no_transaksi === noDis[i])[tipeVal === 'ikk' ? 'start_ikk' : 'start_ops']).format('DD MMMM YYYY'), // eslint-disable-line
            item: tempTrans
          }
          dataJurnal.push(data)
        }
        if (dataJurnal.length > 0) {
          const temp = []
          for (let i = 0; i < findTrans.length; i++) {
            const findData = await transaksi.findByPk(findTrans[i].id)
            if (findData) {
              const data = {
                flag_redpine: findData.flag_redpine + 1
              }
              const updateData = await findData.update(data)
              if (updateData) {
                temp.push(updateData)
              }
            }
          }
          if (temp.length > 0) {
            return response(res, 'success get jurnal ', { result: dataJurnal })
          } else {
            return response(res, 'data kosong', { result: dataJurnal })
          }
        } else {
          return response(res, 'data kosong', { result: findTrans })
        }
      } else {
        return response(res, 'data kosong', { result: findTrans })
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getRedpineParams: async (req, res) => {
    try {
      const { kode, notrans, time1, time2, tipe } = req.query
      const statTrans = 8
      const statKode = kode === 'undefined' || kode === undefined || kode === null || kode === '' ? 'all' : kode
      const statNo = notrans === 'undefined' || notrans === undefined || notrans === null || notrans === '' ? 'all' : notrans
      const timeVal1 = time1 === 'undefined' || time1 === undefined || time1 === null || time1 === '' || time1 === 'all' || time2 === 'undefined' || time2 === undefined || time2 === null || time2 === '' || time2 === 'all' ? 'all' : moment(time1).format('DD-MM-YYYY')
      const timeVal2 = time2 === 'undefined' || time2 === undefined || time2 === null || time2 === '' || time2 === 'all' ? 'all' : moment(time2).format('DD-MM-YYYY')
      const tipeVal = tipe === 'undefined' || tipe === undefined || tipe === null || tipe === '' ? 'ikk' : tipe

      console.log(timeVal1)
      console.log(timeVal2)

      const timeV1 = new Date(timeVal1)
      const timeV2 = new Date(timeVal1 !== 'all' && timeVal1 === timeVal2 ? moment(timeVal2).add(1, 'd') : moment(timeVal2).add(1, 'd'))
      const transaksi = tipeVal === 'ikk' ? ikk : ops
      const findTrans = await transaksi.findAll({
        where: {
          status_transaksi: { [Op.like]: `%${statTrans}%` },
          [Op.and]: [
            statKode === 'all' ? { [Op.not]: { id: null } } : { kode_plant: statKode },
            statNo === 'all' ? { [Op.not]: { id: null } } : { no_transaksi: { [Op.like]: `%${statNo}%` } },
            timeVal1 === 'all'
              ? { [Op.not]: { id: null } }
              : {
                  [tipeVal === 'ikk' ? 'start_ikk' : 'start_ops']: {
                    [Op.gte]: timeV1,
                    [Op.lt]: timeV2
                  }
                }
          ]
        },
        order: [['id', 'desc']]
      })
      const data = []
      findTrans.map(x => {
        return (
          data.push(x.no_transaksi)
        )
      })
      const set = new Set(data)
      const noDis = [...set]
      if (findTrans.length > 0) {
        const dataJurnal = []
        for (let i = 0; i < noDis.length; i++) {
          const findData = await transaksi.findAll({
            where: {
              no_transaksi: noDis[i]
            },
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
              },
              {
                model: taxcode,
                as: 'taxcode'
              }
            ]
          })
          const tempTrans = []
          if (findData.length > 0) {
            for (let j = 0; j < findData.length; j++) {
              console.log('king findData')
              const system = findData.length > 0 && findData[j].depo.type_live === 'NON LIVE SAP (SCYLLA)' ? 'SCYLAA' : 'SAP'
              const glkk = findData.length > 0 && findData[j].depo !== null && findData[j].depo.glikk !== null ? findData[j].depo.glikk.gl_account : ''

              //   if (findData[j].no_transaksi === noDis[i]) {
              // if ((jenisPph === 'Non PPh' || jenisPph === null) && tipeTrans !== 'Ya') {
              //   data.item = [[
              //     { no_gl: findData[j].nama_coa, nama_gl: null, value: findData[j].nilai_ajuan, type: null, keterangan: ketCoa },
              //     { no_gl: 'Kas Kecil', nama_gl: null, value: null, type: findData[j].nilai_ajuan, keterangan: ketCoa }
              //   ]]
              // } else if (jenisPph !== 'Non PPh' && tipeTrans !== 'Ya') {
              //   data.item = [[
              //     { no_gl: findData[j].nama_coa, nama_gl: jenisPph, value: findData[j].nilai_ajuan, type: null, keterangan: ketCoa },
              //     { no_gl: `Utang ${jenisPph}`, nama_gl: jenisPph, value: null, type: findData[j].nilai_utang, keterangan: ketCoa },
              //     { no_gl: 'Kas Kecil', nama_gl: jenisPph, value: null, type: findData[j].nilai_bayar, keterangan: ketCoa }
              //   ]]
              // } else if (jenisPph !== 'Non PPh' && tipeTrans === 'Ya') {
              //   data.item = [[
              //     { no_gl: findData[j].nama_coa, nama_gl: jenisPph, value: findData[j].dpp, type: null, keterangan: ketCoa },
              //     { no_gl: 'PPN Masukan Non Dagang', nama_gl: jenisPph, value: findData[j].ppn, type: null, keterangan: ketCoa },
              //     { no_gl: `Utang ${jenisPph}`, nama_gl: jenisPph, value: null, type: findData[j].nilai_utang, keterangan: ketCoa },
              //     { no_gl: 'Kas Kecil', nama_gl: jenisPph, value: null, type: findData[j].nilai_bayar, keterangan: ketCoa }
              //   ]]
              // }
              if ((findData[j].jenis_pph === 'Non PPh' || findData[j].jenis_pph === null) && findData[j].type_transaksi !== 'Ya') {
                console.log('king non pph non ppn')
                tempTrans.push(
                  jurnal2.map((e, index) => {
                    return (
                      {
                        no_gl: index === 0 ? findData[j].no_coa : glkk,
                        nama_gl: index === 0 ? findData[j].nama_coa : 'Kas Kecil',
                        tipe: index === 0 ? 'debit' : 'credit',
                        value: index === 0
                          ? findData[j].nilai_buku !== null && findData[j].nilai_buku.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
                          : index === 1 ? findData[j].nilai_buku !== null && findData[j].nilai_buku.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') : '',
                        keterangan: index === 0 ? findData[j].sub_coa : ''
                      }
                    )
                  })
                )
              } else if (findData[j].jenis_pph !== 'Non PPh' && findData[j].type_transaksi !== 'Ya') {
                console.log('king pph non ppn')
                tempTrans.push(
                  jurnal3.map((e, index) => {
                    return (
                      {
                        no_gl: index === 0
                          ? findData[j].no_coa
                          : index === 1 && system === 'SAP'
                            ? (findData[j].jenis_pph === cek21
                                ? dataPph.pph21
                                : findData[j].jenis_pph === cek23
                                  ? dataPph.pph23
                                  : findData[j].jenis_pph === cek4a2 && dataPph.pph4a2)
                            : index === 1 && system !== 'SAP'
                              ? (findData[j].jenis_pph === cek21
                                  ? dataPphSc.pph21
                                  : findData[j].jenis_pph === cek23
                                    ? dataPphSc.pph23
                                    : findData[j].jenis_pph === cek4a2 && dataPphSc.pph4a2)
                              : glkk,
                        nama_gl: index === 0 ? findData[j].nama_coa : index === 1 ? `Utang ${findData[j].jenis_pph}` : index === 2 ? 'Kas Kecil' : '',
                        tipe: index === 0 ? 'debit' : 'credit',
                        value: index === 0
                          ? findData[j].nilai_buku !== null && findData[j].nilai_buku.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
                          : index === 1
                            ? findData[j].nilai_utang !== null && findData[j].nilai_utang.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
                            : index === 2
                              ? findData[j].nilai_bayar !== null && findData[j].nilai_bayar.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
                              : '',
                        keterangan: index === 0 || index === 1 ? findData[j].sub_coa : ''
                      }
                    )
                  })
                )
              } else if (findData[j].jenis_pph === 'Non PPh' && findData[j].type_transaksi === 'Ya') {
                console.log('king ppn non pph')
                tempTrans.push(
                  jurnal3.map((e, index) => {
                    return (
                      {
                        no_gl: index === 0 ? findData[j].no_coa : index === 1 ? dataPph.ppn : glkk,
                        nama_gl: index === 0 ? findData[j].nama_coa : index === 1 ? 'PPN Masukan Non Dagang' : index === 2 ? 'Kas Kecil' : '',
                        tipe: index === 2 ? 'credit' : 'debit',
                        value: index === 0
                          ? findData[j].dpp !== null && findData[j].dpp.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
                          : index === 1
                            ? findData[j].ppn !== null && findData[j].ppn.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
                            : index === 2
                              ? findData[j].nilai_bayar !== null && findData[j].nilai_bayar.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
                              : '',
                        keterangan: index === 0 || index === 1 ? findData[j].sub_coa : ''
                      }
                    )
                  })
                )
              } else if (findData[j].jenis_pph !== 'Non PPh' && findData[j].type_transaksi === 'Ya') {
                console.log('king ppn pph')
                tempTrans.push(
                  jurnal4.map((e, index) => {
                    return (
                      {
                        no_gl: index === 0
                          ? findData[j].no_coa
                          : index === 1
                            ? dataPph.ppn
                            : index === 2 && system === 'SAP'
                              ? (findData[j].jenis_pph === cek21
                                  ? dataPph.pph21
                                  : findData[j].jenis_pph === cek23
                                    ? dataPph.pph23
                                    : findData[j].jenis_pph === cek4a2 && dataPph.pph4a2)
                              : index === 2 && system !== 'SAP'
                                ? (findData[j].jenis_pph === cek21
                                    ? dataPphSc.pph21
                                    : findData[j].jenis_pph === cek23
                                      ? dataPphSc.pph23
                                      : findData[j].jenis_pph === cek4a2 && dataPphSc.pph4a2)
                                : glkk,
                        nama_gl: index === 0 ? findData[j].nama_coa : index === 1 ? 'PPN Masukan Non Dagang' : index === 2 ? `Utang ${findData[j].jenis_pph}` : index === 3 ? 'Kas Kecil' : '',
                        tipe: index === 0 || index === 1 ? 'debit' : 'credit',
                        value: index === 0
                          ? findData[j].dpp !== null && findData[j].dpp.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
                          : index === 1
                            ? findData[j].ppn !== null && findData[j].ppn.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
                            : index === 2
                              ? findData[j].nilai_utang !== null && findData[j].nilai_utang.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
                              : index === 3
                                ? findData[j].nilai_bayar !== null && findData[j].nilai_bayar.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
                                : '',
                        keterangan: index === 0 || index === 1 || index === 2 ? findData[j].sub_coa : ''
                      }
                    )
                  })
                )
              }
            //   }
            }
          }
          const data = {
            no_ofr: noDis[i],
            tgl_ajuan: moment(findTrans.find(({no_transaksi}) => no_transaksi === noDis[i])[tipeVal === 'ikk' ? 'start_ikk' : 'start_ops']).format('DD MMMM YYYY'), // eslint-disable-line
            item: tempTrans
          }
          dataJurnal.push(data)
        }
        if (dataJurnal.length > 0) {
          const temp = []
          for (let i = 0; i < findTrans.length; i++) {
            const findData = await transaksi.findByPk(findTrans[i].id)
            if (findData) {
              const data = {
                flag_redpine: findData.flag_redpine + 1
              }
              const updateData = await findData.update(data)
              if (updateData) {
                temp.push(updateData)
              }
            }
          }
          if (temp.length > 0) {
            return response(res, 'success get jurnal ', { result: dataJurnal, no_ofr: noDis })
          } else {
            return response(res, 'success get jurnal g', { result: dataJurnal, no_ofr: noDis })
          }
        } else {
          return response(res, 'success get jurnal t', { result: findTrans, no_ofr: noDis })
        }
      } else {
        return response(res, 'success get jurnal s', { result: findTrans, no_ofr: noDis })
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  postRedpine: async (req, res) => {
    try {
      const { kode, notrans, tipe } = req.body
      const statTrans = 8
      const statKode = kode === 'undefined' || kode === undefined || kode === null || kode === '' ? 'all' : kode
      const statNo = notrans === 'undefined' || notrans === undefined || notrans === null || notrans === '' ? 'all' : notrans
      const tipeVal = tipe === 'undefined' || tipe === undefined || tipe === null || tipe === '' ? 'ikk' : tipe
      const transaksi = tipeVal === 'ikk' ? ikk : ops
      const findTrans = await transaksi.findAll({
        where: {
          [Op.and]: [
            { status_transaksi: statTrans },
            statKode === 'all' ? { [Op.not]: { id: null } } : { kode_plant: statKode },
            statNo === 'all' ? { [Op.not]: { id: null } } : { no_transaksi: { [Op.like]: `%${statNo}%` } }
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
          },
          {
            model: taxcode,
            as: 'taxcode'
          }
        ]
      })
      const data = []
      findTrans.map(x => {
        return (
          data.push(x.no_transaksi)
        )
      })
      const set = new Set(data)
      const noDis = [...set]
      if (findTrans) {
        const send = await axios({
          method: 'post',
          url: 'https://redpine.pinusmerahabadi.co.id/api/jurnal',
          data: { data: findTrans },
          headers: { Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.c_G5Y7CbEKR4UncCqxLmGHtkcZDtibjh2XP_M7fTbAE' }
        }).then(response => { console.log(response); return (response) }).catch(err => { console.log(err); return (err) })
        if (send.status === 200) {
          const temp = []
          for (let i = 0; i < findTrans.length; i++) {
            const findData = await transaksi.findByPk(findTrans[i].id)
            if (findData) {
              const data = {
                flag_redpine: findData.flag_redpine + 1
              }
              const updateData = await findData.update(data)
              if (updateData) {
                temp.push(updateData)
              }
            }
          }
          if (temp.length > 0) {
            return response(res, send.message, { result: send.data })
          } else {
            return response(res, send.message, { result: send.data })
          }
        } else {
          return response(res, 'gagal kirim ke redpine', { send }, 400, false)
        }
      } else {
        return response(res, 'success get jurnal', { result: findTrans, noDis })
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  }
}
