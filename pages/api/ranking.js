
import { createClient } from '@supabase/supabase-js'
import { getPlayerClass } from '../../../utils/elo.js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    // 1. Busca todos os usuários
    const { data: users, error: errUsers } = await supabase
      .from('users')
      .select('id, username, full_name')

    if (errUsers) throw errUsers

    // 2. Busca stats de todos os usuários
    const { data: stats, error: errStats } = await supabase
      .from('user_stats')
      .select('*')

    if (errStats) throw errStats

    // 3. Junta os dados
    const resultado = users.map(user => {
      const stat = stats.find(s => s.user_id === user.id)

      const partidas = stat ? (stat.wins + stat.draws + stat.losses) : 0
      const winRate = partidas > 0 ? (stat.wins / partidas) * 100 : 0
      const classe = getPlayerClass(winRate)
      const elo = stat ? stat.elo : 0

      return {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        avatarUrl: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${user.username}`,
        elo,
        classe
      }
    })

    // 4. Ordena por ELO
    resultado.sort((a, b) => b.elo - a.elo)

    return res.status(200).json(resultado)
  } catch (err) {
    console.error('Erro no ranking:', err)
    return res.status(500).json({ error: 'Erro interno no ranking' })
  }
}
