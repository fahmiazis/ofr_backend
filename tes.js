const moment = require('moment')
const exam = ''
const convert = exam.split(',')
// moment.locale('id')
const deMarch = '0006/P199/V/2023-OPS'
const date1 = moment(moment()).format('DD MMMM YYYY')
const date2 = new Date()
const diffTime = Math.abs(date2 - date1)
const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
console.log(date1)
// console.log(date1[0])
