const route = require('express').Router()
const arc = require('../controllers/mappingArc')

route.get('/get', arc.getMapping)
route.get('/options', arc.getOptions)
route.post('/save', arc.saveMapping)
route.post('/master', arc.uploadMapping)
route.delete('/del/:username', arc.deleteMapping)
route.get('/spv', arc.getSpv)
route.patch('/spv', arc.saveSpv)

module.exports = route
