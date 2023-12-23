const response = require('../helpers/response')
const { bracket } = require('../models')
const joi = require('joi')
const { Op } = require('sequelize')
const jwt = require('jsonwebtoken')

const { APP_KEY } = process.env

module.exports = {
  registerBracket: async (req, res) => {
    try {
      const { name } = req.body
      const findBracket = await bracket.findAll({
        where: {
          name: name
        }
      })
      const findAllBracket = await bracket.findAll({
        where: {
          [Op.not]: { name: 'Fahmi Aziz' }
        }
      })
      if (findBracket.length > 0 || findAllBracket.length >= 8) {
        return response(res, 'nama telah terdaftar atau kuota pendaftaran telah habis', {}, 404, false)
      } else {
        const temp = []
        for (let i = 0; i < 1; i++) {
          const data = {
            name: name,
            bracket: 1,
            status: name === 'Fahmi Aziz' ? 100 : 1
          }
          const findData = await bracket.create(data)
          if (findData) {
            temp.push(findData)
          }
        }
        if (temp.length > 0) {
          return response(res, 'success daftar bracket')
        } else {
          return response(res, 'gagal daftar bracket', {}, 404, false)
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  loginBracket: async (req, res) => {
    try {
      const schema = joi.object({
        name: joi.string().required()
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 401, false)
      } else {
        const result = await bracket.findOne({
          where: {
            name: results.name
          }
        })
        if (result) {
          const { id, name } = result
          jwt.sign({ id: id, level: name, kode: name, name: name, fullname: name, role: name }, `${APP_KEY}`, (_err, token) => {
            return response(res, 'login success', { user: { id, kode_plant: name, level: name, name: name, fullname: name, email: name, role: name }, Token: `${token}` })
          })
        } else {
          return response(res, 'name is not registered', {}, 400, false)
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  generateBracket: async (req, res) => {
    try {
      const { name } = req.body
      if (name === 'Fahmi Aziz') {
        const findBracket = await bracket.findAll({
          where: {
            status: 1
          }
        })
        if (findBracket.length % 2 === 0) {
          const dataBracket = []
          for (let i = 0; i < findBracket.length; i++) {
            console.log(dataBracket)
            if (i % 2 === 1) {
              console.log('masuk if')
              for (let j = 0; j < findBracket.length; j++) {
                const user = findBracket[i].name
                const enemi = findBracket[j].name
                const findDataEnemi = dataBracket.length === 0 ? undefined : dataBracket.find(item => item.enemi === enemi)
                const findDataUser = dataBracket.length === 0 ? undefined : dataBracket.find(item => item.user === enemi)

                const findUser = dataBracket.length === 0 ? undefined : dataBracket.find(item => item.user === user)
                const findEnemi = dataBracket.length === 0 ? undefined : dataBracket.find(item => item.enemi === user)
                if (findDataEnemi !== undefined) {
                  console.log()
                } else if (findEnemi !== undefined && findBracket[j].name !== findBracket[i].name) {
                  dataBracket.push({ user: user, enemi: findEnemi.user, order: findEnemi.order })
                  break
                } else {
                  if (findDataUser !== undefined && findDataUser.enemi === user) {
                    dataBracket.push({ user: user, enemi: findDataUser.user, order: findDataUser.order })
                    break
                  } else if (findDataUser !== undefined && findDataUser.enemi !== user) {
                    console.log()
                  } else if (findUser !== undefined) {
                    console.log()
                  } else if (findBracket[j].name !== findBracket[i].name) {
                    dataBracket.push({ user: user, enemi: enemi, order: i + 1 })
                    break
                  }
                }
              }
            } else {
              console.log('masuk else')
              for (let j = findBracket.length - 1; j >= 0; j--) {
                const user = findBracket[i].name
                const enemi = findBracket[j].name
                const findDataEnemi = dataBracket.length === 0 ? undefined : dataBracket.find(item => item.enemi === enemi)
                const findDataUser = dataBracket.length === 0 ? undefined : dataBracket.find(item => item.user === enemi)

                const findUser = dataBracket.length === 0 ? undefined : dataBracket.find(item => item.user === user)
                const findEnemi = dataBracket.length === 0 ? undefined : dataBracket.find(item => item.enemi === user)
                if (findDataEnemi !== undefined) {
                  console.log()
                } else if (findEnemi !== undefined && findBracket[j].name !== findBracket[i].name) {
                  dataBracket.push({ user: user, enemi: findEnemi.user, order: findEnemi.order })
                  break
                } else {
                  if (findDataUser !== undefined && findDataUser.enemi === user) {
                    dataBracket.push({ user: user, enemi: findDataUser.user, order: findDataUser.order })
                    break
                  } else if (findDataUser !== undefined && findDataUser.enemi !== user) {
                    console.log()
                  } else if (findUser !== undefined) {
                    console.log()
                  } else if (findBracket[j].name !== findBracket[i].name) {
                    dataBracket.push({ user: user, enemi: enemi, order: i + 1 })
                    break
                  }
                }
              }
            }
          }
          console.log(dataBracket)
          if (dataBracket.length > 0) {
            console.log('lolos valid')
            console.log(dataBracket.find(item => item.user === findBracket[0].name))
            const temp = []
            for (let i = 0; i < findBracket.length; i++) {
              const data = {
                name: findBracket[i].name,
                bracket: 1,
                enemi: dataBracket.find(item => item.user === findBracket[i].name).enemi,
                order: dataBracket.find(item => item.user === findBracket[i].name).order
              }
              const findData = await bracket.findByPk(findBracket[i].id)
              if (findData) {
                await findData.update(data)
                temp.push(findData)
              }
            }
            if (temp.length > 0) {
              return response(res, 'success daftar bracket', { temp })
            } else {
              return response(res, 'gagal generate bracket1', {}, 404, false)
            }
          } else {
            return response(res, 'gagal generate bracket2', {}, 404, false)
          }
        } else {
          return response(res, 'gagal generate bracket3', {}, 404, false)
        }
      } else {
        return response(res, 'gagal generate bracket4', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getBracket: async (req, res) => {
    try {
      const findAllBracket = await bracket.findAll()
      const findBracket = await bracket.findAll({
        where: {
          [Op.not]: { order: null }
        },
        order: [['order', 'ASC']]
      })
      if (findAllBracket.length > 0) {
        return response(res, 'success get daftar bracket', { resultAll: findAllBracket, result: findBracket })
      } else {
        return response(res, 'gagal get daftar bracket', { resultAll: [], result: [] })
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  deleteBracket: async (req, res) => {
    try {
      const findAllBracket = await bracket.findAll({
        where: {
          [Op.not]: { status: 100 }
        }
      })
      if (findAllBracket.length > 0) {
        const temp = []
        for (let i = 0; i < findAllBracket.length; i++) {
          const findData = await bracket.findByPk(findAllBracket[i].id)
          if (findData) {
            await findData.destroy()
            temp.push(findData)
          }
        }
        if (temp.length > 0) {
          return response(res, 'success delete daftar bracket', { temp })
        } else {
          return response(res, 'gagal get daftar bracket', {}, 404, false)
        }
      } else {
        return response(res, 'gagal get daftar bracket', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  winBracket: async (req, res) => {
    try {
      const { id, order } = req.body
      const findBracket = await bracket.findByPk(id)
      const findEnemi = await bracket.findOne({
        where: {
          order: order,
          [Op.not]: { id: id }
        }
      })
      if (findBracket && (findEnemi || !findEnemi)) {
        const idEnemy = !findEnemi || findEnemi.history === undefined ? 'nothing' : findEnemi.id
        const dataLose = {
          status: 0,
          history: !findEnemi || findEnemi.history === undefined ? '' : `${findEnemi.history === null ? '' : findEnemi.history}bracket ${findBracket.bracket},lose by ${id};`
        }
        const findNew = await bracket.findAll({
          where: {
            bracket: findBracket.bracket + 1
          }
        })
        const findAllBracket = await bracket.findAll({
          where: {
            [Op.not]: { status: 100 }
          }
        })
        if (findNew.length > 0) {
          const tempOrder = []
          const cekOrder = []
          const resOrder = []
          const useOrder = []
          findNew.map(item => tempOrder.push(item.order))

          tempOrder.forEach(item => {
            if (!cekOrder[item]) { cekOrder[item] = 0 }
            cekOrder[item] += 1
          })

          for (const prop in cekOrder) {
            if (cekOrder[prop] >= 2) {
              resOrder.push(prop)
            } else {
              useOrder.push(prop)
            }
          }
          if (useOrder.length > 0) {
            console.log('masuk use order')
            const dataWin = {
              bracket: findBracket.bracket + 1,
              order: useOrder[0],
              history: `${findBracket.history === null ? '' : findBracket.history}bracket ${findBracket.bracket},win by ${idEnemy};`
            }
            !findEnemi || findEnemi.history === undefined ? console.log('') : await findEnemi.update(dataLose)
            await findBracket.update(dataWin)
            return response(res, 'success update win bracket1', { findBracket })
          } else {
            const dataWin = {
              bracket: findBracket.bracket + 1,
              order: resOrder[resOrder.length - 1] + 1,
              history: `${findBracket.history === null ? '' : findBracket.history}bracket ${findBracket.bracket},win by ${idEnemy};`
            }
            !findEnemi || findEnemi.history === undefined ? console.log('') : await findEnemi.update(dataLose)
            await findBracket.update(dataWin)
            return response(res, 'success update win bracket2', { findBracket })
          }
        } else {
          const dataWin = {
            bracket: findBracket.bracket + 1,
            order: findAllBracket.length * (findBracket.bracket + 1),
            history: `${findBracket.history === null ? '' : findBracket.history}bracket ${findBracket.bracket},win by ${idEnemy};`
          }
          !findEnemi || findEnemi.history === undefined ? console.log('') : await findEnemi.update(dataLose)
          await findBracket.update(dataWin)
          return response(res, 'success update win bracket3', { findBracket })
        }
      } else {
        return response(res, 'gagal get daftar bracket', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  deleteId: async (req, res) => {
    try {
      const { id } = req.body
      const findAllBracket = await bracket.findByPk(id)
      if (findAllBracket) {
        await findAllBracket.destroy()
        return response(res, 'success delete daftar bracket', { findAllBracket })
      } else {
        return response(res, 'gagal get daftar bracket', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  }
}
