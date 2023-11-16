const route = require('express').Router()
const redpine = require('../controllers/redpine')

route.post('/ofrjurnal', redpine.getRedpine)
route.get('/par/ofrjurnal', redpine.getRedpineParams)
route.get('/post/ofrjurnal', redpine.postRedpine)

module.exports = route
