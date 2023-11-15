const route = require('express').Router()
const glikk = require('../controllers/glikk')

route.post('/add', glikk.addGlikk)
route.get('/all/:tipe', glikk.getGlikk)
route.get('/get', glikk.getAllGlikk)
route.get('/detail/:no', glikk.getDetailGlikk)
route.patch('/update/:id', glikk.updateGlikk)
route.post('/master', glikk.uploadMasterGlikk)
route.delete('/del/:id', glikk.deleteGlikk)
route.delete('/delall', glikk.deleteAll)
route.get('/export', glikk.exportSqlGlikk)

module.exports = route
