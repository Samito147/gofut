// pages/api/db-test.js
import { createClient } from '@supabase/supabase-js'
export default async function handler(req, res) {
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  )
  const { data, error } = await supabase.from('users').select('id').limit(1)
  res.status(200).json({ data, error })
}
