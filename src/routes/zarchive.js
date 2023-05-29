const route = require('express').Router()
const zarchive = require('../controllers/zarchive')

route.get('/get', zarchive.createZip)

module.exports = route
