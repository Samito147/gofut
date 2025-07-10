// /pages/api/achievements.js

import { createClient } from '@supabase/supabase-js';

// Cria o client com as variáveis do .env.local
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const userId = req.query.userId;

    console.log('==> Recebido userId:', userId);

    if (!userId) {
      return res.status(400).json({ error: 'Missing userId' });
    }

    // Consulta na tabela user_achievements com join para achievements
    const { data, error } = await supabase
      .from('user_achievements')
      .select(`
        achievement_id,
        achievements ( title, description, icon )
      `)
      .eq('user_id', userId)
      .order('achieved_at', { ascending: false });

    if (error) {
      console.error('==> Erro ao buscar conquistas:', error);
      return res.status(500).json({ error: error.message });
    }

    console.log('==> Dados brutos de conquistas:', data);

    // Formata a resposta
    const achievements = (data || []).map(row => ({
      title: row.achievements?.title ?? 'Sem título',
      description: row.achievements?.description ?? '',
      icon: row.achievements?.icon ?? 'fas fa-star'
    }));

    console.log('==> Achievements formatados:', achievements);

    return res.status(200).json(achievements);

  } catch (err) {
    console.error('==> Erro inesperado em /api/achievements:', err);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}
