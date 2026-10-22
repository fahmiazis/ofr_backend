// routes/auth.js
const router = require('express').Router()
const auth = require('../controllers/auth')
const authMiddleware = require('../middlewares/auth')

router.post('/login', auth.login)
router.post('/refresh', auth.refreshToken)
router.post('/logout', auth.logout)
router.post('/logout-all', authMiddleware, auth.logoutAll)
router.post('/switch-area', authMiddleware, auth.switchArea)

module.exports = router
