// /api/payments/create.js

import mercadopago from 'mercadopago';
import { parse } from 'cookie';
import { verify } from 'jsonwebtoken';

// 🔐 Configura o SDK do Mercado Pago com token de ambiente
mercadopago.configure({
  access_token: process.env.MERCADOPAGO_ACCESS_TOKEN
});

export default async function handler(req, res) {
  // ✔️ Permitir apenas método POST
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    // 🍪 Extrai e verifica token JWT a partir dos cookies
    const cookies = parse(req.headers.cookie || '');
    const token = cookies.auth_token;

    if (!token) {
      console.warn("⚠️ Token ausente no cookie.");
      return res.status(401).json({ error: 'Token de autenticação ausente' });
    }

    const payload = verify(token, process.env.JWT_SECRET);
    const userId = payload.userId;

    if (!userId) {
      console.warn("⚠️ ID do usuário não encontrado no payload.");
      return res.status(400).json({ error: 'ID do usuário não encontrado no token' });
    }

    // 🧾 Cria a preferência de pagamento com os dados
    const preference = {
      items: [
        {
          title: "Pacote de 150 GPs",
          quantity: 1,
          unit_price: 7.5,
          currency_id: "BRL"
        }
      ],
      metadata: {
        user_id: userId
      },
      back_urls: {
        success: "https://gofut.vercel.app/loja?status=success",
        failure: "https://gofut.vercel.app/loja?status=failure",
        pending: "https://gofut.vercel.app/loja?status=pending"
      },
      notification_url: "https://gofut.vercel.app/api/payments/notify",
      auto_return: "approved"
    };

    // 📡 Envia para o Mercado Pago
    const response = await mercadopago.preferences.create(preference);

    if (!response.body?.init_point) {
      console.error("❌ Erro ao obter link de pagamento:", response);
      return res.status(500).json({ error: 'Falha ao obter link de pagamento' });
    }

    // ✅ Sucesso: retorna link de pagamento
    return res.status(200).json({ init_point: response.body.init_point });

  } catch (error) {
    console.error("❌ Erro ao criar preferência de pagamento:", error);
    return res.status(500).json({ error: 'Erro ao criar pagamento.' });
  }
}
