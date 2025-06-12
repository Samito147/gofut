import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const userId = req.query.user_id;
  const championshipId = req.query.championship_id;

  if (!userId || !championshipId) {
    return res.status(400).json({ error: 'Parâmetros user_id e championship_id obrigatórios' });
  }

  try {
    // 🔍 Buscar os dados do jogador na tabela championship_players
    const { data, error } = await supabase
      .from('championship_players')
      .select(`
        pontos,
        jogos,
        vitorias,
        empates,
        derrotas,
        saldo_gols,
        escanteios,
        golspro,
        golscontra,
        vermelhos
      `)
      .eq('user_id', userId)
      .eq('championship_id', championshipId)
      .single();

    if (error || !data) {
      console.error(`Jogador não encontrado na championship_players para user_id=${userId}, championship_id=${championshipId}`);
      return res.status(404).json({ error: 'Dados do jogador não encontrados no campeonato' });
    }

    // ✅ Retornar os dados esperados para o cards.js
    return res.status(200).json({
      pontos: data.pontos ?? 0,
      jogos: data.jogos ?? 0,
      vitorias: data.vitorias ?? 0,
      empates: data.empates ?? 0,
      derrotas: data.derrotas ?? 0,
      saldo_gols: data.saldo_gols ?? 0,
      escanteios: data.escanteios ?? 0,
      golspro: data.golspro ?? 0,
      golscontra: data.golscontra ?? 0,
      vermelhos: data.vermelhos ?? 0
    });

  } catch (err) {
    console.error('Erro inesperado na rota /api/championships/player-stats:', err.message);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}
