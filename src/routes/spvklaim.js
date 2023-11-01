const route = require('express').Router()
const spvklaim = require('../controllers/spvklaim')

route.post('/add', spvklaim.addSpvklaim)
route.get('/all', spvklaim.getSpvklaim)
route.get('/get', spvklaim.getAllSpvklaim)
route.get('/detail/:no', spvklaim.getDetailSpvklaim)
route.patch('/update/:id', spvklaim.updateSpvklaim)
route.post('/master', spvklaim.uploadMasterSpvklaim)
route.delete('/del/:id', spvklaim.deleteSpvklaim)
route.delete('/delall', spvklaim.deleteAll)
route.get('/export', spvklaim.exportSqlSpvklaim)

module.exports = route
