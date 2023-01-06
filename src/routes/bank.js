const route = require('express').Router()
const bank = require('../controllers/bank')

route.post('/add', bank.addBank)
route.get('/all', bank.getAllBank)
route.get('/get', bank.getBank)
route.get('/detail/:no', bank.getDetailBank)
route.patch('/update/:id', bank.updateBank)
route.post('/master', bank.uploadMasterBank)
route.delete('/del/:id', bank.deleteBank)
route.delete('/delall', bank.deleteAll)
route.get('/export', bank.exportSqlBank)

module.exports = route
