const route = require('express').Router()
const ikk = require('../controllers/ikk')

route.post('/add/:id', ikk.addCart)
route.delete('/del/:id', ikk.deleteCart)
route.get('/cart', ikk.getCartIkk)
route.patch('/submit', ikk.submitIkk)
route.patch('/subfinikk', ikk.submitIkkFinal)
route.post('/updoc', ikk.uploadDocument)
route.patch('/doc', ikk.getDocument)
route.patch('/detail', ikk.getDetailIkk)
route.get('/get', ikk.getIkk)
route.patch('/ttd', ikk.getApproval)
route.get('/docdraft/:name', ikk.getDocDraft)
route.patch('/app', ikk.approveIkk)
route.patch('/reject', ikk.rejectIkk)
route.patch('/apprev', ikk.appRevisi)
route.patch('/update/:id', ikk.editIkk)
route.patch('/subrev', ikk.submitRevisi)
route.patch('/verif', ikk.submitVerif)
// route.patch('/editvrf/:id', ikk.updateDataVerif)
// route.patch('/subbayar', ikk.submitAjuanBayar)
// route.patch('/ttdlist', ikk.getApprovalList)
// route.patch('/applist', ikk.approveListIkk)
// route.patch('/rejectlist', ikk.rejectListIkk)

module.exports = route
