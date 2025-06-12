// pages/api/campeonatos/lista.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Método não permitido' });

  const { data, error } = await supabase
    .from('championships')
    .select('id, title')
    .eq('ativo', true);

  if (error) return res.status(500).json({ error: error.message });

  return res.status(200).json(data);
}
