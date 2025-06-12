import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const championshipId = '447273dd-3b26-4000-9d0a-124aae7ffc48';

  try {
    // 🔍 Buscar estatísticas dos jogadores inscritos no campeonato
    const { data: stats, error: statsError } = await supabase
      .from('championship_players')
      .select(`
        user_id,
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
      .eq('championship_id', championshipId);

    if (statsError) {
      console.error('Erro ao buscar stats:', statsError.message);
      return res.status(500).json({ error: 'Erro ao buscar jogadores' });
    }

    // 🔁 Buscar todos os nomes dos jogadores pelo ID
    const userIds = stats.map(item => item.user_id);
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, username')
      .in('id', userIds);

    if (usersError) {
      console.error('Erro ao buscar nomes dos usuários:', usersError.message);
      return res.status(500).json({ error: 'Erro ao buscar nomes' });
    }

    // 🧩 Mapear ID → Nome
    const userMap = {};
    users.forEach(u => {
      userMap[u.id] = u.username;
    });

    // 🧷 Montar array final com nomes + user_id + championship_id
    const jogadores = stats.map(item => ({
      user_id: item.user_id,
      championship_id: championshipId,
      nome: userMap[item.user_id] || 'Jogador',
      pontos: item.pontos ?? 0,
      jogos: item.jogos ?? 0,
      vitorias: item.vitorias ?? 0,
      empates: item.empates ?? 0,
      derrotas: item.derrotas ?? 0,
      golsPro: item.golspro ?? 0,
      golsContra: item.golscontra ?? 0,
      saldoGols: item.saldo_gols ?? 0,
      vermelhos: item.vermelhos ?? 0
    }));

    return res.status(200).json({ jogadores });

  } catch (err) {
    console.error('Erro inesperado:', err.message);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}
