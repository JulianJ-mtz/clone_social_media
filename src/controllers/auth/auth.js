import { getToken } from './getToken.js'
import { verifyAccessToken } from './verifyTokens.js'

export function authenticate (req, res, next) {
  const token = getToken(req.headers)

  if (token) {
    const decoded = verifyAccessToken(token)

    if (decoded) {
      req.user = { ...decoded.user }
      next()
    } else {
      res.status(401).json({ message: 'Invalid or expired token' })
    }
  } else {
    res.status(401).json({ message: 'No token provided' })
  }
}
