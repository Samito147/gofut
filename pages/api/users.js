import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { search } = req.query;

  try {
    let query = supabase
      .from('users')
      .select('id, username');

    if (search) {
      query = query.ilike('username', `%${search}%`);
    }

    const { data, error } = await query;

    if (error) throw error;
    return res.status(200).json(data);

  } catch (err) {
    console.error('❌ Erro ao buscar usuários:', err.message);
    return res.status(500).json({ error: 'Erro ao buscar usuários' });
  }
}
