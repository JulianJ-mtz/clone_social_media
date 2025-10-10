import { pool } from '../db.js'

/**
 * Deletes expired and revoked tokens from the database
 * This should be run periodically (e.g., via cron job)
 */
export async function cleanupExpiredTokens () {
  try {
    const result = await pool.query(
      'DELETE FROM tokens WHERE expires_at < NOW() OR revoked_at < NOW() - INTERVAL \'30 days\''
    )
    console.log(`Cleaned up ${result.rowCount} expired/revoked tokens`)
    return result.rowCount
  } catch (error) {
    console.error('Error cleaning up tokens:', error)
    throw error
  }
}

/**
 * Revokes all tokens for a specific user
 * Useful for security purposes (e.g., password reset, account compromise)
 */
export async function revokeAllUserTokens (userId) {
  try {
    const result = await pool.query(
      'UPDATE tokens SET revoked_at = NOW() WHERE user_id = $1 AND revoked_at IS NULL',
      [userId]
    )
    return result.rowCount
  } catch (error) {
    console.error('Error revoking user tokens:', error)
    throw error
  }
}
