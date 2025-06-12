// pages/api/signup.js

import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcrypt'

// 📣 DEBUG: exibe variáveis de ambiente ao iniciar a rota
console.log('ENV → SUPABASE_URL:', process.env.SUPABASE_URL)
console.log('ENV → SERVICE_KEY length:', process.env.SUPABASE_SERVICE_KEY?.length)

// 🔑 Cliente Supabase com SERVICE_ROLE_KEY para operações de Admin
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

export default async function handler(req, res) {
  console.log('→ POST /api/signup')
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Só POST permitido' })
  }

  const { username, email, phone, cpf, full_name, birth_date, password } = req.body

  // 1️⃣ Verifica username
  const { data: userByName, error: errName } = await supabase
    .from('users')
    .select('id')
    .eq('username', username)
    .maybeSingle()
  if (errName) {
    console.error(errName)
    return res.status(500).json({ error: 'Erro ao verificar nome de usuário' })
  }
  if (userByName) {
    return res.status(400).json({ error: 'Nome de usuário já está em uso.' })
  }

  // 2️⃣ Verifica CPF
  const { data: userByCpf, error: errCpf } = await supabase
    .from('users')
    .select('id')
    .eq('cpf', cpf)
    .maybeSingle()
  if (errCpf) {
    console.error(errCpf)
    return res.status(500).json({ error: 'Erro ao verificar CPF' })
  }
  if (userByCpf) {
    return res.status(400).json({ error: 'Já existe cadastro com este CPF.' })
  }

  // 3️⃣ Hash da senha
  const password_hash = await bcrypt.hash(password, 12)

  // 4️⃣ Cria usuário no Auth do Supabase (Admin API)
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { 
      username, 
      phone, 
      cpf, 
      full_name, 
      birth_date, 
      password_hash 
    }
  })
  console.log('Auth.createUser →', authError, authData)
  if (authError) {
    return res.status(400).json({ error: authError.message })
  }

  const authUser = authData.user
  if (!authUser?.id) {
    console.error('Auth retornou sem usuário válido:', authData)
    return res.status(500).json({ error: 'Falha ao criar usuário no Auth.' })
  }

  // ▶️ O trigger `sync_auth_user_trigger` no banco
  //    cuidará de inserir em public.users e public.user_stats.

  // ✔️ Sucesso: retorna o usuário criado no Auth
  return res.status(201).json({ user: authUser })
}
