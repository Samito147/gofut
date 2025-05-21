// IMPORTS
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcrypt'

// INICIA CLIENTE Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow','POST')
    return res.status(405).json({ error: 'Só POST permitido' })
  }
  const { username, email, phone, cpf, full_name, birth_date, password } = req.body
  // hash de senha
  const password_hash = await bcrypt.hash(password, 12)
  // grava no Supabase
  const { data, error } = await supabase
    .from('users')
    .insert([{ username,email,phone,cpf,full_name,birth_date,password_hash }])
  if (error) return res.status(400).json({ error: error.message })
  res.status(201).json({ user: data[0] })
}
