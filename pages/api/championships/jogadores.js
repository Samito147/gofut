// pages/api/championships/jogadores.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { id: championship_id } = req.query;

  if (!championship_id) {
    return res.status(400).json({ error: 'ID do campeonato é obrigatório' });
  }

  try {
    const { data, error } = await supabase
      .from('championship_players')
      .select('user_id, user:users!championship_players_user_id_fkey(username)')
      .eq('championship_id', championship_id);

    if (error) throw error;

    const jogadores = data.map(item => ({
      user_id: item.user_id,
      username: item.user?.username || 'Desconhecido'
    }));

    return res.status(200).json(jogadores);
  } catch (err) {
    console.error('❌ Erro ao buscar jogadores:', err.message);
    return res.status(500).json({ error: 'Erro interno ao buscar jogadores' });
  }
}
