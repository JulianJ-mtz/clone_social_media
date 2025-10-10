import { Router } from 'express'
import {
  getUsers,
  getUserById,
  createUser,
  updateUserProfilePicture
} from '../controllers/user.controllers.js'
import { uploadToS3 } from '../middleware/upload.js'
import { authenticate } from '../controllers/auth/auth.js'

const router = Router()

// Public registration endpoint
router.post('/users', uploadToS3('profilePicture', false), createUser)

// Protected user endpoints
router.get('/users', authenticate, getUsers)
router.get('/users/:id', authenticate, getUserById)

router.post(
  '/users/:id/profile-picture',
  authenticate,
  uploadToS3('profilePicture'),
  updateUserProfilePicture
)

export default router
