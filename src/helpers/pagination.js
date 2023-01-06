const qs = require('querystring')
// const { APP_URL, APP_PORT } = process.env

module.exports = {
  pagination: (api, query, page, limit, count) => {
    page = +page
    const pageInfo = {
      count: 0,
      pages: 0,
      currentPage: +page,
      limitPerPage: +limit,
      nextLink: null,
      prevLink: null
    }

    pageInfo.count = count
    pageInfo.pages = Math.ceil(count / limit)
    const { pages, currentPage } = pageInfo
    if (currentPage < pages) {
      pageInfo.nextLink = `${api}?${qs.stringify({ ...query, ...{ page: page + 1 } })}`
    }

    if (currentPage > 1) {
      pageInfo.prevLink = `${api}?${qs.stringify({ ...query, ...{ page: page - 1 } })}`
    }
    return pageInfo
  },
  filterApp: (type, dataKlaim, noDis, role) => {
    if (type === 'available') {
      const newKlaim = []
      for (let i = 0; i < noDis.length; i++) {
        const index = dataKlaim.indexOf(dataKlaim.find(({ no_transaksi }) => no_transaksi === noDis[i]))
        if ((dataKlaim[index].status_reject === 0 || dataKlaim[index].status_reject === null) && dataKlaim[index].status_transaksi === 2) {
          const app = dataKlaim[index].appForm
          const find = app.indexOf(app.find(({ jabatan }) => jabatan === role))
          if (app[find] !== undefined && app[find + 1].status === '1' && app[find].status === null) {
            newKlaim.push(dataKlaim[index])
          }
        }
      }
      return newKlaim
    } else if (type === 'reject') {
      const newKlaim = []
      for (let i = 0; i < noDis.length; i++) {
        const index = dataKlaim.indexOf(dataKlaim.find(({ no_transaksi }) => no_transaksi === noDis[i]))
        if (dataKlaim[index].status_reject !== null && dataKlaim[index].status_reject !== 0) {
          newKlaim.push(dataKlaim[index])
        }
      }
      return newKlaim
    } else if (type === 'revisi') {
      const newKlaim = []
      for (let i = 0; i < noDis.length; i++) {
        const index = dataKlaim.indexOf(dataKlaim.find(({ no_transaksi }) => no_transaksi === noDis[i]))
        if (dataKlaim[index].status_reject === 0 && dataKlaim[index].status_transaksi === 2) {
          const app = dataKlaim[index].appForm
          const find = app.indexOf(app.find(({ jabatan }) => jabatan === role))
          if (app[find] !== undefined && app[find + 1].status === '1' && app[find].status === '0') {
            newKlaim.push(dataKlaim[index])
          }
        }
      }
      return newKlaim
    } else {
      const newKlaim = []
      for (let i = 0; i < noDis.length; i++) {
        const index = dataKlaim.indexOf(dataKlaim.find(({ no_transaksi }) => no_transaksi === noDis[i]))
        newKlaim.push(dataKlaim[index])
      }
      return newKlaim
    }
  },
  filter: (type, dataKlaim, noDis, role) => {
    if (type === 'available') {
      const newKlaim = []
      for (let i = 0; i < noDis.length; i++) {
        const index = dataKlaim.indexOf(dataKlaim.find(({ no_transaksi }) => no_transaksi === noDis[i]))
        if (dataKlaim[index].status_reject === null || dataKlaim[index].status_reject === 0) {
          newKlaim.push(dataKlaim[index])
        }
      }
      return newKlaim
    } else if (type === 'reject') {
      const newKlaim = []
      for (let i = 0; i < noDis.length; i++) {
        const index = dataKlaim.indexOf(dataKlaim.find(({ no_transaksi }) => no_transaksi === noDis[i]))
        if (dataKlaim[index].status_reject !== null && dataKlaim[index].status_reject !== 0) {
          newKlaim.push(dataKlaim[index])
        }
      }
      return newKlaim
    } else if (type === 'revisi') {
      const newKlaim = []
      for (let i = 0; i < noDis.length; i++) {
        const index = dataKlaim.indexOf(dataKlaim.find(({ no_transaksi }) => no_transaksi === noDis[i]))
        if (dataKlaim[index].status_reject === 0) {
          newKlaim.push(dataKlaim[index])
        }
      }
      return newKlaim
    } else {
      const newKlaim = []
      for (let i = 0; i < noDis.length; i++) {
        const index = dataKlaim.indexOf(dataKlaim.find(({ no_transaksi }) => no_transaksi === noDis[i]))
        newKlaim.push(dataKlaim[index])
      }
      return newKlaim
    }
  }
}
