// helper query list transaksi (getKlaim / getOps)
// - rows: subquery agar LIMIT dijalankan sebelum join include; GROUP BY primary key
//   tidak mengubah hasil, jadi dibuang supaya ORDER BY + LIMIT bisa memakai index
// - count: tanpa include (jumlah group sama, jauh lebih ringan); hasil sama dengan findAndCountAll
const isPkGroup = (model, group) => Array.isArray(group) && group.length === 1 && group[0] === `${model.name}.id`

const findListRows = (model, options) => {
  const { group, ...rest } = options
  return model.findAll({ ...rest, subQuery: true, ...(group && !isPkGroup(model, group) ? { group } : {}) })
}

const findListCount = async (model, options) => {
  const { include, order, limit, offset, subQuery, ...countOptions } = options
  const [rows, count] = await Promise.all([findListRows(model, options), model.count(countOptions)])
  return { rows, count }
}

module.exports = { findListRows, findListCount }
