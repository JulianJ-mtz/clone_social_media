import { pool } from '../../db.js'
import { getSignedFileUrl } from '../../utils/s3.js'

export async function me (req, res) {
  try {
    const userId = req.user.id

    const result = await pool.query(
      'SELECT id, name, email, profile_picture_url, created_at, updated_at FROM users WHERE id = $1',
      [userId]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' })
    }

    const user = result.rows[0]

    if (user.profile_picture_url) {
      try {
        user.profile_picture_url = await getSignedFileUrl(user.profile_picture_url)
      } catch (error) {
        console.error('Error generating signed URL:', error)
      }
    }

    res.json(user)
  } catch (error) {
    console.error('Error fetching current user:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}
