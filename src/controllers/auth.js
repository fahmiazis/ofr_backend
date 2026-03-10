// controllers/auth.js
const joi = require('joi')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const response = require('../helpers/response')
const { user, role, user_session } = require('../models')
const { Op } = require('sequelize')

const {
  APP_KEY,
  REFRESH_TOKEN_SECRET,
  ACCESS_TOKEN_EXPIRES = '15m',
  REFRESH_TOKEN_EXPIRES_DAYS = 30
} = process.env

// ── helpers ──────────────────────────────────────────────────────────────────

const generateAccessToken = (payload) =>
  jwt.sign(payload, APP_KEY, { expiresIn: ACCESS_TOKEN_EXPIRES })

const generateRefreshToken = () =>
  crypto.randomBytes(64).toString('hex') // opaque token, disimpan di DB

const getRefreshTokenExpiry = () => {
  const date = new Date()
  date.setDate(date.getDate() + Number(REFRESH_TOKEN_EXPIRES_DAYS))
  return date
}

const buildUserPayload = (userData, costCenter = null) => {
  const { id, kode_plant, level, username, fullname, email, role } = userData
  const base = { id, level, kode: kode_plant, name: username, fullname, role: role.name }
  if (costCenter) base.cost_center = costCenter
  if (role.type) base.typerole = role.type
  return base
}

// ── login ─────────────────────────────────────────────────────────────────────

module.exports = {
  login: async (req, res) => {
    try {
      const schema = joi.object({
        username: joi.string().required(),
        password: joi.string().required(),
        cost_center: joi.string().allow(''),
        device_info: joi.string().allow('').default('unknown')
      })

      const { value: body, error } = schema.validate(req.body)
      if (error) return response(res, 'Validation error', { error: error.message }, 400, false)

      // cari user (case-insensitive untuk p000)
      const isSpecialUser = body.username.toLowerCase() === 'p000'
      const whereClause = isSpecialUser
        ? { username: { [Op.like]: `%${body.username}%` } }
        : { username: body.username }

      const found = await user.findOne({
        where: whereClause,
        include: [{ model: role, as: 'role' }]
      })

      if (!found) return response(res, 'Username is not registered', {}, 400, false)

      // validasi password
      const passwordMatch = await bcrypt.compare(body.password, found.password)
      if (!passwordMatch) return response(res, 'Wrong password', {}, 400, false)

      // buat token
      const payload = buildUserPayload(found, body.cost_center)
      const accessToken = generateAccessToken(payload)
      const refreshToken = generateRefreshToken()

      // simpan session ke DB (hapus session lama dari device yang sama kalau mau strict)
      await user_session.create({
        user_id: found.id,
        refresh_token: refreshToken,
        device_info: body.device_info,
        ip_address: req.ip,
        expires_at: getRefreshTokenExpiry()
      })

      const { id, kode_plant, level, username, fullname, email } = found
      return response(res, 'Login success', {
        user: { id, kode_plant, level, username, fullname, email, role: found.role.name },
        access_token: accessToken,
        refresh_token: refreshToken
      })
    } catch (err) {
      return response(res, err.message, {}, 500, false)
    }
  },

// ── refresh token ─────────────────────────────────────────────────────────────

  refreshToken: async (req, res) => {
    try {
      const { refresh_token } = req.body
      if (!refresh_token) return response(res, 'Refresh token required', {}, 401, false)

      // cari session aktif
      const session = await user_session.findOne({
        where: {
          refresh_token,
          is_active: true,
          expires_at: { [Op.gt]: new Date() }
        },
        include: [{ model: user, as: 'user', include: [{ model: role, as: 'role' }] }]
      })

      if (!session) return response(res, 'Invalid or expired refresh token', {}, 401, false)

      // rotate refresh token (best practice — token lama langsung invalid)
      const newRefreshToken = generateRefreshToken()
      await session.update({
        refresh_token: newRefreshToken,
        expires_at: getRefreshTokenExpiry()
      })

      const payload = buildUserPayload(session.user)
      const newAccessToken = generateAccessToken(payload)

      return response(res, 'Token refreshed', {
        access_token: newAccessToken,
        refresh_token: newRefreshToken
      })
    } catch (err) {
      return response(res, err.message, {}, 500, false)
    }
  },

// ── logout ────────────────────────────────────────────────────────────────────

  logout: async (req, res) => {
    try {
      const { refresh_token } = req.body

      // nonaktifkan hanya session device ini
      await user_session.update(
        { is_active: false },
        { where: { refresh_token } }
      )

      return response(res, 'Logout success', {})
    } catch (err) {
      return response(res, err.message, {}, 500, false)
    }
  },

// ── logout semua device ───────────────────────────────────────────────────────

  logoutAll: async (req, res) => {
    try {
      const userId = req.user.id // dari middleware auth

      await user_session.update(
        { is_active: false },
        { where: { user_id: userId, is_active: true } }
      )

      return response(res, 'Logged out from all devices', {})
    } catch (err) {
      return response(res, err.message, {}, 500, false)
    }
  }
}