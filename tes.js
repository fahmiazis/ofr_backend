const moment = require('moment')

const date1 = new Date(moment().startOf('month'))
const date2 = new Date()
const diffTime = Math.abs(date2 - date1)
const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

console.log(diffDays)
