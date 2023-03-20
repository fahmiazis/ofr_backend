const route = require('express').Router()
const tarif = require('../controllers/tarif')

route.post('/add', tarif.addTarif)
route.get('/all', tarif.getAllTarif)
route.get('/get', tarif.getTarif)
route.get('/detail/:no', tarif.getDetailTarif)
route.patch('/update/:id', tarif.updateTarif)
route.post('/master', tarif.uploadMasterTarif)
route.delete('/del/:id', tarif.deleteTarif)
route.delete('/delall', tarif.deleteAll)
route.get('/export', tarif.exportSqlTarif)

module.exports = route
