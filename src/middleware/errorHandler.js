/**
 * Global error handler middleware
 * Catches any errors that weren't handled by route handlers
 */
export function errorHandler (err, req, res, next) {
  console.error('Unhandled error:', err)

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ message: 'Invalid token' })
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ message: 'Token expired' })
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: err.message })
  }

  // Database errors
  if (err.code === '23505') {
    return res.status(409).json({ message: 'Duplicate entry' })
  }

  if (err.code === '23503') {
    return res.status(400).json({ message: 'Referenced resource does not exist' })
  }

  // Default error
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error'
  })
}

export function notFoundHandler (req, res) {
  res.status(404).json({ message: 'Route not found' })
}
