import { Request, Response } from 'express';
import fetch from 'node-fetch';

export default async function handler(req: Request, res: Response) {
  const { phone, otp } = req.body;

  try {
    const response = await fetch('https://textbelt.com/text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone,
        message: `Your Upendo verification code is: ${otp}`,
        key: 'textbelt', // Use the free tier
      }),
    });

    const data = await response.json();

    if (data.success) {
      res.status(200).json({ success: true });
    } else {
      res.status(500).json({ success: false, error: data.error });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}
