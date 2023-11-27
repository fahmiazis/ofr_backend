const dataJurnal = {
  success: true,
  message: 'success get jurnal ',
  result: [
    {
      no_ofr: '0012/P199/V/2023-OPSX',
      kode_plant: 'P199',
      kode_depo: '82',
      area: 'GORONTALO',
      tgl_ajuan: '29 May 2023',
      item: [
        [
          {
            Header: [
              {
                no_gl: '51020203',
                nama_gl: 'Uang Transport',
                tipe: 'debit',
                value: '100.000',
                keterangan: 'BBM Sales'
              }
            ]
          },
          {
            Detail: [
              {
                no_gl: '111300',
                nama_gl: 'Kas Kecil',
                tipe: 'credit',
                value: '100.000',
                keterangan: 'BBM Sales'
              }
            ]
          }
        ],
        [
          {
            Header: [
              {
                no_gl: '51020203',
                nama_gl: 'Uang Transport',
                tipe: 'debit',
                value: '3.500.000',
                keterangan: '010.000-23.04661930'
              }
            ]
          },
          {
            Detail: [
              {
                no_gl: '213210',
                nama_gl: 'Utang PPh Pasal 23',
                tipe: 'credit',
                value: '70.000',
                keterangan: '010.000-23.04661930'
              },
              {
                no_gl: '111300',
                nama_gl: 'Kas Kecil',
                tipe: 'credit',
                value: '3.815.000',
                keterangan: '010.000-23.04661930'
              }
            ]
          }
        ],
        [
          {
            Header: [
              {
                no_gl: '11060204',
                nama_gl: 'PPN Masukan Non Dagang',
                tipe: 'debit',
                value: '385.000',
                keterangan: '010.000-23.04661930'
              }
            ]
          },
          {
            Detail: [
              {
                no_gl: '111300',
                nama_gl: 'Kas Kecil',
                tipe: 'credit',
                value: '385.000',
                keterangan: '010.000-23.04661930'
              }
            ]
          }
        ]
      ]
    }
  ]
}

dataJurnal.result[0].item.map(x => { return console.table(x) })
