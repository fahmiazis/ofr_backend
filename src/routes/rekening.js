const route = require('express').Router()
const rekening = require('../controllers/rekening')

route.post('/add', rekening.addRek)
route.get('/all', rekening.getAllRek)
route.get('/get', rekening.getRek)
route.get('/detail/:no', rekening.getDetailRek)
route.patch('/update/:id', rekening.updateRek)
route.post('/master', rekening.uploadMasterRek)
route.delete('/del/:id', rekening.deleteRek)
route.delete('/delall', rekening.deleteAll)
route.get('/export', rekening.exportSqlRek)

module.exports = route
