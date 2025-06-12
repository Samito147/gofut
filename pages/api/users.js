// pages/api/users.js
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

export default async function handler(req, res) {
  const { search } = req.query

  if (!search)
    return res.status(400).json({ error: 'Parâmetro de busca ausente' })

  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, username')
      .ilike('username', `%${search}%`) // 🔍 busca parcial e case-insensitive

    if (error) throw error

    return res.status(200).json(data)
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao buscar usuários' })
  }
}
