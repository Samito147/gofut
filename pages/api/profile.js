// pages/api/profile.js
import { createClient } from '@supabase/supabase-js'
import jwt from 'jsonwebtoken'
import { parse } from 'cookie'

// inicia cliente Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'GET')
    return res.status(405).json({ error: 'Só GET permitido' })

  const usernameQuery = req.query.username || null
  let userId = null
  let user = null

  try {
    if (usernameQuery) {
      // 🔓 Consulta pública por username
      const { data: userData, error: errUser } = await supabase
        .from('users')
        .select('id, username, full_name, birth_date, created_at')
        .ilike('username', usernameQuery) // insensível a maiúsculas/minúsculas
        .single()

      if (errUser || !userData) {
        console.error('Usuário não encontrado:', errUser)
        return res.status(404).json({ error: 'Usuário não encontrado' })
      }

      user = userData
      userId = user.id
    } else {
      // 🔐 Modo autenticado com JWT
      const cookies = parse(req.headers.cookie || '')
      const token = cookies.auth_token
      if (!token) return res.status(401).json({ error: 'Não autenticado' })

      let payload
      try {
        payload = jwt.verify(token, process.env.JWT_SECRET)
      } catch {
        return res.status(401).json({ error: 'Token inválido' })
      }

      userId = payload.userId

      const { data: userData, error: errUser } = await supabase
        .from('users')
        .select('id, username, full_name, birth_date, created_at')
        .eq('id', userId)
        .single()

      if (errUser || !userData) {
        console.error('Erro ao buscar usuário autenticado:', errUser)
        return res.status(500).json({ error: 'Erro ao carregar dados pessoais' })
      }

      user = userData
    }

    // 📊 Estatísticas do jogador
    let stats = null
    try {
      const { data: s, error: errStats } = await supabase
        .from('user_stats')
        .select(`
          played,
          goals,
          victories,
          draws,
          losses,
          yellow,
          red,
          efficiency,
          corners,
          possession
        `)
        .eq('user_id', userId)
        .single()
      if (!errStats) stats = s
    } catch (e) {
      console.warn('Tabela user_stats possivelmente não existe ainda')
    }

    // ⭐ ELO e Classe
    let elo = 1000
    let rank_class = 'Sem Classe'
    try {
      const { data: eloData, error: errElo } = await supabase
        .from('user_stats')
        .select('elo, rank_class')
        .eq('user_id', userId)
        .single()
      if (!errElo && eloData) {
        elo = eloData.elo ?? 1000
        rank_class = eloData.rank_class ?? 'Sem Classe'
      }
    } catch (e) {
      console.warn('Não foi possível buscar elo/class')
    }

    // 🎂 Cálculo da idade
    const age = Math.floor(
      (new Date() - new Date(user.birth_date)) / (1000 * 60 * 60 * 24 * 365)
    )

    // 🏆 Conquistas (mock)
    const achievements = [
      {
        icon: 'fas fa-trophy',
        title: 'Primeira Vitória',
        description: 'Você venceu sua primeira partida!'
      },
      {
        icon: 'fas fa-shield-alt',
        title: 'Invicto!',
        description: 'Ficou 5 partidas sem perder.'
      },
      {
        icon: 'fas fa-bolt',
        title: 'Hat-Trick',
        description: 'Marcou 3 gols em um único jogo.'
      }
    ]

    // 📦 Resposta JSON
    return res.status(200).json({
      id:        user.id,
      avatarUrl: `https://i.pravatar.cc/150?u=${user.id}`,
      nick:      user.username,
      fullName:  user.full_name,
      age,
      created_at: user.created_at,
      stats: {
        played:     stats?.played     ?? 0,
        goals:      stats?.goals      ?? 0,
        victories:  stats?.victories  ?? 0,
        draws:      stats?.draws      ?? 0,
        losses:     stats?.losses     ?? 0,
        yellow:     stats?.yellow     ?? 0,
        red:        stats?.red        ?? 0,
        efficiency: stats?.efficiency ?? 0,
        corners:    stats?.corners    ?? 0,
        possession: stats?.possession ?? 0,
        elo,
        rank_class
      },
      achievements
    })

  } catch (err) {
    console.error('Erro inesperado em /api/profile:', err)
    return res.status(500).json({ error: 'Erro interno no servidor' })
  }
}
