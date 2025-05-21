import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcrypt'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow','POST')
    return res.status(405).json({ error: 'Só POST permitido' })
  }
  const { usernameOrEmail, password } = req.body
  const { data, error } = await supabase
    .from('users')
    .select('id,password_hash')
    .or(`username.eq.${usernameOrEmail},email.eq.${usernameOrEmail}`)
    .single()
  if (error || !data) return res.status(401).json({ error: 'Credenciais inválidas' })
  const match = await bcrypt.compare(password, data.password_hash)
  if (!match) return res.status(401).json({ error: 'Credenciais inválidas' })
  // aqui você pode gerar um JWT ou session cookie
  res.json({ message: 'Logado!', userId: data.id })
}
