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
const res = {
  column: 'aos'
}
// const data = [{ aos: 'king', nom: 2, bm: 3 }, { aos: 'kang', nom: 12, bm: 13 }, { aos: 'kong', nom: 22, bm: 23 }]
// const dataName = data.map(item => { return item[res.column] })

const data = [
  {
    itemOne: 111,
    itemTwo: 1,
    itemThree: '2022-02-01T00:00:00.000Z'
  },
  {
    itemOne: 222,
    itemTwo: 2,
    itemThree: '2022-01-01T00:00:00.000Z'
  },
  {
    itemOne: 333,
    itemTwo: 3,
    itemThree: '2021-12-01T00:00:00.000Z'
  }
]
data.sort((a, b) => {
  return new Date(a.itemThree) - new Date(b.itemThree)
})

console.log(data)
