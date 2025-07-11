const mercadopago = require('mercadopago');
const { parse } = require('cookie');
const { verify } = require('jsonwebtoken');

// 🔐 Configura o SDK do Mercado Pago com token de ambiente
console.log("📍 Iniciando configuração do Mercado Pago...");
mercadopago.configure({
  access_token: process.env.MERCADOPAGO_ACCESS_TOKEN
});
console.log("✅ Mercado Pago configurado com token:", process.env.MERCADOPAGO_ACCESS_TOKEN ? '✔️ OK' : '❌ NÃO DEFINIDO');

export default async function handler(req, res) {
  console.log("📥 Requisição recebida:", req.method);

  // ✔️ Permitir apenas método POST
  if (req.method !== 'POST') {
    console.warn("⚠️ Método não permitido:", req.method);
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    // 🍪 Extrai e verifica token JWT a partir dos cookies
    const cookies = parse(req.headers.cookie || '');
    console.log("📍 Cookies recebidos:", cookies);

    const token = cookies.auth_token;

    if (!token) {
      console.warn("⚠️ Token ausente no cookie.");
      return res.status(401).json({ error: 'Token de autenticação ausente' });
    }

    console.log("🔑 Token JWT encontrado, iniciando verificação...");

    const payload = verify(token, process.env.JWT_SECRET);
    console.log("✅ Token verificado com sucesso:", payload);

    const userId = payload.userId;

    if (!userId) {
      console.warn("⚠️ ID do usuário não encontrado no payload.");
      return res.status(400).json({ error: 'ID do usuário não encontrado no token' });
    }

    console.log("🧠 ID do usuário autenticado:", userId);

    // 🧾 Lê valores enviados pelo frontend
    const { quantidade, valor } = req.body;

    if (!quantidade || !valor) {
      console.warn("⚠️ Dados de pagamento ausentes:", req.body);
      return res.status(400).json({ error: 'Dados de pagamento inválidos' });
    }

    console.log(`🛒 Gerando preferência para ${quantidade} GPs por R$${valor}, usuário: ${userId}`);

    // 🧾 Cria a preferência de pagamento com os dados dinâmicos
    const preference = {
      items: [
        {
          title: `Pacote de ${quantidade} GPs`,
          quantity: 1,
          unit_price: valor,
          currency_id: "BRL"
        }
      ],
      metadata: {
        user_id: userId,
        quantidade,
        valor
      },
      back_urls: {
        success: "https://gofut.vercel.app/loja?status=success",
        failure: "https://gofut.vercel.app/loja?status=failure",
        pending: "https://gofut.vercel.app/loja?status=pending"
      },
      notification_url: "https://gofut.vercel.app/api/payments/notify",
      auto_return: "approved"
    };

    console.log("📝 Preferência de pagamento criada:", preference);

    // 📡 Envia para o Mercado Pago
    const response = await mercadopago.preferences.create(preference);
    console.log("📬 Resposta da API do Mercado Pago:", response.body);

    if (!response.body?.init_point) {
      console.error("❌ Erro ao obter link de pagamento:", response);
      return res.status(500).json({ error: 'Falha ao obter link de pagamento' });
    }

    // ✅ Sucesso: retorna link de pagamento
    console.log("✅ Link de pagamento gerado:", response.body.init_point);
    return res.status(200).json({ init_point: response.body.init_point });

  } catch (error) {
    console.error("❌ Erro ao criar preferência de pagamento:", error);
    return res.status(500).json({ error: 'Erro ao criar pagamento.' });
  }
}
