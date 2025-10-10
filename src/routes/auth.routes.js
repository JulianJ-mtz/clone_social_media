import { Router } from 'express'
import { login } from '../controllers/auth/login.js'
import { refresh } from '../controllers/auth/refresh.js'
import { logout } from '../controllers/auth/logout.js'
// import { me } from '../controllers/auth/me.js'
import { authenticate } from '../controllers/auth/auth.js'

const router = Router()

router.post('/auth/login', login)
router.post('/auth/refresh', refresh)
router.post('/auth/logout', logout)
router.post('/auth/logout-all', authenticate)
// router.get('/auth/me', authenticate, me)

export default router
