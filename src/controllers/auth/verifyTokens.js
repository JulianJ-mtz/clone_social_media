import jwt from 'jsonwebtoken'

function verifyAccessToken (token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET)
  } catch (error) {
    return null
  }
}

function verifyRefreshToken (token) {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET)
  } catch (error) {
    return null
  }
}

export { verifyAccessToken, verifyRefreshToken }
