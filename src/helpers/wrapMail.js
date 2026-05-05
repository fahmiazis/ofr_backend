const nodemailer = require('nodemailer')
const { EMAIL_USER, EMAIL_PASS, EMAIL_HOST, EMAIL_PORT } = process.env
async function wrapedSendMail (mailOptions) {
  return new Promise((resolve, reject) => {
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
      // service: 'gmail',
      // auth: {
      //   user: 'insfopma@gmail.com',
      //   pass: 'dwnf ykro lbml pbvn'
      // }
    })
    let cek = []
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log('error is ' + error)
        resolve(false)
      } else {
        console.log('Email sent: ' + info.response)
        cek.push(1)
        resolve(true)
      }
    })
    setTimeout(() => {
      transporter.close()
      if (cek.length > 0) {
        cek = []
        console.log('masuk settimeout true')
        resolve(true)
      } else {
        cek = []
        console.log('masuk settimeout false')
        resolve(true)
      }
    }, 10000)
  })
}

module.exports = { wrapedSendMail }
