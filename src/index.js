import e from 'express'
import { config } from './config.js'
import authRoutes from './routes/auth.routes.js'
import userRoutes from './routes/user.routes.js'
import morgan from 'morgan'
import { cleanupExpiredTokens } from './utils/cleanupTokens.js'
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js'
import cors from 'cors'

const app = e()
const PORT = config.PORT

app.use(e.json())
app.use(morgan('dev'))
app.use(cors())

// Public routes
app.use(authRoutes)

// Protected routes
app.use(userRoutes)

// Error handlers (must be last)
app.use(notFoundHandler)
app.use(errorHandler)

// Start server
app.listen(PORT)
console.log(`Server listening on http://localhost:${PORT}`)

// Run token cleanup on startup
cleanupExpiredTokens().catch(console.error)

// Schedule token cleanup every 24 hours
setInterval(async () => {
  try {
    await cleanupExpiredTokens()
  } catch (error) {
    console.error('Scheduled token cleanup failed:', error)
  }
}, 24 * 60 * 60 * 1000)
