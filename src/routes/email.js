const route = require('express').Router()
const email = require('../controllers/email')

route.post('/add', email.addEmail)
route.get('/all', email.getAllEmail)
route.get('/get', email.getEmail)
route.get('/detail/:no', email.getDetailEmail)
route.patch('/update/:id', email.updateEmail)
route.delete('/del/:id', email.deleteEmail)
route.delete('/delall', email.deleteAll)
route.patch('/draft', email.getDraftEmail)
route.patch('/send', email.sendEmail)

module.exports = route
