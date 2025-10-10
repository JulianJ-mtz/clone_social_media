import { Router } from 'express'
import { login } from '../controllers/auth/login.js'
import { refresh } from '../controllers/auth/refresh.js'
import { logout, logoutAll } from '../controllers/auth/logout.js'

import { authenticate } from '../controllers/auth/auth.js'

const router = Router()

router.post('/auth/login', login)
router.post('/auth/refresh', refresh)
router.post('/auth/logout', logout)
router.post('/auth/logout-all', authenticate, logoutAll)

export default router
