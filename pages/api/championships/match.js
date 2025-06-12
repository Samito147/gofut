import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  // 🔍 Dados recebidos
  console.log('📨 Dados recebidos:', req.body);

  // ✅ Desestruturação com fallback
  let {
    championship_id,
    player1, player2,
    player1_score, player2_score,
    player1_corners, player2_corners,
    player1_yellow = 0, player2_yellow = 0,
    player1_red = 0, player2_red = 0,
    player1_possession = null,
    player2_possession = null,
    player1_kick_on_target = null,
    player2_kick_on_target = null,
    player1_team = '',
    player2_team = ''
  } = req.body;

  // ✅ Converte os IDs para inteiros
  player1 = parseInt(player1);
  player2 = parseInt(player2);

  if (!championship_id || !player1 || !player2) {
    return res.status(400).json({ error: 'Dados obrigatórios ausentes.' });
  }

  // ➕ Inserção na tabela MATCHES
  const { error: insertError } = await supabase.from('matches').insert([{
    player1,
    player2,
    player1_score,
    player2_score,
    player1_corners,
    player2_corners,
    player1_red,
    player2_red,
    player1_yellow,
    player2_yellow,
    player1_possession,
    player2_possession,
    player1_kick_on_target,
    player2_kick_on_target,
    player1_team,
    player2_team,
    played_at: new Date().toISOString()
  }]);

  if (insertError) {
    console.error('❌ Erro ao inserir partida:', insertError);
    return res.status(500).json({ error: 'Erro ao registrar partida.', details: insertError.message });
  }

  // 📊 Lógica de pontuação
  let p1Points = 0, p2Points = 0;
  let p1Result = 'draw', p2Result = 'draw';

  if (player1_score > player2_score) {
    p1Points = 3; p1Result = 'win'; p2Result = 'loss';
  } else if (player2_score > player1_score) {
    p2Points = 3; p1Result = 'loss'; p2Result = 'win';
  } else {
    p1Points = p2Points = 1;
  }

  // 🔄 Atualização de estatísticas
  const atualizaJogador = async (
    playerId, pontos, vitoria, empate, derrota,
    saldo, escanteios, golsPro, golsContra
  ) => {
    console.log(`🔍 Buscando jogador ${playerId} no campeonato ${championship_id}...`);

    const { data: existente, error } = await supabase
      .from('championship_players')
      .select('*')
      .eq('championship_id', championship_id)
      .eq('user_id', playerId)
      .single();

    if (error || !existente) {
      console.warn(`⚠️ Jogador ${playerId} não encontrado no campeonato ${championship_id}`, error?.message);
      return res.status(404).json({ error: `Jogador ${playerId} não está inscrito no campeonato.` });
    }

    const { error: updateError } = await supabase
      .from('championship_players')
      .update({
        pontos: existente.pontos + pontos,
        jogos: existente.jogos + 1,
        vitorias: existente.vitorias + vitoria,
        empates: existente.empates + empate,
        derrotas: existente.derrotas + derrota,
        saldo_gols: existente.saldo_gols + saldo,
        escanteios: existente.escanteios + escanteios,
        golspro: (existente.golspro || 0) + golsPro,
        golscontra: (existente.golscontra || 0) + golsContra
      })
      .eq('id', existente.id);

    if (updateError) {
      console.error(`❌ Erro ao atualizar jogador ${playerId}:`, updateError);
    } else {
      console.log(`✅ Estatísticas atualizadas para jogador ${playerId}`);
    }
  };

  await atualizaJogador(
    player1,
    p1Points,
    p1Result === 'win' ? 1 : 0,
    p1Result === 'draw' ? 1 : 0,
    p1Result === 'loss' ? 1 : 0,
    player1_score - player2_score,
    player1_corners || 0,
    player1_score,
    player2_score
  );

  await atualizaJogador(
    player2,
    p2Points,
    p2Result === 'win' ? 1 : 0,
    p2Result === 'draw' ? 1 : 0,
    p2Result === 'loss' ? 1 : 0,
    player2_score - player1_score,
    player2_corners || 0,
    player2_score,
    player1_score
  );

  return res.status(200).json({ message: '✅ Partida registrada com sucesso no campeonato!' });
}
