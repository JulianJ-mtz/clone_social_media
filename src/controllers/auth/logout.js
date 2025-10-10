import { pool } from '../../db.js'
import crypto from 'crypto'

export async function logout (req, res) {
  try {
    const { refreshToken } = req.body

    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token is required' })
    }

    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex')

    const result = await pool.query(
      'UPDATE tokens SET revoked_at = NOW() WHERE token_hash = $1 AND revoked_at IS NULL RETURNING id',
      [tokenHash]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Token not found or already revoked' })
    }

    res.json({ message: 'Logged out successfully' })
  } catch (error) {
    console.error('Error during logout:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

// export async function logoutAll (req, res) {
//   try {
//     const userId = req.user.id

//     if (!userId) {
//       return res.status(400).json({ message: 'User ID is required' })
//     }

//     await pool.query(
//       'UPDATE tokens SET revoked_at = NOW() WHERE user_id = $1 AND revoked_at IS NULL',
//       [userId]
//     )

//     res.json({ message: 'Logged out from all devices successfully' })
//   } catch (error) {
//     console.error('Error during logout all:', error)
//     return res.status(500).json({ message: 'Internal server error' })
//   }
// }
