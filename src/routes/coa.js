const route = require('express').Router()
const coa = require('../controllers/coa')

route.post('/add', coa.addCoa)
route.get('/all/:tipe', coa.getCoa)
route.get('/get', coa.getAllCoa)
route.get('/detail/:no', coa.getDetailCoa)
route.patch('/update/:id', coa.updateCoa)
route.post('/master', coa.uploadMasterCoa)
route.delete('/del/:id', coa.deleteCoa)
route.delete('/delall', coa.deleteAll)
route.get('/export', coa.exportSqlCoa)

module.exports = route
