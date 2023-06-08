const moment = require('moment')
const exam = ''
const convert = exam.split(',')
// moment.locale('id')
const deMarch = '0006/P199/V/2023-OPS'
const date1 = moment().format('DD MMMM YYYY')
const date2 = new Date(date1).setHours(0, 0, 0, 0)
const diffTime = Math.abs(date2 - date1)
const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
const m = moment()
m.set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
// console.log(m.toISOString())
const data = 'king'
const cekVal = moment().format('YYYY-MM-DD')
console.log(cekVal)
