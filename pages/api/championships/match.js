import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const {
    championship_id,
    player1, player2,
    player1_score, player2_score,
    player1_corners, player2_corners,
    player1_yellow = 0, player2_yellow = 0,
    player1_red = 0, player2_red = 0,
    player1_possession = 0, player2_possession = 0,
    player1_kick_on_target = 0, player2_kick_on_target = 0,
    player1_team = '', player2_team = ''
  } = req.body;

  const p1 = parseInt(player1), p2 = parseInt(player2);

  if (!championship_id || !p1 || !p2) {
    return res.status(400).json({ error: 'Dados obrigatórios ausentes.' });
  }

  const played_at = new Date().toISOString();

  const { error: insertError } = await supabase.from('matches').insert([{
    player1: p1,
    player2: p2,
    player1_score,
    player2_score,
    player1_corners,
    player2_corners,
    player1_yellow,
    player2_yellow,
    player1_red,
    player2_red,
    player1_possession,
    player2_possession,
    player1_kick_on_target,
    player2_kick_on_target,
    player1_team,
    player2_team,
    played_at
  }]);

  if (insertError) {
    return res.status(500).json({ error: 'Erro ao inserir na tabela matches.', details: insertError.message });
  }

  let p1Points = 0, p2Points = 0;
  let p1Result = 'draw', p2Result = 'draw';

  if (player1_score > player2_score) {
    p1Points = 3; p1Result = 'win'; p2Result = 'loss';
  } else if (player2_score > player1_score) {
    p2Points = 3; p2Result = 'win'; p1Result = 'loss';
  } else {
    p1Points = p2Points = 1;
  }

  const atualizaJogador = async (id, pontos, vitoria, empate, derrota, saldo, escanteios, golsPro, golsContra, redCards) => {
    const { data: jogador, error } = await supabase
      .from('championship_players')
      .select('*')
      .eq('championship_id', championship_id)
      .eq('user_id', id)
      .single();

    if (error || !jogador) {
      return res.status(404).json({ error: `Jogador ${id} não inscrito no campeonato.` });
    }

    const update = {
      pontos: jogador.pontos + pontos,
      jogos: jogador.jogos + 1,
      vitorias: jogador.vitorias + vitoria,
      empates: jogador.empates + empate,
      derrotas: jogador.derrotas + derrota,
      saldo_gols: jogador.saldo_gols + saldo,
      escanteios: jogador.escanteios + escanteios,
      golspro: (jogador.golspro || 0) + golsPro,
      golscontra: (jogador.golscontra || 0) + golsContra,
      vermelhos: (jogador.vermelhos || 0) + redCards
    };

    await supabase.from('championship_players').update(update).eq('id', jogador.id);
  };

  await atualizaJogador(p1, p1Points, p1Result === 'win' ? 1 : 0, p1Result === 'draw' ? 1 : 0, p1Result === 'loss' ? 1 : 0, player1_score - player2_score, player1_corners, player1_score, player2_score, player1_red);
  await atualizaJogador(p2, p2Points, p2Result === 'win' ? 1 : 0, p2Result === 'draw' ? 1 : 0, p2Result === 'loss' ? 1 : 0, player2_score - player1_score, player2_corners, player2_score, player1_score, player2_red);

  const atualizaStatsGlobais = async (
    userId, score, conceded, corners, yellow, red, possession, shots
  ) => {
    const { data: stats } = await supabase.from('user_stats').select('*').eq('user_id', userId).single();

    const updatePayload = {
      played: (stats?.played || 0) + 1,
      goals: (stats?.goals || 0) + score,
      goals_for: (stats?.goals_for || 0) + score,
      goals_against: (stats?.goals_against || 0) + conceded,
      yellow: (stats?.yellow || 0) + yellow,
      yellow_cards: (stats?.yellow_cards || 0) + yellow,
      red: (stats?.red || 0) + red,
      red_cards: (stats?.red_cards || 0) + red,
      corners: (stats?.corners || 0) + corners,
      possession: (stats?.possession || 0) + possession,
      chutes: (stats?.chutes || 0) + shots,
      updated_at: new Date().toISOString(),
      wins: (stats?.wins || 0) + (score > conceded ? 1 : 0),
      draws: (stats?.draws || 0) + (score === conceded ? 1 : 0),
      losses: (stats?.losses || 0) + (score < conceded ? 1 : 0),
    };

    if (stats) {
      await supabase.from('user_stats').update(updatePayload).eq('user_id', userId);
    } else {
      await supabase.from('user_stats').insert({
        user_id: userId,
        ...updatePayload,
        elo: 1000,
        created_at: new Date().toISOString()
      });
    }
  };

  await atualizaStatsGlobais(p1, player1_score, player2_score, player1_corners, player1_yellow, player1_red, player1_possession, player1_kick_on_target);
  await atualizaStatsGlobais(p2, player2_score, player1_score, player2_corners, player2_yellow, player2_red, player2_possession, player2_kick_on_target);

  // ✅ Correção: atualizar saldo em user_wallet → balance_gp
  const atualizarCarteira = async (userId, resultado) => {
    const { data: carteira } = await supabase
      .from('user_wallet')
      .select('balance_gp')
      .eq('user_id', userId)
      .maybeSingle();

    let saldo = carteira?.balance_gp ?? 0;

    if (resultado === 'win') {
      saldo += 10;
    } else if (resultado === 'loss') {
      saldo = Math.max(0, saldo - 5);
    }

    if (carteira) {
      await supabase
        .from('user_wallet')
        .update({ balance_gp: saldo })
        .eq('user_id', userId);
    } else {
      await supabase
        .from('user_wallet')
        .insert({ user_id: userId, balance_gp: saldo });
    }
  };

  await atualizarCarteira(p1, p1Result);
  await atualizarCarteira(p2, p2Result);

  return res.status(200).json({ message: '✅ Partida registrada com sucesso!' });
}
