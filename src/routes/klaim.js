const route = require('express').Router()
const klaim = require('../controllers/klaim')

route.post('/add', klaim.addCart)
route.delete('/del/:id', klaim.deleteCart)
route.get('/cart', klaim.getCartClaim)
route.patch('/submit', klaim.submitKlaim)
route.patch('/subfinklaim', klaim.submitKlaimFinal)
route.post('/updoc', klaim.uploadDocument)
route.patch('/doc', klaim.getDocument)
route.patch('/detail', klaim.getDetailKlaim)
route.get('/get', klaim.getKlaim)
route.patch('/ttd', klaim.getApproval)
route.get('/docdraft/:name', klaim.getDocDraft)
route.patch('/app', klaim.approveKlaim)
route.patch('/reject', klaim.rejectKlaim)
route.patch('/apprev', klaim.appRevisi)
route.patch('/update/:id', klaim.editKlaim)
route.patch('/subrev', klaim.submitRevisi)
route.patch('/verif', klaim.submitVerif)
route.patch('/editvrf/:id', klaim.updateDataVerif)

route.patch('/genbayar', klaim.genNomorTransfer)
route.patch('/subbayar', klaim.submitAjuanBayar)
route.patch('/ttdlist', klaim.getApprovalList)
route.patch('/applist', klaim.approveListKlaim)
route.patch('/rejectlist', klaim.rejectListKlaim)
route.get('/report', klaim.getReport)
route.post('/uplist', klaim.uploadBukti)
route.patch('/sublistbayar', klaim.submitBuktiBayar)
route.patch('/detailid/:id', klaim.getDetailId)
route.patch('/getdocbayar', klaim.getDocBayar)
route.patch('/upniverif', klaim.updateNilaiVerif)
route.post('/upload', klaim.uploadDataKlaim)

route.patch('/outlet/upload', klaim.uploadOutlet)
route.patch('/outlet/update', klaim.updateOutlet)
route.patch('/outlet/add', klaim.addOutlet)
route.delete('/outlet/del/:id', klaim.deleteOutlet)
route.get('/outlet/get/:id', klaim.getOutlet)

route.patch('/faktur/upload', klaim.uploadFaktur)
route.patch('/faktur/update', klaim.updateFaktur)
route.patch('/faktur/add', klaim.addFaktur)
route.delete('/faktur/del/:id', klaim.deleteFaktur)
route.get('/faktur/get/:id', klaim.getFaktur)

route.patch('/download', klaim.downloadFormVerif)

module.exports = route
