import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { user_id, championship_id } = req.body;

  if (!user_id || !championship_id) {
    return res.status(400).json({ error: 'Parâmetros ausentes' });
  }

  try {
    // 🔁 Verificar se o usuário já está inscrito
    const { data: jaInscrito, error: erroBusca } = await supabase
      .from('championship_players')
      .select('id')
      .eq('user_id', user_id)
      .eq('championship_id', championship_id)
      .maybeSingle();

    if (erroBusca) {
      console.error('Erro ao verificar inscrição:', erroBusca.message);
      return res.status(500).json({ error: 'Erro ao verificar inscrição' });
    }

    if (jaInscrito) {
      return res.status(409).json({ error: 'Usuário já inscrito' });
    }

    // 👥 Verificar quantos jogadores já estão inscritos
    const { data: inscritos, error: errContagem } = await supabase
      .from('championship_players')
      .select('id')
      .eq('championship_id', championship_id);

    if (errContagem) {
      console.error('Erro ao contar inscritos:', errContagem.message);
      return res.status(500).json({ error: 'Erro ao verificar vagas' });
    }

    if (inscritos.length >= 20) {
      await supabase
        .from('championships')
        .update({ ativo: false })
        .eq('id', championship_id);
      return res.status(403).json({ error: 'Campeonato cheio' });
    }

    // 📝 Inserir jogador com estatísticas zeradas
    const { error: errInsert } = await supabase.from('championship_players').insert({
      user_id,
      championship_id,
      pontos: 0,
      jogos: 0,
      vitorias: 0,
      empates: 0,
      derrotas: 0,
      saldo_gols: 0,
      escanteios: 0
    });

    if (errInsert) {
      console.error('Erro ao inserir jogador:', errInsert.message);
      return res.status(500).json({ error: 'Erro ao inscrever jogador' });
    }

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error('Erro inesperado:', err.message);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}
