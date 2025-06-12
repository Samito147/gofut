import { createClient } from '@supabase/supabase-js'
import { getSession } from '../../lib/session'  // seu helper de session

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const session = await getSession(req) 
  if (!session?.user?.id) return res.status(401).json({ error: 'Não autenticado' })

  const { championship_id } = req.body
  const user_id = session.user.id

  // Insere com estatísticas zeradas
  const { error } = await supabase
    .from('championship_registrations')
    .insert([{ championship_id, user_id }])

  if (error) {
    // se já inscrito, ignorar ou informar
    return res.status(400).json({ error: error.message })
  }
  res.status(201).json({ success: true })
}
