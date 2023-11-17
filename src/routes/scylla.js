const route = require('express').Router()
const scylla = require('../controllers/scylla')

route.post('/add', scylla.createScylla)
route.get('/get', scylla.getScylla)
route.patch('/update/:id', scylla.updateScylla)
route.delete('/delete/:id', scylla.deleteScylla)
route.get('/detail/:id', scylla.getDetailScylla)
route.post('/master', scylla.uploadMasterScylla)
route.get('/export', scylla.exportSqlScylla)
route.delete('/delall', scylla.deleteAll)

module.exports = route
