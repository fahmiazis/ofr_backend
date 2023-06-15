const route = require('express').Router()
const kliring = require('../controllers/kliring')

route.post('/add', kliring.addKliring)
route.get('/all', kliring.getKliring)
route.get('/get', kliring.getAllKliring)
route.get('/detail/:no', kliring.getDetailKliring)
route.patch('/update/:id', kliring.updateKliring)
route.post('/master', kliring.uploadMasterKliring)
route.delete('/del/:id', kliring.deleteKliring)
route.delete('/delall', kliring.deleteAll)
route.get('/export', kliring.exportSqlKliring)

module.exports = route
