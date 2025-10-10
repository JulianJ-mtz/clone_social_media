import { pool } from '../../db.js'
import { verifyRefreshToken } from './verifyTokens.js'
import { generateAccessToken, generateRefreshToken } from './generateToken.js'
import crypto from 'crypto'

export async function refresh (req, res) {
  try {
    const { refreshToken } = req.body

    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token is required' })
    }

    const decoded = verifyRefreshToken(refreshToken)

    if (!decoded) {
      return res.status(401).json({ message: 'Invalid or expired refresh token' })
    }

    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex')

    const tokenResult = await pool.query(
      'SELECT id, user_id, expires_at, revoked_at FROM tokens WHERE token_hash = $1',
      [tokenHash]
    )

    if (tokenResult.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid refresh token' })
    }

    const tokenRecord = tokenResult.rows[0]

    if (tokenRecord.revoked_at) {
      return res.status(401).json({ message: 'Refresh token has been revoked' })
    }

    if (new Date(tokenRecord.expires_at) < new Date()) {
      return res.status(401).json({ message: 'Refresh token has expired' })
    }

    const userResult = await pool.query(
      'SELECT id, name, email FROM users WHERE id = $1',
      [tokenRecord.user_id]
    )

    if (userResult.rows.length === 0) {
      return res.status(401).json({ message: 'User not found' })
    }

    const user = userResult.rows[0]

    const newAccessToken = generateAccessToken(user)
    const newRefreshToken = generateRefreshToken(user)
    const newTokenHash = crypto.createHash('sha256').update(newRefreshToken).digest('hex')
    await pool.query('BEGIN')

    try {
      await pool.query(
        'UPDATE tokens SET revoked_at = NOW() WHERE id = $1',
        [tokenRecord.id]
      )

      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      await pool.query(
        'INSERT INTO tokens (user_id, token_hash, token_type, expires_at) VALUES ($1, $2, $3, $4)',
        [user.id, newTokenHash, 'refresh', expiresAt]
      )

      await pool.query('COMMIT')
    } catch (error) {
      await pool.query('ROLLBACK')
      throw error
    }

    res.json({
      user,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    })
  } catch (error) {
    console.error('Error refreshing token:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}
