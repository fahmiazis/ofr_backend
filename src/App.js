const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const response = require('./helpers/response')
const morgan = require('morgan')

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
const financeRoute = require('./routes/finance')
const reservoirRoute = require('./routes/reservoir')
// transaksi
const klaimRoute = require('./routes/klaim')
const opsRoute = require('./routes/operasional')
const ikkRoute = require('./routes/ikk')

// redpine
const redpineRoute = require('./routes/redpine')

// show document
const showRoute = require('./routes/show')

const authMiddleware = require('./middlewares/auth')

app.use('/uploads', express.static('assets/documents'))
app.use('/masters', express.static('assets/masters'))
app.use('/download', express.static('assets/exports'))

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
app.use('/finance', authMiddleware, financeRoute)
app.use('/reservoir', authMiddleware, reservoirRoute)
// transaksi
app.use('/klaim', authMiddleware, klaimRoute)
app.use('/ops', authMiddleware, opsRoute)
app.use('/ikk', authMiddleware, ikkRoute)

// redpine
app.use('/redpine', redpineRoute)

// show document
app.use('/show', showRoute)

// zarchive
app.use('/zip', zarRoute)

app.get('*', (req, res) => {
  response(res, 'Error route not found', {}, 404, false)
})

server.listen(APP_PORT, () => {
  console.log(`App is running on port ${APP_URL}`)
})
