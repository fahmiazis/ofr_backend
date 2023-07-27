const route = require('express').Router()
const ikk = require('../controllers/ikk')

route.get('/getikk', ikk.getRedpine)
route.get('/postikk', ikk.postRedpine)

module.exports = route
