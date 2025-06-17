const route = require('express').Router()
const vendor = require('../controllers/vendor')

route.post('/add', vendor.addVendor)
route.patch('/all', vendor.getVendor)
route.get('/get', vendor.getAllVendor)
route.get('/detail/:no', vendor.getDetailVendor)
route.patch('/update/:id', vendor.updateVendor)
route.post('/master', vendor.uploadMasterVendor)
route.delete('/del/:id', vendor.deleteVendor)
route.delete('/delall', vendor.deleteAll)
route.get('/export', vendor.exportSqlVendor)
route.patch('/upspar', vendor.updateSpar)
route.patch('/sync', vendor.syncVerVendor)

// rekening vendor
route.patch('/rekven/update', vendor.updateRekven)
route.delete('/rekven/del/:id', vendor.deleteRekven)

module.exports = route
