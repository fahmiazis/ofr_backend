const route = require('express').Router()
const faktur = require('../controllers/faktur')

route.post('/add', faktur.addFaktur)
route.patch('/all', faktur.getFaktur)
route.get('/get', faktur.getAllFaktur)
route.get('/detail/:no', faktur.getDetailFaktur)
route.patch('/update/:id', faktur.updateFaktur)
route.post('/master', faktur.uploadMasterFaktur)
route.delete('/del/:id', faktur.deleteFaktur)
route.delete('/delall', faktur.deleteAll)
route.delete('/delshel', faktur.deleteAllShell)
route.get('/export', faktur.exportSqlFaktur)
route.patch('/force/:id', faktur.forceFaktur)
route.get('/sync', faktur.syncFaktur)
route.get('/shelfaktur', faktur.getShelFaktur)
route.patch('/delraw', faktur.deleteRawFaktur)

module.exports = route
