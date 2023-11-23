const ppu = '234354654675e'
const pa = '0'
const vendor = 'V100100100'

// PPU :  (10 digit number)
// PA :  (16 digit number)
// No Vendor :  (10 digit komibanasi number dan text)

const conv = ppu.toString()
const splconv = conv.split('')

// console.log(typeof conv === 'number')
console.log(isNaN(parseFloat(pa)))
// splconv.map(item => {
//   return (
//     isNaN(parseFloat(item)) === false ? console.log(item) : console.log('kong')
//   )
// })
// console.log(vendor.length)
