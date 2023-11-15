const route = require('express').Router()
const redpine = require('../controllers/redpine')

route.get('/ofrjurnal', redpine.getRedpine)
route.get('/post/ofrjurnal', redpine.postRedpine)

module.exports = route
