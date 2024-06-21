// const moment = require('moment')

// const tgl = moment('2024-05-02T02:52:37.000Z').format('DD MMMM YYYY')

const str1 = '123.456'
const str2 = '12.345'
const a = parseFloat(str1.replace(/[^a-z0-9-]/g, ''))
const b = parseFloat(str2.replace(/[^a-z0-9-]/g, ''))

console.log(a + b)
