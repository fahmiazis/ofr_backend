const str = '664312139608000'

const tes = str.replace(/[^a-z0-9 -]/g, '')
const tes2 = tes.replace('-', '')

console.log(tes2)
console.log(tes2.length)
