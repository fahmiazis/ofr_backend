const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const response = require('./helpers/response')
const morgan = require('morgan')
const cron = require('node-cron') // eslint-disable-line
const request = require('request') // eslint-disable-line

const app = express()
const server = require('http').createServer(app)

const { APP_PORT, APP_URL } = process.env

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(morgan('dev'))
app.use(cors())

const authRoute = require('./routes/auth')
const zarRoute = require('./routes/zarchive')
// masterdata
const userRoute = require('./routes/user')
const depoRoute = require('./routes/depo')
const coaRoute = require('./routes/coa')
const bankRoute = require('./routes/bank')
const approveRoute = require('./routes/approve')
const menuRoute = require('./routes/menu')
const reasonRoute = require('./routes/reason')
const docRoute = require('./routes/document')
const rekRoute = require('./routes/rekening')
const tarifRoute = require('./routes/tarif')
const paguRoute = require('./routes/pagu')
const emailRoute = require('./routes/email')
const vendorRoute = require('./routes/vendor')
const kliringRoute = require('./routes/kliring')
const fakturRoute = require('./routes/faktur')
const kppRoute = require('./routes/kpp')
const glikkRoute = require('./routes/glikk')
const financeRoute = require('./routes/finance')
const picklaimRoute = require('./routes/picklaim')
const spvklaimRoute = require('./routes/spvklaim')
const reservoirRoute = require('./routes/reservoir')
const taxcodeRoute = require('./routes/taxcode')
const scyllaRoute = require('./routes/scylla')

// transaksi
const klaimRoute = require('./routes/klaim')
const opsRoute = require('./routes/operasional')
const ikkRoute = require('./routes/ikk')
const vervenRoute = require('./routes/verifVendor')

// notif
const notifRoute = require('./routes/notif')

// redpine
const redpineRoute = require('./routes/redpine')

// bracket
const bracketRoute = require('./routes/bracket')

// show document
const showRoute = require('./routes/show')

const authMiddleware = require('./middlewares/auth')

app.use('/uploads', express.static('assets/documents'))
app.use('/masters', express.static('assets/masters'))
app.use('/download', express.static('assets/exports'))
app.use('/assets/documents', express.static('assets/documents'))

app.use('/auth', authRoute)

// masterdata
app.use('/user', authMiddleware, userRoute)
app.use('/depo', authMiddleware, depoRoute)
app.use('/coa', authMiddleware, coaRoute)
app.use('/bank', authMiddleware, bankRoute)
app.use('/approve', authMiddleware, approveRoute)
app.use('/menu', authMiddleware, menuRoute)
app.use('/reason', authMiddleware, reasonRoute)
app.use('/document', authMiddleware, docRoute)
app.use('/rekening', authMiddleware, rekRoute)
app.use('/tarif', authMiddleware, tarifRoute)
app.use('/pagu', authMiddleware, paguRoute)
app.use('/email', authMiddleware, emailRoute)
app.use('/vendor', authMiddleware, vendorRoute)
app.use('/kliring', authMiddleware, kliringRoute)
app.use('/faktur', authMiddleware, fakturRoute)
app.use('/kpp', authMiddleware, kppRoute)
app.use('/glikk', authMiddleware, glikkRoute)
app.use('/finance', authMiddleware, financeRoute)
app.use('/picklaim', authMiddleware, picklaimRoute)
app.use('/spvklaim', authMiddleware, spvklaimRoute)
app.use('/reservoir', authMiddleware, reservoirRoute)
app.use('/taxcode', authMiddleware, taxcodeRoute)
app.use('/scylla', authMiddleware, scyllaRoute)

// transaksi
app.use('/klaim', authMiddleware, klaimRoute)
app.use('/ops', authMiddleware, opsRoute)
app.use('/ikk', authMiddleware, ikkRoute)
app.use('/verven', authMiddleware, vervenRoute)

// notif
app.use('/notif', authMiddleware, notifRoute)

// redpine
app.use('/redpine', redpineRoute)

// bracket
app.use('/bracket', bracketRoute)

// show document
app.use('/show', showRoute)

// tes email
app.use('/tesemail', emailRoute)

// zarchive
app.use('/zip', zarRoute)

// cron update data faktur e-invoices

const options = {
  method: 'GET',
  url: 'http:/localhost:8080/faktur/shelfaktur'
}

cron.schedule('0 0 0 * * *', () => {
  request(options, function (error, response, body) {
    if (error) {
      console.log(error)
    }
  })
}, {
  scheduled: true,
  timezone: 'Asia/Jakarta'
})

app.get('*', (req, res) => {
  response(res, 'Error route not found', {}, 404, false)
})

app.get('/', (req, res) => {
  res.send({
    success: true,
    message: 'Backend is running'
  })
})

server.listen(APP_PORT, () => {
  console.log(`App is running on port ${APP_URL}`)
})
