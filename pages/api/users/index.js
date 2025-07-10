import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, username')
      .order('username', { ascending: true }); // opcional: ordenar alfabeticamente

    if (error) {
      console.error('❌ Erro ao buscar jogadores:', error.message);
      return res.status(500).json({ error: 'Erro ao buscar jogadores' });
    }

    return res.status(200).json(data); // <- importante retornar ARRAY aqui

  } catch (err) {
    console.error('❌ Erro inesperado:', err.message);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}
