const route = require('express').Router()
const reservoir = require('../controllers/reservoir')

route.get('/all', reservoir.getAllReser)
route.get('/get', reservoir.getReser)
route.get('/detail/:no', reservoir.getDetailReser)
route.delete('/del/:id', reservoir.deleteReser)
route.delete('/delall', reservoir.deleteAll)
route.patch('/gentrans', reservoir.genTrans)
route.patch('/genpemb', reservoir.genPemb)

module.exports = route
