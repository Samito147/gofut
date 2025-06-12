// pages/api/login.js

import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { serialize } from 'cookie'

// Inicia cliente Supabase com a Service Key
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Só POST permitido' })
  }

  const { usernameOrEmail, password } = req.body
  if (!usernameOrEmail || !password) {
    return res.status(400).json({ error: 'Preencha todos os campos.' })
  }

  // 1️⃣ Busca usuário por username ou email, incluindo a role
  const { data, error } = await supabase
    .from('users')
    .select('id,password_hash,username,role')
    .or(`username.eq.${usernameOrEmail},email.eq.${usernameOrEmail}`)
    .single()

  if (error || !data) {
    return res.status(401).json({ error: 'Credenciais inválidas' })
  }

  // 2️⃣ Compara senha
  const match = await bcrypt.compare(password, data.password_hash)
  if (!match) {
    return res.status(401).json({ error: 'Credenciais inválidas' })
  }

  // 3️⃣ Busca a role mais atualizada do auth.users
  let finalRole = data.role
  try {
    const { data: sbUser, error: sbError } = await supabase.auth.admin.getUserById(data.id)
    if (!sbError && sbUser.user.raw_user_meta_data?.role) {
      finalRole = sbUser.user.raw_user_meta_data.role
    }
  } catch (e) {
    console.error('Erro ao buscar metadata de role:', e)
  }

  // 4️⃣ Sucesso — gera JWT incluindo a role e configura cookie HttpOnly
  const token = jwt.sign(
    {
      userId:   data.id,
      username: data.username,
      role:     finalRole    // <-- usa a role atualizada
    },
    process.env.JWT_SECRET,
    { expiresIn: '2h' }
  )

  res.setHeader('Set-Cookie', serialize('auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 2
  }))

  return res.status(200).json({ message: 'Logado!', userId: data.id })
}
