/**
 * This is a API server
 */

import express, {
  type Request,
  type Response,
  type NextFunction,
} from 'express'
import cors from 'cors'
import path from 'path'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import authRoutes from './routes/auth.js'

// for esm mode
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// load env
dotenv.config()

const app: express.Application = express()

app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

/**
 * API Routes
 */
app.use('/api/auth', authRoutes)

/**
 * Webview click tracking endpoint
 * Handles requests to prevent timeout errors
 */
app.post('/api/webviewClick', (req: Request, res: Response) => {
  try {
    // Log the click event for debugging purposes
    console.log('Webview click received:', {
      timestamp: new Date().toISOString(),
      userAgent: req.headers['user-agent'],
      ip: req.ip || req.connection.remoteAddress,
      body: req.body,
      query: req.query,
    })

    // Return success response to prevent timeout
    res.status(200).json({
      success: true,
      message: 'Click tracked successfully',
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error handling webview click:', error)
    
    // Still return success to prevent client-side errors
    res.status(200).json({
      success: true,
      message: 'Click processed',
      timestamp: new Date().toISOString(),
    })
  }
})

/**
 * health
 */
app.use(
  '/api/health',
  (req: Request, res: Response, next: NextFunction): void => {
    res.status(200).json({
      success: true,
      message: 'ok',
    })
  },
)

/**
 * error handler middleware
 */
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  res.status(500).json({
    success: false,
    error: 'Server internal error',
  })
})

/**
 * 404 handler
 */
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'API not found',
  })
})

export default app
