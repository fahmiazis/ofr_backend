/* eslint-disable */ 

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
  filterApp: (type, dataAjuan, role, level) => {
    if (type === 'available') {
      const newKlaim = []
      for (let i = 0; i < dataAjuan.length; i++) {
        if ((dataAjuan[i].status_reject === 0 || dataAjuan[i].status_reject === null) && dataAjuan[i].status_transaksi === 2) {
          const app = dataAjuan[i].appForm
          const find = app.indexOf(app.find(({ jabatan }) => jabatan === role))
          if (level !== 5 && (app[find] !== undefined && app[find + 1] !== undefined) && app[find + 1].status === '1' && (app[find].status === null || app[find].status === '0')) {
            newKlaim.push(dataAjuan[i])
          } else if (dataAjuan[i].status_reject === 0 && dataAjuan[i].status_transaksi === 2 && (app[find] !== undefined && app[find + 1] !== undefined) && app[find + 1].status === '1' && app[find].status === '0') {
            newKlaim.push(dataAjuan[i])
          }
        }
      }
      return newKlaim
    } else if (type === 'reject') {
      const newKlaim = []
      for (let i = 0; i < dataAjuan.length; i++) {
        if (dataAjuan[i].status_reject !== null && dataAjuan[i].status_reject !== 0) {
          newKlaim.push(dataAjuan[i])
        }
      }
      return newKlaim
    } else if (type === 'revisi') {
      const newKlaim = []
      for (let i = 0; i < dataAjuan.length; i++) {
        if (dataAjuan[i].status_reject === 0 && dataAjuan[i].status_transaksi === 2) {
          const app = dataAjuan[i].appForm
          const find = app.indexOf(app.find(({ jabatan }) => jabatan === role))
          if (app[find] !== undefined && app[find + 1] !== undefined && app[find + 1].status === '1' && app[find].status === '0') {
            newKlaim.push(dataAjuan[i])
          }
        }
      }
      return newKlaim
    } else {
      const newKlaim = []
      for (let i = 0; i < dataAjuan.length; i++) {
        const app = dataAjuan[i].appForm
        const find = app.indexOf(app.find(({ jabatan }) => jabatan === role))
        if (app[find] === undefined || (app[find] !== undefined && app[find].status === '1') || (level !== 5 && (app[find] !== undefined && app[find + 1] !== undefined) && app[find + 1].status !== '1')) {
          newKlaim.push(dataAjuan[i])
        } else if (dataAjuan[i].status_reject !== null && dataAjuan[i].status_reject !== 0) {
          newKlaim.push(dataAjuan[i])
        }
      }
      return newKlaim
    }
  },
  filterBayar: (type, dataAjuan, data, role) => {
    if (type === 'available') {
      const newKlaim = []
      for (let i = 0; i < dataAjuan.length; i++) {
        // const index = dataAjuan.indexOf(dataAjuan.find(({ no_pembayaran }) => no_pembayaran === noDis[i]))
        if ((dataAjuan[i].status_reject === 0 || dataAjuan[i].status_reject === null) && dataAjuan[i].status_transaksi === parseInt(data)) {
          const app = dataAjuan[i].appList
          const find = app.indexOf(app.find(({ jabatan }) => jabatan === role))
          if (app[find] !== undefined && app[find + 1].status === '1' && (app[find].status === null || app[find].status === '0')) {
            newKlaim.push(dataAjuan[i])
          }
        }
      }
      return newKlaim
    } else if (type === 'reject') {
      const newKlaim = []
      for (let i = 0; i < dataAjuan.length; i++) {
        // const index = dataAjuan.indexOf(dataAjuan.find(({ no_pembayaran }) => no_pembayaran === noDis[i]))
        if (dataAjuan[i].status_reject !== null && dataAjuan[i].status_reject !== 0) {
          newKlaim.push(dataAjuan[i])
        }
      }
      return newKlaim
    } else if (type === 'revisi') {
      const newKlaim = []
      for (let i = 0; i < dataAjuan.length; i++) {
        // const index = dataAjuan.indexOf(dataAjuan.find(({ no_pembayaran }) => no_pembayaran === noDis[i]))
        if (dataAjuan[i].status_reject === 0 && dataAjuan[i].status_transaksi === parseInt(data)) {
          const app = dataAjuan[i].appList
          const find = app.indexOf(app.find(({ jabatan }) => jabatan === role))
          if (app[find] !== undefined && app[find + 1] !== undefined && app[find + 1].status === '1' && app[find].status === '0') {
            newKlaim.push(dataAjuan[i])
          }
        }
      }
      return newKlaim
    } else {
      const newKlaim = []
      for (let i = 0; i < dataAjuan.length; i++) {
        // const index = dataAjuan.indexOf(dataAjuan.find(({ no_pembayaran }) => no_pembayaran === noDis[i]))
        const app = dataAjuan[i].appList
        const find = app.indexOf(app.find(({ jabatan }) => jabatan === role))
        if (app[find] === undefined || (app[find] !== undefined && app[find].status === '1') || (app[find] !== undefined && app[find + 1].status !== '1')) {
          newKlaim.push(dataAjuan[i])
        } else if (dataAjuan[i].status_reject !== null && dataAjuan[i].status_reject !== 0) {
          newKlaim.push(dataAjuan[i])
        }
      }
      return newKlaim
    }
  },
  filter: (type, dataAjuan, data, role) => {
    if (type === 'available') {
      const newKlaim = []
      for (let i = 0; i < dataAjuan.length; i++) {
        if (dataAjuan[i].status_reject === null || dataAjuan[i].status_reject === 0) {
          newKlaim.push(dataAjuan[i])
        }
      }
      return newKlaim
    } else if (type === 'reject') {
      const newKlaim = []
      for (let i = 0; i < dataAjuan.length; i++) {
        if (dataAjuan[i].status_reject !== null && dataAjuan[i].status_reject !== 0) {
          newKlaim.push(dataAjuan[i])
        }
      }
      return newKlaim
    } else if (type === 'revisi') {
      const newKlaim = []
      for (let i = 0; i < dataAjuan.length; i++) {
        if (dataAjuan[i].status_reject === 0) {
          newKlaim.push(dataAjuan[i])
        }
      }
      return newKlaim
    } else if (type === 'verif') {
      const newKlaim = []
      for (let i = 0; i < dataAjuan.length; i++) {
        newKlaim.push(dataAjuan[i])
      }
      return newKlaim
    } else {
      const newKlaim = []
      for (let i = 0; i < dataAjuan.length; i++) {
        if (dataAjuan[i].status_transaksi !== parseInt(data)) {
          newKlaim.push(dataAjuan[i])
        } else if (dataAjuan[i].status_reject !== null && dataAjuan[i].status_reject !== 0) {
          newKlaim.push(dataAjuan[i])
        }
      }
      return newKlaim
    }
  }
}
