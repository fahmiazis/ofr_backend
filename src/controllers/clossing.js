const { clossing } = require('../models') // eslint-disable-line
const response = require('../helpers/response')
const joi = require('joi')
const moment = require('moment')

module.exports = {
  addDateClossing: async (req, res) => {
    // try {
    const schema = joi.object({
      type: joi.string().required(''),
      day: joi.string().allow(''),
      time: joi.string().allow('')
    })
    const { value: results, error } = schema.validate(req.body)
    if (error) {
      return response(res, 'Error', { error: error.message }, 401, false)
    } else {
      const result = await clossing.findOne({
        where: {
          type: results.type
        }
      })
      if (result) {
        if (results.type === 'monthly') {
          const date = new Date(moment().endOf('month').add(results.day, 'day').format('YYYY-MM-DD'))
          const data = {
            type: results.type,
            day: date
          }
          const update = await result.update(data)
          if (update) {
            return response(res, 'succesfully update date clossing', { update })
          } else {
            return response(res, 'failed update date clossing', {}, 404, false)
          }
        } else {
          const time = new Date(moment(results.time))
          const data = {
            type: results.type,
            time: time
          }
          const update = await result.update(data)
          if (update) {
            return response(res, 'succesfully update date clossing', { update })
          } else {
            return response(res, 'failed update date clossing', {}, 404, false)
          }
        }
      } else {
        if (results.type === 'monthly') {
          const date = new Date(moment().endOf('month').add(results.day, 'day').format('YYYY-MM-DD'))
          const data = {
            type: results.type,
            day: date
          }
          const send = await clossing.create(data)
          if (send) {
            return response(res, 'succesfully add date clossing', { send })
          } else {
            return response(res, 'failed add date clossing', {}, 404, false)
          }
        } else {
          const time = new Date(moment(results.time))
          const data = {
            type: results.type,
            time: time
          }
          const send = await clossing.create(data)
          if (send) {
            return response(res, 'succesfully add date clossing', { send })
          } else {
            return response(res, 'failed add date clossing', {}, 404, false)
          }
        }
      }
    }
    // } catch (error) {
    //   return response(res, error.message, {}, 500, false)
    // }
  },
  getClossing: async (req, res) => {
    try {
      const result = await clossing.findAndCountAll()
      if (result) {
        return response(res, 'list date', { result })
      } else {
        return response(res, 'failed get date', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  }
}
