const route = require('express').Router()
const bracket = require('../controllers/bracket')

route.patch('/login', bracket.loginBracket)
route.patch('/register', bracket.registerBracket)
route.patch('/generate', bracket.generateBracket)
route.delete('/delpar', bracket.deleteId)
route.delete('/delall', bracket.deleteBracket)
route.get('/get', bracket.getBracket)
route.patch('/win', bracket.winBracket)

module.exports = route
