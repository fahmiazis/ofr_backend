const arr = [{ a: 11 }, { a: 21 }, { a: 19 }, { a: 21 }, { a: 46 }]

const elementToCount = 21

const count = () => arr.filter(({ a }) => a !== elementToCount).map((item, index) => {
  return console.log(item, index)
})

count()
