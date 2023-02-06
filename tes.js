const moment = require('moment')
const arr = [{
  place: 'san francisco',
  name: 879900
},
{
  place: 'san francisco',
  name: 'jane'
},
{
  place: 'new york',
  name: 'james'
}
]
const result = parseInt(moment().format('MM'))
console.log(arr[0].name.length)
