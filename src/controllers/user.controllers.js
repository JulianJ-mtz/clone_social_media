import { pool } from '../db.js'
import { v4 as uuidv4 } from 'uuid'
import { uploadFile, getSignedFileUrl } from '../utils/s3.js'
import bcrypt from 'bcrypt'
import { config } from '../config.js'

export const getUsers = async (req, res) => {
  try {
    const response = await pool.query('SELECT id, name, email, profile_picture_url, created_at, updated_at FROM users')

    const usersWithSignedUrls = await Promise.all(
      response.rows.map(async (user) => {
        if (user.profile_picture_url) {
          try {
            const signedUrl = await getSignedFileUrl(user.profile_picture_url)
            return { ...user, profile_picture_url: signedUrl }
          } catch (error) {
            console.error('Error generating signed URL for user:', user.id, error)
            return user
          }
        }
        return user
      })
    )

    res.json(usersWithSignedUrls)
  } catch (error) {
    console.error('Error fetching users:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params
    const response = await pool.query(
      'SELECT id, name, email, profile_picture_url, created_at, updated_at FROM users WHERE id = $1',
      [id]
    )

    if (response?.rows?.length === 0) {
      return res.status(404).json({ message: 'User not found' })
    }

    const user = response.rows[0]

    if (user.profile_picture_url) {
      try {
        user.profile_picture_url = await getSignedFileUrl(user.profile_picture_url)
      } catch (error) {
        console.error('Error generating signed URL:', error)
      }
    }

    res.json(user)
  } catch (error) {
    console.error('Error fetching user by ID:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

export const createUser = async (req, res) => {
  try {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' })
    }

    const passwordHash = await bcrypt.hash(password, config.SALT_ROUNDS)

    let profilePictureUrl = null
    if (req.file) {
      const fileExt = req.file.originalname.split('.').pop()
      const fileName = `profile-pictures/${uuidv4()}.${fileExt}`

      await uploadFile(req.file.buffer, fileName, req.file.mimetype)
      profilePictureUrl = fileName
    }

    const response = await pool.query(
      'INSERT INTO users (name, email, password_hash, profile_picture_url) VALUES ($1, $2, $3, $4) RETURNING id, name, email, profile_picture_url, created_at, updated_at',
      [name, email, passwordHash, profilePictureUrl]
    )

    const user = response.rows[0]

    if (user.profile_picture_url) {
      user.profile_picture_url = await getSignedFileUrl(user.profile_picture_url)
    }

    res.status(201).json(user)
  } catch (error) {
    console.error('Error creating user:', error)
    if (error.code === '23505') {
      return res.status(409).json({ message: 'Email already exists' })
    }
    return res.status(500).json({ message: 'Internal server error' })
  }
}

export const updateUserProfilePicture = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' })
  }

  const { id } = req.params
  const file = req.file

  try {
    const fileExt = file.originalname.split('.').pop()
    const fileName = `profile-pictures/${uuidv4()}.${fileExt}`

    await uploadFile(file.buffer, fileName, file.mimetype)

    const updateResponse = await pool.query(
      'UPDATE users SET profile_picture_url = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [fileName, id]
    )

    if (updateResponse.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' })
    }

    const signedUrl = await getSignedFileUrl(fileName)

    res.json({
      ...updateResponse.rows[0],
      profile_picture_url: signedUrl
    })
  } catch (error) {
    console.error('Error updating profile picture:', error)
    return res.status(500).json({ message: 'Error updating profile picture' })
  }
}
