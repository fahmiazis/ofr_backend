const route = require('express').Router()
const ops = require('../controllers/operasional')

route.post('/add', ops.addCart)
route.delete('/del/:id', ops.deleteCart)
route.get('/cart', ops.getCartClaim)
route.patch('/submit', ops.submitOps)
route.post('/updoc', ops.uploadDocument)
route.patch('/doc', ops.getDocument)
route.patch('/detail', ops.getDetailOps)
route.get('/get', ops.getOps)
route.patch('/ttd', ops.getApproval)
route.patch('/app', ops.approveOps)

module.exports = route
