import { createClient } from '@supabase/supabase-js'
import { calculateElo } from '../../utils/elo.js'

// 🔐 Conexão segura com Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  const {
    player1: player1Id,
    player2: player2Id,
    player1Score, player2Score,
    player1Corners, player2Corners,
    player1Yellow, player2Yellow,
    player1Red, player2Red,
    player1_possession,
    player2_possession,
    player1_kick_on_target,
    player2_kick_on_target,
    player1_team,
    player2_team
  } = req.body

  if (!Number.isInteger(player1Id) || !Number.isInteger(player2Id)) {
    return res.status(400).json({ error: 'IDs dos jogadores inválidos ou ausentes' })
  }

  // 🔍 Estatísticas do jogador 1
  let { data: stats1, error: error1 } = await supabase
    .from('user_stats')
    .select('*')
    .eq('user_id', player1Id)
    .single()

  if (error1 || !stats1) {
    console.warn(`📥 Criando estatísticas para player1 ID ${player1Id}`)
    const { error: insertErr1 } = await supabase.from('user_stats').insert({
      user_id: player1Id,
      elo: 1000, wins: 0, draws: 0, losses: 0,
      goals_for: 0, goals_against: 0, corners: 0,
      yellow_cards: 0, red_cards: 0
    })
    if (insertErr1) {
      console.error('❌ Erro ao criar stats1:', insertErr1)
      return res.status(500).json({ error: 'Erro ao criar estatísticas iniciais do Jogador 1' })
    }
    stats1 = {
      elo: 1000, wins: 0, draws: 0, losses: 0,
      goals_for: 0, goals_against: 0, corners: 0,
      yellow_cards: 0, red_cards: 0
    }
  }

  // 🔍 Estatísticas do jogador 2
  let { data: stats2, error: error2 } = await supabase
    .from('user_stats')
    .select('*')
    .eq('user_id', player2Id)
    .single()

  if (error2 || !stats2) {
    console.warn(`📥 Criando estatísticas para player2 ID ${player2Id}`)
    const { error: insertErr2 } = await supabase.from('user_stats').insert({
      user_id: player2Id,
      elo: 1000, wins: 0, draws: 0, losses: 0,
      goals_for: 0, goals_against: 0, corners: 0,
      yellow_cards: 0, red_cards: 0
    })
    if (insertErr2) {
      console.error('❌ Erro ao criar stats2:', insertErr2)
      return res.status(500).json({ error: 'Erro ao criar estatísticas iniciais do Jogador 2' })
    }
    stats2 = {
      elo: 1000, wins: 0, draws: 0, losses: 0,
      goals_for: 0, goals_against: 0, corners: 0,
      yellow_cards: 0, red_cards: 0
    }
  }

  // 📈 Cálculo do ELO
  const result = calculateElo({
    player1Elo: stats1.elo,
    player2Elo: stats2.elo,
    player1Score, player2Score,
    player1Corners, player2Corners,
    player1Yellow, player2Yellow,
    player1Red, player2Red
  })

  const result1 = player1Score > player2Score ? 'win' :
                  player1Score < player2Score ? 'loss' : 'draw'
  const result2 = result1 === 'win' ? 'loss' : result1 === 'loss' ? 'win' : 'draw'

  // 🔄 Atualiza stats jogador 1
  const { error: updateErr1 } = await supabase.from('user_stats').update({
    elo: result.player1EloNew,
    wins: stats1.wins + (result1 === 'win' ? 1 : 0),
    draws: stats1.draws + (result1 === 'draw' ? 1 : 0),
    losses: stats1.losses + (result1 === 'loss' ? 1 : 0),
    goals_for: stats1.goals_for + player1Score,
    goals_against: stats1.goals_against + player2Score,
    corners: stats1.corners + player1Corners,
    yellow_cards: stats1.yellow_cards + player1Yellow,
    red_cards: stats1.red_cards + player1Red
  }).eq('user_id', player1Id)

  if (updateErr1) {
    console.error('❌ Erro ao atualizar stats1:', updateErr1)
    return res.status(500).json({ error: 'Erro ao atualizar estatísticas do Jogador 1' })
  }

  // 🔄 Atualiza stats jogador 2
  const { error: updateErr2 } = await supabase.from('user_stats').update({
    elo: result.player2EloNew,
    wins: stats2.wins + (result2 === 'win' ? 1 : 0),
    draws: stats2.draws + (result2 === 'draw' ? 1 : 0),
    losses: stats2.losses + (result2 === 'loss' ? 1 : 0),
    goals_for: stats2.goals_for + player2Score,
    goals_against: stats2.goals_against + player1Score,
    corners: stats2.corners + player2Corners,
    yellow_cards: stats2.yellow_cards + player2Yellow,
    red_cards: stats2.red_cards + player2Red
  }).eq('user_id', player2Id)

  if (updateErr2) {
    console.error('❌ Erro ao atualizar stats2:', updateErr2)
    return res.status(500).json({ error: 'Erro ao atualizar estatísticas do Jogador 2' })
  }

  // 📝 Registro da partida com campos adicionais
  const { error: insertMatchErr } = await supabase.from('matches').insert({
    player1: player1Id,
    player2: player2Id,
    player1_score: player1Score,
    player2_score: player2Score,
    player1_corners: player1Corners,
    player2_corners: player2Corners,
    player1_yellow: player1Yellow,
    player2_yellow: player2Yellow,
    player1_red: player1Red,
    player2_red: player2Red,
    player1_possession,
    player2_possession,
    player1_kick_on_target,
    player2_kick_on_target,
    player1_team,
    player2_team
  })

  if (insertMatchErr) {
    console.error('❌ Erro ao inserir partida:', insertMatchErr)
    return res.status(500).json({ error: 'Erro ao registrar partida no banco de dados' })
  }

  return res.status(200).json({
    message: '✅ Partida registrada e estatísticas atualizadas com sucesso!',
    delta1: result.delta1,
    delta2: result.delta2
  })
}
