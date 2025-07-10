// pages/api/wallet.js

import { createClient } from '@supabase/supabase-js';
import { parse } from 'cookie';
import { verify } from 'jsonwebtoken';

// 🔗 Inicializa o Supabase com chave de serviço
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    // 🔐 Extrai e verifica o token do cookie
    const cookies = parse(req.headers.cookie || '');
    const token = cookies.auth_token;

    if (!token) {
      return res.status(401).json({ error: 'Não autenticado' });
    }

    const payload = verify(token, process.env.JWT_SECRET);
    const userId = payload.userId;

    if (!userId) {
      return res.status(400).json({ error: 'ID do usuário não encontrado no token' });
    }

    // 🔍 Busca o saldo na tabela user_wallet
    const { data, error } = await supabase
      .from('user_wallet')
      .select('balance_gp')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ error: 'Carteira não encontrada para este usuário' });
    }

    // ✔️ Sucesso
    return res.status(200).json({ balance_gp: data.balance_gp });

  } catch (err) {
    console.error('❌ Erro ao buscar carteira:', err.message);
    return res.status(500).json({ error: 'Erro ao buscar saldo da carteira' });
  }
}
