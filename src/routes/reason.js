const route = require('express').Router()
const reason = require('../controllers/reason')

route.post('/add', reason.addReason)
route.get('/all', reason.getAllReason)
route.get('/get', reason.getReason)
route.get('/detail/:no', reason.getDetailReason)
route.patch('/update/:id', reason.updateReason)
route.delete('/del/:id', reason.deleteReason)
route.delete('/delall', reason.deleteAll)

module.exports = route
