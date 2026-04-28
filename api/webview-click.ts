/**
 * Webview click tracking endpoint
 * Handles requests to /api/webviewClick to prevent timeout errors
 */

import { Request, Response } from 'express';

export default function handleWebviewClick(req: Request, res: Response): void {
  try {
    // Log the click event for debugging purposes
    console.log('Webview click received:', {
      timestamp: new Date().toISOString(),
      userAgent: req.headers['user-agent'],
      ip: req.ip || req.connection.remoteAddress,
      body: req.body,
      query: req.query,
    });

    // Return success response to prevent timeout
    res.status(200).json({
      success: true,
      message: 'Click tracked successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error handling webview click:', error);
    
    // Still return success to prevent client-side errors
    res.status(200).json({
      success: true,
      message: 'Click processed',
      timestamp: new Date().toISOString(),
    });
  }
}