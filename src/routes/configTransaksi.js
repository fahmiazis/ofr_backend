const route = require('express').Router()
const config = require('../controllers/configTransaksi')

route.get('/get', config.getConfig)
route.get('/options', config.getOptions)
route.post('/add', config.addConfig)
route.patch('/update/:id', config.updateConfig)
route.delete('/del/:id', config.deleteConfig)

module.exports = route
