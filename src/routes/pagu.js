const route = require('express').Router()
const pagu = require('../controllers/pagu')

route.post('/add', pagu.addPagu)
route.get('/all', pagu.getPagu)
route.get('/get', pagu.getAllPagu)
route.get('/detail/:no', pagu.getDetailPagu)
route.patch('/update/:id', pagu.updatePagu)
route.post('/master', pagu.uploadMasterPagu)
route.delete('/del/:id', pagu.deletePagu)
route.delete('/delall', pagu.deleteAll)
route.get('/export', pagu.exportSqlPagu)

module.exports = route
