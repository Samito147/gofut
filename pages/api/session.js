// pages/api/session.js

import { parse } from 'cookie'
import { verify } from 'jsonwebtoken'
import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  // Só GET permitido
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Só GET permitido' })
  }

  // Lê o cookie 'auth_token'
  const cookies = parse(req.headers.cookie || '')
  const token = cookies.auth_token

  // Se não houver token, retorna deslogado
  if (!token) {
    return res.status(200).json({ isLoggedIn: false })
  }

  try {
    // 1️⃣ Verifica e decodifica o JWT
    const payload = verify(token, process.env.JWT_SECRET)
    // payload.userId, payload.username e payload.role estão disponíveis

    // 2️⃣ Monta e retorna a resposta usando o role vindo do token
    return res.status(200).json({
      isLoggedIn: true,
      user: {
        id:       payload.userId,
        username: payload.username,
        role:     payload.role || null
      }
    })

  } catch (err) {
    return res.status(200).json({ isLoggedIn: false })
  }
}
