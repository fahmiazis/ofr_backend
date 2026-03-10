// middlewares/auth.js
const jwt = require('jsonwebtoken')
const response = require('../helpers/response')

module.exports = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1] // Bearer <token>

  if (!token) return response(res, 'Token required', {}, 401, false)

  jwt.verify(token, process.env.APP_KEY, (err, decoded) => {
    if (err) {
      const msg = err.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token'
      return response(res, msg, { expired: err.name === 'TokenExpiredError' }, 401, false)
    }
    req.user = decoded
    next()
  })
}