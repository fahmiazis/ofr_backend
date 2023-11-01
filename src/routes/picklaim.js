const route = require('express').Router()
const picklaim = require('../controllers/picklaim')

route.post('/add', picklaim.addPicklaim)
route.get('/all', picklaim.getPicklaim)
route.get('/get', picklaim.getAllPicklaim)
route.get('/detail/:no', picklaim.getDetailPicklaim)
route.patch('/update/:id', picklaim.updatePicklaim)
route.post('/master', picklaim.uploadMasterPicklaim)
route.delete('/del/:id', picklaim.deletePicklaim)
route.delete('/delall', picklaim.deleteAll)
route.get('/export', picklaim.exportSqlPicklaim)

module.exports = route
