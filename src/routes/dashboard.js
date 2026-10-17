const route = require('express').Router()
const dashboard = require('../controllers/dashboard')

route.get('/status', dashboard.getStatusTransaksi)

module.exports = route
