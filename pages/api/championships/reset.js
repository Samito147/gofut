import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    console.log('♻️ Iniciando RESET da tabela championship_players...')

    const { error: updateError } = await supabase
      .from('championship_players')
      .update({
        pontos: 0,
        jogos: 0,
        vitorias: 0,
        empates: 0,
        derrotas: 0,
        saldo_gols: 0,
        escanteios: 0,
        golspro: 0,
        golscontra: 0,
        amarelos: 0,
        vermelhos: 0
      })
      .not('id', 'is', null); // ✅ força cláusula WHERE válida

    if (updateError) throw updateError;

    console.log('✅ RESET finalizado com sucesso.');
    return res.status(200).json({ message: 'Estatísticas resetadas com sucesso!' });

  } catch (err) {
    console.error('❌ Erro ao resetar estatísticas:', err);
    return res.status(500).json({ error: 'Erro ao resetar estatísticas', detail: err.message });
  }
}
