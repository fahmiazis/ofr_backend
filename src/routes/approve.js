const route = require('express').Router()
const approve = require('../controllers/approve')

route.post('/create', approve.createApprove)
route.post('/add', approve.createNameApprove)
route.patch('/name/edit/:id', approve.updateNameApprove)
route.get('/get', approve.getApprove)
route.get('/detail', approve.getDetailApprove)
route.get('/detail/name/:id', approve.getDetailId)
route.get('/name', approve.getNameApprove)
route.patch('/update/:id', approve.updateApprove)
route.delete('/delete/:id', approve.deleteApprove)
route.delete('/delete/name/:id', approve.deleteNameApprove)
route.delete('/ttdel/:no', approve.deleteTtd)
route.patch('/rom', approve.updateRom)
route.patch('/change/:id', approve.changeName)

module.exports = route
