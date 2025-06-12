// pages/api/logout.js
import { serialize } from 'cookie'

export default function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).end()
  }

  // Invalida o cookie expirando imediatamente
  res.setHeader('Set-Cookie', serialize('auth_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    expires: new Date(0),   // <— força expiração imediata
    maxAge: 0
  }))

  return res.status(200).json({ success: true })
}
