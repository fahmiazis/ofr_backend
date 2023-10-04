const route = require('express').Router()
const notif = require('../controllers/notif')

route.post('/add', notif.addNotif)
route.get('/all', notif.getAllNotif)
route.get('/get', notif.getNotif)
route.patch('/read/:id', notif.readNotif)
route.delete('/del/:id', notif.deleteNotif)
route.delete('/delall', notif.deleteAll)

module.exports = route
