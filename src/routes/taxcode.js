const route = require('express').Router()
const taxcode = require('../controllers/taxcode')

route.post('/add', taxcode.addTaxcode)
route.get('/all', taxcode.getTaxcode)
route.get('/get', taxcode.getAllTaxcode)
route.get('/detail/:no', taxcode.getDetailTaxcode)
route.patch('/update/:id', taxcode.updateTaxcode)
route.post('/master', taxcode.uploadMasterTaxcode)
route.delete('/del/:id', taxcode.deleteTaxcode)
route.delete('/delall', taxcode.deleteAll)
route.get('/export', taxcode.exportSqlTaxcode)

module.exports = route
