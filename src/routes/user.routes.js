import { Router } from 'express'
import {
  getUsers,
  getUserById,
  createUser,
  updateUserProfilePicture
} from '../controllers/user.controllers.js'
import { uploadToS3 } from '../middleware/upload.js'

const router = Router()

router.get('/users', getUsers)
router.get('/users/:id', getUserById)

router.post('/users', uploadToS3('profilePicture', false), createUser)

router.post(
  '/users/:id/profile-picture',
  uploadToS3('profilePicture'),
  updateUserProfilePicture
)

export default router
