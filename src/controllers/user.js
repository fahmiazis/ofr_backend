const joi = require('joi')
const response = require('../helpers/response')
const { user, role, depo, ttd, approve } = require('../models')
const bcrypt = require('bcryptjs')
const { Op } = require('sequelize')
const { pagination } = require('../helpers/pagination')
const readXlsxFile = require('read-excel-file/node')
const multer = require('multer')
const uploadMaster = require('../helpers/uploadMaster')
const uploadHelper = require('../helpers/upload')
const fs = require('fs')
const excel = require('exceljs')
const vs = require('fs-extra')
const { APP_URL } = process.env
const borderStyles = {
  top: { style: 'thin' },
  left: { style: 'thin' },
  bottom: { style: 'thin' },
  right: { style: 'thin' }
}

module.exports = {
  addUser: async (req, res) => {
    try {
      const level = req.user.level
      const schema = joi.object({
        username: joi.string().required(),
        email: joi.string().email(),
        fullname: joi.string().required(),
        password: joi.string().required(),
        kode_plant: joi.string().allow(''),
        level: joi.number().required()
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 401, false)
      } else {
        if (level === 1) {
          if (results.level === 5) {
            const result = await user.findAll({ where: { username: results.username } })
            if (result.length > 0) {
              return response(res, 'username already use', {}, 404, false)
            } else {
              const result = await user.findAll({
                where: {
                  [Op.and]: [
                    { kode_plant: results.kode_plant },
                    { level: results.level }
                  ]
                }
              })
              if (result.length > 0) {
                return response(res, 'kode area and user level already use', {}, 404, false)
              } else {
                results.password = await bcrypt.hash(results.password, await bcrypt.genSalt())
                const result = await user.create(results)
                if (result) {
                  return response(res, 'Add User succesfully', { result })
                } else {
                  return response(res, 'Fail to create user', {}, 400, false)
                }
              }
            }
          } else {
            const result = await user.findAll({ where: { username: results.username } })
            if (result.length > 0) {
              return response(res, 'username already use', {}, 404, false)
            } else {
              results.password = await bcrypt.hash(results.password, await bcrypt.genSalt())
              const result = await user.create(results)
              if (result) {
                return response(res, 'Add User succesfully', { result })
              } else {
                return response(res, 'Fail to create user', {}, 400, false)
              }
            }
          }
        } else {
          return response(res, "You're not super administrator", {}, 404, false)
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  updateUser: async (req, res) => {
    try {
      const level = req.user.level
      const id = req.params.id
      const schema = joi.object({
        username: joi.string(),
        fullname: joi.string(),
        password: joi.string().allow(''),
        kode_plant: joi.string().allow(''),
        level: joi.number(),
        email: joi.string().email()
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 401, false)
      } else {
        if (level !== 0) {
          if (level === 5) {
            const result = await user.findAll({
              where: {
                [Op.and]: [
                  { kode_plant: results.kode_plant },
                  { level: results.level }
                ],
                [Op.not]: { id: id }
              }
            })
            if (result.length > 0) {
              return response(res, 'kode area and user level already use', {}, 404, false)
            } else {
              const result = await user.findAll({
                where: {
                  username: results.username,
                  [Op.not]: { id: id }
                }
              })
              if (result.length > 0) {
                return response(res, 'username already use', { result }, 404, false)
              } else {
                if (results.fullname !== '' || results.fullname) {
                  const result = await user.findAll({
                    where: {
                      username: results.username,
                      [Op.not]: { id: id }
                    }
                  })
                  if (result.length > 0) {
                    return response(res, 'fullname already use', { result }, 404, false)
                  } else {
                    if (results.password) {
                      results.password = await bcrypt.hash(results.password, await bcrypt.genSalt())
                      const result = await user.findByPk(id)
                      if (result) {
                        await result.update(results)
                        return response(res, 'update User succesfully', { result })
                      } else {
                        return response(res, 'Fail to update user', {}, 400, false)
                      }
                    } else {
                      const result = await user.findByPk(id)
                      if (result) {
                        await result.update(results)
                        return response(res, 'update User succesfully', { result })
                      } else {
                        return response(res, 'Fail to update user', {}, 400, false)
                      }
                    }
                  }
                } else {
                  if (results.password) {
                    results.password = await bcrypt.hash(results.password, await bcrypt.genSalt())
                    const result = await user.findByPk(id)
                    if (result) {
                      await result.update(results)
                      return response(res, 'update User succesfully', { result })
                    } else {
                      return response(res, 'Fail to update user', {}, 400, false)
                    }
                  } else {
                    const result = await user.findByPk(id)
                    if (result) {
                      await result.update(results)
                      return response(res, 'update User succesfully', { result })
                    } else {
                      return response(res, 'Fail to update user', {}, 400, false)
                    }
                  }
                }
              }
            }
          } else {
            const result = await user.findAll({
              where: {
                username: results.username,
                [Op.not]: { id: id }
              }
            })
            if (result.length > 0) {
              return response(res, 'username already exist', { result }, 404, false)
            } else {
              if (results.fullname !== '' || results.fullname) {
                const result = await user.findAll({
                  where: {
                    username: results.username,
                    [Op.not]: { id: id }
                  }
                })
                if (result.length > 0) {
                  return response(res, 'fullname already use', { result }, 404, false)
                } else {
                  if (results.password) {
                    results.password = await bcrypt.hash(results.password, await bcrypt.genSalt())
                    const result = await user.findByPk(id)
                    if (result) {
                      await result.update(results)
                      return response(res, 'update User succesfully', { result })
                    } else {
                      return response(res, 'Fail to update user', {}, 400, false)
                    }
                  } else {
                    const result = await user.findByPk(id)
                    if (result) {
                      await result.update(results)
                      return response(res, 'update User succesfully', { result })
                    } else {
                      return response(res, 'Fail to update user', {}, 400, false)
                    }
                  }
                }
              } else {
                if (results.password) {
                  results.password = await bcrypt.hash(results.password, await bcrypt.genSalt())
                  const result = await user.findByPk(id)
                  if (result) {
                    await result.update(results)
                    return response(res, 'update User succesfully', { result })
                  } else {
                    return response(res, 'Fail to update user', {}, 400, false)
                  }
                } else {
                  const result = await user.findByPk(id)
                  if (result) {
                    await result.update(results)
                    return response(res, 'update User succesfully', { result })
                  } else {
                    return response(res, 'Fail to update user', {}, 400, false)
                  }
                }
              }
            }
          }
        } else {
          return response(res, "You're not super administrator", {}, 404, false)
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  uploadImage: async (req, res) => {
    const id = req.params.id
    uploadHelper(req, res, async function (err) {
      try {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_UNEXPECTED_FILE' && req.files.length === 0) {
            // console.log(err.code === 'LIMIT_UNEXPECTED_FILE' && req.files.length > 0)
            return response(res, 'fieldname doesnt match', {}, 500, false)
          }
          return response(res, err.message, {}, 500, false)
        } else if (err) {
          return response(res, err.message, {}, 401, false)
        }
        const dokumen = `uploads/${req.file.filename}`
        const send = {
          image: dokumen
        }
        const make = await user.findByPk(id)
        if (make) {
          await make.update(send)
          return response(res, 'success upload image')
        } else {
          return response(res, 'success upload image')
        }
      } catch (error) {
        return response(res, error.message, {}, 500, false)
      }
    })
  },
  deleteUser: async (req, res) => {
    try {
      const level = req.user.level
      const id = req.params.id
      if (level === 1) {
        const result = await user.findByPk(id)
        if (result) {
          await result.destroy()
          return response(res, 'delete user success', { result })
        } else {
          return response(res, 'user not found', {}, 404, false)
        }
      } else {
        return response(res, "You're not super administrator", {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getUser: async (req, res) => {
    try {
      let { limit, page, search, sort, filter } = req.query
      let searchValue = ''
      let sortValue = ''
      if (typeof search === 'object') {
        searchValue = Object.values(search)[0]
      } else {
        searchValue = search || ''
      }
      if (typeof sort === 'object') {
        sortValue = Object.values(sort)[0]
      } else {
        sortValue = sort || 'createdAt'
      }
      if (!limit) {
        limit = 10
      } else if (limit === 'all') {
        const findLimit = await user.findAll()
        limit = findLimit.length
      } else {
        limit = parseInt(limit)
      }
      if (!page) {
        page = 1
      } else {
        page = parseInt(page)
      }
      if (filter === 'null' || filter === undefined) {
        const result = await user.findAndCountAll({
          where: {
            [Op.or]: [
              { username: { [Op.like]: `%${searchValue}%` } },
              { fullname: { [Op.like]: `%${searchValue}%` } },
              { email: { [Op.like]: `%${searchValue}%` } },
              { kode_plant: { [Op.like]: `%${searchValue}%` } }
            ],
            [Op.not]: { level: 1 }
          },
          include: [
            {
              model: role,
              as: 'role'
            }
          ],
          order: [[sortValue, 'ASC']],
          limit: limit,
          offset: (page - 1) * limit
        })
        const pageInfo = pagination('/user/get', req.query, page, limit, result.count)
        if (result) {
          return response(res, 'list user', { result, pageInfo })
        } else {
          return response(res, 'failed to get user', {}, 404, false)
        }
      } else {
        const findRole = await role.findByPk(filter)
        if (findRole) {
          const result = await user.findAndCountAll({
            where: {
              level: findRole.level,
              [Op.or]: [
                { username: { [Op.like]: `%${searchValue}%` } },
                { fullname: { [Op.like]: `%${searchValue}%` } },
                { email: { [Op.like]: `%${searchValue}%` } },
                { kode_plant: { [Op.like]: `%${searchValue}%` } }
              ],
              [Op.not]: { level: 1 }
            },
            include: [
              {
                model: role,
                as: 'role'
              }
            ],
            order: [[sortValue, 'ASC']],
            limit: limit,
            offset: (page - 1) * limit
          })
          const pageInfo = pagination('/user/get', req.query, page, limit, result.count)
          if (result) {
            return response(res, 'list user', { result, pageInfo })
          } else {
            return response(res, 'failed to get user', {}, 404, false)
          }
        } else {
          return response(res, 'failed to get user1', {}, 404, false)
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getDetailUser: async (req, res) => {
    try {
      const id = req.params.id
      const result = await user.findByPk(id)
      if (result) {
        return response(res, `Profile of user with id ${id}`, { result })
      } else {
        return response(res, 'fail to get user', {}, 400, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  uploadMasterUser: async (req, res) => {
    const level = req.user.level
    if (level === 1) {
      uploadMaster(req, res, async function (err) {
        try {
          if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_UNEXPECTED_FILE' && req.files.length === 0) {
              console.log(err.code === 'LIMIT_UNEXPECTED_FILE' && req.files.length > 0)
              return response(res, 'fieldname doesnt match', {}, 500, false)
            }
            return response(res, err.message, {}, 500, false)
          } else if (err) {
            return response(res, err.message, {}, 401, false)
          }
          const dokumen = `assets/masters/${req.files[0].filename}`
          const rows = await readXlsxFile(dokumen)
          const count = []
          const cek = ['User Name', 'Full Name', 'Kode Area', 'Email', 'User Level']
          const valid = rows[0]
          for (let i = 0; i < cek.length; i++) {
            if (valid[i] === cek[i]) {
              count.push(1)
            }
          }
          if (count.length === cek.length) {
            const plant = []
            const userName = []
            const cek = []
            for (let i = 1; i < rows.length; i++) {
              const a = rows[i]
              const cekLevel = a[4].split('-')
              if (cekLevel[0] === '5' || cekLevel[0] === 5) {
                plant.push(`Kode area ${a[2]} dan  User level ${a[4]}`)
              }
              userName.push(`User Name ${a[0]}`)
              cek.push(`${a[0]}`)
            }
            const object = {}
            const result = []
            const obj = {}

            userName.forEach(item => {
              if (!obj[item]) { obj[item] = 0 }
              obj[item] += 1
            })

            for (const prop in obj) {
              if (obj[prop] >= 2) {
                result.push(prop)
              }
            }

            plant.forEach(item => {
              if (!object[item]) { object[item] = 0 }
              object[item] += 1
            })

            for (const prop in object) {
              if (object[prop] >= 2) {
                result.push(prop)
              }
            }
            if (result.length > 0) {
              return response(res, 'there is duplication in your file master', { result }, 404, false)
            } else {
              rows.shift()
              const create = []
              for (let i = 0; i < rows.length; i++) {
                const noun = []
                const process = rows[i]
                for (let j = 0; j < process.length + 1; j++) {
                  if (j === 5) {
                    let str = 'pma12345'
                    str = await bcrypt.hash(str, await bcrypt.genSalt())
                    noun.push(str)
                  } else {
                    noun.push(process[j])
                  }
                }
                create.push(noun)
              }
              if (create.length > 0) {
                const arr = []
                for (let i = 0; i < create.length; i++) {
                  const dataUser = create[i]
                  const dataCreate = {
                    username: dataUser[0],
                    fullname: dataUser[1],
                    kode_plant: dataUser[2],
                    email: dataUser[3],
                    level: dataUser[4].split('-')[0],
                    password: dataUser[5]
                  }
                  const dataUpdate = {
                    username: dataUser[0],
                    fullname: dataUser[1],
                    kode_plant: dataUser[2],
                    email: dataUser[3],
                    level: dataUser[4].split('-')[0]
                  }
                  if (parseInt(dataUser[4].split('-')[0]) === 5) {
                    const findUser = await user.findOne({
                      where: {
                        kode_plant: dataUser[2]
                      }
                    })
                    if (findUser) {
                      const upUser = await findUser.update(dataUpdate)
                      if (upUser) {
                        arr.push(upUser)
                      }
                    } else {
                      const createUser = await user.create(dataCreate)
                      if (createUser) {
                        arr.push(createUser)
                      }
                    }
                  } else {
                    const findUser = await user.findOne({
                      where: {
                        username: dataUser[0]
                      }
                    })
                    if (findUser) {
                      const upUser = await findUser.update(dataUpdate)
                      if (upUser) {
                        arr.push(upUser)
                      }
                    } else {
                      const createUser = await user.create(dataCreate)
                      if (createUser) {
                        arr.push(createUser)
                      }
                    }
                  }
                }
                if (arr.length) {
                  fs.unlink(dokumen, function (err) {
                    if (err) throw err
                    console.log('success delete file')
                  })
                  return response(res, 'successfully upload file master')
                } else {
                  fs.unlink(dokumen, function (err) {
                    if (err) throw err
                    console.log('success delete file')
                  })
                  return response(res, 'failed to upload file', {}, 404, false)
                }
              } else {
                return response(res, 'failed to upload file', {}, 404, false)
              }
            }
          } else {
            fs.unlink(dokumen, function (err) {
              if (err) throw err
              console.log('success delete file')
            })
            return response(res, 'Failed to upload master file, please use the template provided', {}, 400, false)
          }
        } catch (error) {
          return response(res, error.message, {}, 500, false)
        }
      })
    } else {
      return response(res, "You're not super administrator", {}, 404, false)
    }
  },
  exportSqlUser: async (req, res) => {
    try {
      const result = await user.findAll()
      if (result) {
        const workbook = new excel.Workbook()
        const worksheet = workbook.addWorksheet()
        const arr = []
        const header = ['User Name', 'Full Name', 'Kode Area', 'User Level', 'Email']
        const key = ['username', 'fullname', 'kode_plant', 'level', 'email']
        for (let i = 0; i < header.length; i++) {
          let temp = { header: header[i], key: key[i] }
          arr.push(temp)
          temp = {}
        }
        worksheet.columns = arr
        worksheet.addRows(result)
        worksheet.eachRow({ includeEmpty: true }, function (row, rowNumber) {
          row.eachCell({ includeEmpty: true }, function (cell, colNumber) {
            cell.border = borderStyles
          })
        })

        worksheet.columns.forEach(column => {
          const lengths = column.values.map(v => v.toString().length)
          const maxLength = Math.max(...lengths.filter(v => typeof v === 'number'))
          column.width = maxLength + 5
        })
        const cek = [1]
        if (cek.length > 0) {
          const name = new Date().getTime().toString().concat('-user').concat('.xlsx')
          await workbook.xlsx.writeFile(name)
          vs.move(name, `assets/exports/${name}`, function (err) {
            if (err) {
              throw err
            }
            console.log('success delete file')
          })
          return response(res, 'success', { link: `${APP_URL}/download/${name}` })
        } else {
          return response(res, 'failed create file', {}, 404, false)
        }
      } else {
        return response(res, 'failed', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  changePassword: async (req, res) => {
    try {
      const id = req.user.id
      const schema = joi.object({
        current: joi.string().required(),
        new: joi.string().required()
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 401, false)
      } else {
        const send = await bcrypt.hash(results.new, await bcrypt.genSalt())
        const findUser = await user.findByPk(id)
        if (findUser) {
          bcrypt.compare(results.current, findUser.password, function (_err, result) {
            if (result) {
              const data = {
                password: send
              }
              const updatePass = findUser.update(data)
              if (updatePass) {
                return response(res, 'success change password')
              } else {
                return response(res, 'success change password2')
              }
            } else {
              return response(res, 'failed change password', {}, 400, false)
            }
          })
        } else {
          return response(res, 'failed change password', {}, 400, false)
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  resetPassword: async (req, res) => {
    try {
      const id = req.params.id
      const schema = joi.object({
        new: joi.string().required()
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 401, false)
      } else {
        const send = await bcrypt.hash(results.new, await bcrypt.genSalt())
        const findUser = await user.findByPk(id)
        if (findUser) {
          const data = {
            password: send
          }
          const updatePass = findUser.update(data)
          if (updatePass) {
            return response(res, 'success reset password')
          } else {
            return response(res, 'success reset password2')
          }
        } else {
          return response(res, 'failed reset password', {}, 400, false)
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  createRole: async (req, res) => {
    try {
      const level = req.user.level
      const schema = joi.object({
        name: joi.string().required(),
        fullname: joi.string().required(),
        level: joi.string().required(),
        type: joi.string().required()
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 401, false)
      } else {
        if (level === 1) {
          const result = await role.findAll({
            where: {
              [Op.or]: [
                { name: results.name },
                { level: results.level }
              ]
            }
          })
          if (result.length > 0) {
            return response(res, 'role or level already exist', {}, 404, false)
          } else {
            const result = await role.create(results)
            if (result) {
              return response(res, 'Add Role succesfully', { result })
            } else {
              return response(res, 'Fail to create role', {}, 400, false)
            }
          }
        } else {
          return response(res, "You're not super administrator", {}, 404, false)
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getRole: async (req, res) => {
    try {
      const result = await role.findAll()
      if (result) {
        return response(res, 'succes get role', { result })
      } else {
        return response(res, 'failed get role', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getDetailRole: async (req, res) => {
    try {
      const id = req.params.id
      const result = await role.findByPk(id)
      if (result) {
        return response(res, `Profile of role with id ${id}`, { result })
      } else {
        return response(res, 'fail to get role', {}, 400, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  updateRole: async (req, res) => {
    try {
      const level = req.user.level
      const id = req.params.id
      const schema = joi.object({
        name: joi.string().required(),
        fullname: joi.string().required(),
        type: joi.string().required()
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 401, false)
      } else {
        if (level === 1) {
          const result = await role.findAll({
            where: {
              name: results.name,
              [Op.not]: { id: id }
            }
          })
          if (result.length > 0) {
            return response(res, 'role or level already exist', {}, 404, false)
          } else {
            const findRole = await role.findByPk(id)
            const findRoleUp = await role.findByPk(id)
            if (findRole) {
              const result = await findRoleUp.update(results)
              if (result) {
                const findTtd = await ttd.findAll({
                  where: {
                    jabatan: findRole.name
                  }
                })
                const findApp = await approve.findAll({
                  where: {
                    jabatan: findRole.name
                  }
                })
                if (findTtd.length > 0 || findApp.length > 0) {
                  const temp = []
                  const hasil = []
                  for (let i = 0; i < findTtd.length; i++) {
                    const findData = await ttd.findByPk(findTtd[i].id)
                    const upData = {
                      jabatan: results.name
                    }
                    if (findData) {
                      await findData.update(upData)
                      temp.push(1)
                    }
                  }
                  for (let i = 0; i < findApp.length; i++) {
                    const findData = await approve.findByPk(findApp[i].id)
                    const upData = {
                      jabatan: results.name
                    }
                    if (findData) {
                      await findData.update(upData)
                      hasil.push(1)
                    }
                  }
                  if (temp.length || hasil.length) {
                    return response(res, 'update Role succesfully good', { result, findTtd, findApp, findRole })
                  } else {
                    return response(res, 'update Role succesfully wut', { result, findTtd, findApp, findRole })
                  }
                } else {
                  return response(res, 'update Role succesfully bad', { result, findTtd, findApp, findRole })
                }
              } else {
                return response(res, 'Fail to create role', {}, 400, false)
              }
            } else {
              return response(res, 'Fail to create role', {}, 400, false)
            }
          }
        } else {
          return response(res, "You're not super administrator", {}, 404, false)
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  generateUser: async (req, res) => {
    try {
      const level = req.user.level
      const schema = joi.object({
        column: joi.string().required(),
        level: joi.number().required()
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 401, false)
      } else {
        if (level === 1) {
          const findDepo = await depo.findAll({
            group: [results.column]
          })
          if (findDepo.length > 0) {
            if (results.level === 5 || results.level === 6) {
              const temp = []
              for (let i = 0; i < findDepo.length; i++) {
                const result = await user.findOne({ where: { username: { [Op.like]: `%${findDepo[i].kode_plant}%` } } })
                if (result) {
                  console.log('failed create')
                } else {
                  const result = await user.findOne({
                    where: {
                      [Op.and]: [
                        { kode_plant: findDepo[i].kode_plant },
                        { level: results.level }
                      ]
                    }
                  })
                  if (result) {
                    console.log('failed create')
                  } else {
                    const data = {
                      username: findDepo[i].kode_plant,
                      email: 'tester@mail.com',
                      fullname: findDepo[i].aos,
                      password: 'pma12345',
                      kode_plant: findDepo[i].kode_plant,
                      level: results.level
                    }
                    data.password = await bcrypt.hash(data.password, await bcrypt.genSalt())
                    const createUser = await user.create(data)
                    if (createUser) {
                      temp.push(createUser)
                    }
                  }
                }
              }
              if (temp.length > 0) {
                return response(res, 'geenerate User succesfully', { temp })
              } else {
                return response(res, 'geenerate User succesfully', { temp })
              }
            } else {
              const temp = []
              for (let i = 0; i < findDepo.length; i++) {
                const dataName = findDepo[i][results.column]
                const result = await user.findOne({ where: { username: { [Op.like]: `%${dataName}%` } } })
                if (result) {
                  console.log('failed create')
                } else {
                  const data = {
                    username: dataName,
                    email: 'tester@mail.com',
                    fullname: dataName,
                    password: 'pma12345',
                    kode_plant: '',
                    level: results.level
                  }
                  data.password = await bcrypt.hash(data.password, await bcrypt.genSalt())
                  const createUser = await user.create(data)
                  if (createUser) {
                    temp.push(createUser)
                  }
                }
              }
              if (temp.length > 0) {
                console.log(typeof findDepo[0][results.column])
                return response(res, 'geenerate User succesfully', { temp })
              } else {
                return response(res, 'geenerate User succesfully', { temp })
              }
            }
          } else {
            return response(res, 'Fail to create user2', {}, 400, false)
          }
        } else {
          return response(res, "You're not super administrator", {}, 404, false)
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  deleteUserByLevel: async (req, res) => {
    try {
      const level = req.user.level
      const schema = joi.object({
        level: joi.number().required()
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 401, false)
      } else {
        if (level === 1) {
          const result = await user.findAll({
            where: {
              level: results.level
            }
          })
          if (result.length) {
            const temp = []
            for (let i = 0; i < result.length; i++) {
              const findUser = await user.findByPk(result[i].id)
              if (findUser) {
                const delUser = await findUser.destroy()
                if (delUser) {
                  temp.push(delUser)
                }
              }
            }
            if (temp.length > 0) {
              return response(res, 'delete user success', { result })
            } else {
              return response(res, 'failed delete user success', { result })
            }
          } else {
            return response(res, 'user not found', {}, 404, false)
          }
        } else {
          return response(res, "You're not super administrator", {}, 404, false)
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  }
}
