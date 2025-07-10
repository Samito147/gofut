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

  // 🔍 Carrega ou cria estatísticas do Jogador 1
  let { data: stats1, error: error1 } = await supabase
    .from('user_stats')
    .select('*')
    .eq('user_id', player1Id)
    .single()

  if (error1 || !stats1) {
    await supabase.from('user_stats').insert({ user_id: player1Id, elo: 1000 })
    stats1 = {
      user_id: player1Id,
      played: 0, victories: 0, draws: 0, losses: 0,
      goals: 0, yellow: 0, red: 0, corners: 0, possession: 0,
      goals_for: 0, goals_against: 0,
      wins: 0, yellow_cards: 0, red_cards: 0, chutes: 0,
      elo: 1000
    }
  }

  // 🔍 Carrega ou cria estatísticas do Jogador 2
  let { data: stats2, error: error2 } = await supabase
    .from('user_stats')
    .select('*')
    .eq('user_id', player2Id)
    .single()

  if (error2 || !stats2) {
    await supabase.from('user_stats').insert({ user_id: player2Id, elo: 1000 })
    stats2 = {
      user_id: player2Id,
      played: 0, victories: 0, draws: 0, losses: 0,
      goals: 0, yellow: 0, red: 0, corners: 0, possession: 0,
      goals_for: 0, goals_against: 0,
      wins: 0, yellow_cards: 0, red_cards: 0, chutes: 0,
      elo: 1000
    }
  }

  // 🧮 Resultado
  const result = calculateElo({
    player1Elo: stats1.elo,
    player2Elo: stats2.elo,
    player1Score, player2Score,
    player1Corners, player2Corners,
    player1Yellow, player2Yellow,
    player1Red, player2Red
  })

  const result1 = player1Score > player2Score ? 'win' : player1Score < player2Score ? 'loss' : 'draw'
  const result2 = result1 === 'win' ? 'loss' : result1 === 'loss' ? 'win' : 'draw'

  // ✅ Atualiza estatísticas jogador 1
  const newStats1 = {
    played: stats1.played + 1,
    victories: stats1.victories + (result1 === 'win' ? 1 : 0),
    draws: stats1.draws + (result1 === 'draw' ? 1 : 0),
    losses: stats1.losses + (result1 === 'loss' ? 1 : 0),
    goals: stats1.goals + player1Score,
    yellow: stats1.yellow + player1Yellow,
    red: stats1.red + player1Red,
    corners: stats1.corners + player1Corners,
    possession: stats1.possession + player1_possession,
    elo: result.player1EloNew,
    goals_for: stats1.goals_for + player1Score,
    goals_against: stats1.goals_against + player2Score,
    wins: stats1.wins + (result1 === 'win' ? 1 : 0),
    yellow_cards: stats1.yellow_cards + player1Yellow,
    red_cards: stats1.red_cards + player1Red,
    chutes: stats1.chutes + player1_kick_on_target,
    efficiency: parseFloat((((stats1.victories + (result1 === 'win' ? 1 : 0)) / (stats1.played + 1)) * 100).toFixed(2))
  }

  const { error: update1Err } = await supabase
    .from('user_stats')
    .update(newStats1)
    .eq('user_id', player1Id)

  if (update1Err) {
    console.error('❌ Erro ao atualizar stats1:', update1Err)
    return res.status(500).json({ error: 'Erro ao atualizar estatísticas do Jogador 1' })
  }

  // ✅ Atualiza estatísticas jogador 2
  const newStats2 = {
    played: stats2.played + 1,
    victories: stats2.victories + (result2 === 'win' ? 1 : 0),
    draws: stats2.draws + (result2 === 'draw' ? 1 : 0),
    losses: stats2.losses + (result2 === 'loss' ? 1 : 0),
    goals: stats2.goals + player2Score,
    yellow: stats2.yellow + player2Yellow,
    red: stats2.red + player2Red,
    corners: stats2.corners + player2Corners,
    possession: stats2.possession + player2_possession,
    elo: result.player2EloNew,
    goals_for: stats2.goals_for + player2Score,
    goals_against: stats2.goals_against + player1Score,
    wins: stats2.wins + (result2 === 'win' ? 1 : 0),
    yellow_cards: stats2.yellow_cards + player2Yellow,
    red_cards: stats2.red_cards + player2Red,
    chutes: stats2.chutes + player2_kick_on_target,
    efficiency: parseFloat((((stats2.victories + (result2 === 'win' ? 1 : 0)) / (stats2.played + 1)) * 100).toFixed(2))
  }

  const { error: update2Err } = await supabase
    .from('user_stats')
    .update(newStats2)
    .eq('user_id', player2Id)

  if (update2Err) {
    console.error('❌ Erro ao atualizar stats2:', update2Err)
    return res.status(500).json({ error: 'Erro ao atualizar estatísticas do Jogador 2' })
  }

  // 📥 Registro da partida
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
