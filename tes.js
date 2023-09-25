const cekUn = (mtk, indo) => {
  const total = mtk + indo
  const avr = total / 2
  let grade = ''
  if (avr >= 90 && avr <= 100) {
    grade = 'A'
  } else if (avr >= 80 && avr < 90) {
    grade = 'B'
  }
  console.log(total, avr, grade)
}

cekUn(80, 85)
