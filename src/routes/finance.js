const route = require('express').Router()
const finance = require('../controllers/finance')

route.post('/add', finance.addFinance)
route.get('/all', finance.getFinance)
route.get('/get', finance.getAllFinance)
route.get('/detail/:no', finance.getDetailFinance)
route.patch('/update/:id', finance.updateFinance)
route.post('/master', finance.uploadMasterFinance)
route.delete('/del/:id', finance.deleteFinance)
route.delete('/delall', finance.deleteAll)
route.get('/export', finance.exportSqlFinance)

module.exports = route
