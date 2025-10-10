import jwt from 'jsonwebtoken'

const isDevelopment = process.env.NODE_ENV !== 'production'

function sign (payload, isAccessToken) {
  const accessTokenExpiry = isDevelopment ? '30d' : '15m'
  const refreshTokenExpiry = isDevelopment ? '90d' : '7d'

  return jwt.sign(
    payload,
    isAccessToken
      ? process.env.JWT_SECRET
      : process.env.JWT_REFRESH_SECRET,
    {
      algorithm: 'HS256',
      expiresIn: isAccessToken ? accessTokenExpiry : refreshTokenExpiry
    }
  )
}

export function generateAccessToken (user) {
  return sign({ user }, true)
}

export function generateRefreshToken (user) {
  return sign({ user }, false)
}
