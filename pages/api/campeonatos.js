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
    // 🔄 Buscar campeonatos ativos + campos adicionais (agora com campo "cor")
    const { data: campeonatos, error } = await supabase
      .from('championships')
      .select(`
        id,
        title,
        min_elo,
        max_elo,
		max_players,
        ativo,
        inscricao,
        premio,
        inicio,
        cor
      `)
      .eq('ativo', true);

    if (error || !campeonatos) {
      console.error('Erro ao buscar campeonatos:', error?.message || 'Resposta nula');
      return res.status(500).json({ error: 'Erro ao buscar campeonatos' });
    }

    // 🔁 Buscar jogadores por campeonato (campeonato.id → jogadores[])
    const campeonatosComJogadores = await Promise.all(
      campeonatos.map(async (camp) => {
        const { data: jogadores, error: errJogadores } = await supabase
          .from('championship_players')
          .select('user_id')
          .eq('championship_id', camp.id);

        if (errJogadores || !jogadores) {
          console.error(`Erro ao buscar jogadores do campeonato ${camp.id}:`, errJogadores?.message || 'Resposta nula');
          return { ...camp, jogadores: [] };
        }

        const jogadoresIds = jogadores.map(j => j.user_id);

        return {
          ...camp,
          jogadores: jogadoresIds
        };
      })
    );

    console.log("Campeonatos encontrados:", campeonatosComJogadores);

    return res.status(200).json(campeonatosComJogadores);

  } catch (err) {
    console.error('Erro inesperado:', err.message);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}
