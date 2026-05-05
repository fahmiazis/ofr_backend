const nodemailer = require('nodemailer')
const { EMAIL_USER, EMAIL_PASS, EMAIL_HOST, EMAIL_PORT } = process.env

const transporter = nodemailer.createTransport({
  connectionTimeout: 60000,
  socketTimeout: 120000,
  greetingTimeout: 30000,
  host: EMAIL_HOST,
  secure: false,
  port: EMAIL_PORT,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
})

module.exports = transporter
