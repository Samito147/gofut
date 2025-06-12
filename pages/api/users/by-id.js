import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const userId = req.query.id;

  if (!userId) {
    return res.status(400).json({ error: 'Parâmetro id obrigatório' });
  }

  try {
    const { data, error } = await supabase
      .from('users')
      .select('username')
      .eq('id', userId)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    return res.status(200).json({ username: data.username });

  } catch (err) {
    console.error('Erro inesperado:', err.message);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}
