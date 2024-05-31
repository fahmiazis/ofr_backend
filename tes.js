const moment = require('moment')

const date1 = moment('2024-02-28T00:00:00.000Z').format('M')
const date2 = moment().format('M')
const diffTime = Math.abs(date2 - date1)
const diffMonth = Math.floor(diffTime)
console.log(date1)
console.log(diffMonth <= 3)
