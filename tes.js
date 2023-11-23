const ppu = '2343546546751'
const pa = 'g'
const vendor = 'V100100100'

// PPU :  (10 digit number)
// PA :  (16 digit number)
// No Vendor :  (10 digit komibanasi number dan text)

const conv = ppu.toString()
const splconv = conv.split('')

// console.log(typeof conv === 'number')
// console.log(isNaN(parseFloat(pa)))
// splconv.map(item =>
//   isNaN(parseFloat(item)) === true ? return
// )
const result = splconv.filter((item) => isNaN(parseFloat(item))).length > 0
console.log(result)
// console.log(vendor.length)
