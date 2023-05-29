const route = require('express').Router()
const kpp = require('../controllers/kpp')

route.post('/add', kpp.addKpp)
route.get('/all', kpp.getAllKpp)
route.get('/get', kpp.getKpp)
route.get('/detail/:no', kpp.getDetailKpp)
route.patch('/update/:id', kpp.updateKpp)
route.post('/master', kpp.uploadMasterKpp)
route.delete('/del/:id', kpp.deleteKpp)
route.delete('/delall', kpp.deleteAll)
route.get('/export', kpp.exportSqlKpp)

module.exports = route
