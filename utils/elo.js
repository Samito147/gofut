export function calculateElo({
  player1Elo,
  player2Elo,
  player1Score,
  player2Score,
  player1Corners,
  player2Corners,
  player1Yellow,
  player2Yellow,
  player1Red,
  player2Red
}) {
  const eloDiff = Math.abs(player1Elo - player2Elo)
  const baseChange = 20 + Math.min(Math.floor(eloDiff / 100), 20)

  const result1 =
    player1Score > player2Score ? 'win' :
    player1Score < player2Score ? 'loss' : 'draw'

  const expected1 = 1 / (1 + 10 ** ((player2Elo - player1Elo) / 400))
  const expected2 = 1 - expected1

  const score1 = result1 === 'win' ? 1 : result1 === 'draw' ? 0.5 : 0
  const score2 = 1 - score1

  let delta1 = Math.round(baseChange * (score1 - expected1))
  let delta2 = Math.round(baseChange * (score2 - expected2))

  // 📊 Bonificação por escanteios
  delta1 += player1Corners - player2Corners
  delta2 += player2Corners - player1Corners

  // ⚽ Bonificação por diferença de gols
  const goalDiff = Math.abs(player1Score - player2Score)
  if (player1Score > player2Score) delta1 += goalDiff
  if (player2Score > player1Score) delta2 += goalDiff

  // 🚨 Penalização por cartões
  delta1 -= player1Yellow * 1 + player1Red * 2
  delta2 -= player2Yellow * 1 + player2Red * 2

  // 💥 Multiplicador underdog (agora mais forte)
  if (result1 === 'win' && player1Elo < player2Elo && eloDiff >= 300) {
    delta1 = Math.round(delta1 * 2)
    delta2 = Math.round(delta2 * 2)
  }

  // ✨ Variação mínima garantida
  if (delta1 === 0 && score1 !== 0.5) delta1 = score1 > 0.5 ? 1 : -1
  if (delta2 === 0 && score2 !== 0.5) delta2 = score2 > 0.5 ? 1 : -1

  return {
    player1EloNew: player1Elo + delta1,
    player2EloNew: player2Elo + delta2,
    delta1,
    delta2
  }
}
