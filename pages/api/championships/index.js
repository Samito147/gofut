import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()

  const { data, error } = await supabase
    .from('championships')
    .select('id, name, season, created_at')
    .order('created_at', { ascending: true })

  if (error) return res.status(500).json({ error: error.message })
  res.status(200).json({ championships: data })
}
