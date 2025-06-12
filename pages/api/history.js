import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido. Use GET.' })
  }

  const userId = parseInt(req.query.userId)
  if (!userId || isNaN(userId)) {
    return res.status(400).json({ error: 'Parâmetro userId inválido ou ausente.' })
  }

  try {
    const { data, error } = await supabase
      .from('matches')
      .select(`
        id,
        player1,
        player2,
        player1_score,
        player2_score,
        player1_corners,
        player2_corners,
        player1_yellow,
        player2_yellow,
        player1_red,
        player2_red,
        player1_team,
        player2_team,
        player1_possession,
        player2_possession,
        player1_kick_on_target,
        player2_kick_on_target,
        played_at,
        player1_user:player1 ( username ),
        player2_user:player2 ( username )
      `)
      .or(`player1.eq.${userId},player2.eq.${userId}`)
      .order('played_at', { ascending: false })

    if (error) {
      console.error('Erro ao buscar partidas:', error)
      return res.status(500).json({ error: 'Erro ao buscar partidas no banco de dados.' })
    }

    return res.status(200).json(data)
  } catch (err) {
    console.error('Erro inesperado em /api/history:', err)
    return res.status(500).json({ error: 'Erro interno ao buscar histórico.' })
  }
}
