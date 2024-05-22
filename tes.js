const str = '66,43'

const tes = str.toString().split('').filter((item) => item !== '.' && item !== ',' && isNaN(parseFloat(item))).length > 0
const tes2 = parseFloat(str)

console.log(tes)
console.log(tes2)
