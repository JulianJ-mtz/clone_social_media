import bcrypt from 'bcrypt'
import { pool } from '../../db.js'
import { generateAccessToken, generateRefreshToken } from './generateToken.js'
import crypto from 'crypto'

export async function login (req, res) {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }

    const result = await pool.query(
      'SELECT id, name, email, password_hash FROM users WHERE email = $1',
      [email]
    )

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    const user = result.rows[0]

    const isValidPassword = await bcrypt.compare(password, user.password_hash)

    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    delete user.password_hash

    const accessToken = generateAccessToken(user)
    const refreshToken = generateRefreshToken(user)
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex')

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    await pool.query(
      'INSERT INTO tokens (user_id, token_hash, token_type, expires_at) VALUES ($1, $2, $3, $4)',
      [user.id, tokenHash, 'refresh', expiresAt]
    )

    res.json({
      user,
      accessToken,
      refreshToken
    })
  } catch (error) {
    console.error('Error during login:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}
