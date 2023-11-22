const route = require('express').Router()
const verifVendor = require('../controllers/verifVendor')

route.post('/add', verifVendor.addVendor)
route.patch('/detail', verifVendor.getDetailVerven)
route.get('/get', verifVendor.getVerifVendor)
route.get('/detid/:id', verifVendor.getDetailId)
route.patch('/verif', verifVendor.submitVerif)
route.patch('/reject', verifVendor.rejectVerven)
route.patch('/revisi', verifVendor.submitRevisi)
route.patch('/edit/:id', verifVendor.EditVerven)
route.get('/novdr', verifVendor.generateNoVendor)
route.patch('/doc', verifVendor.getDocumentSkb)
route.post('/updoc', verifVendor.uploadDocument)

module.exports = route
