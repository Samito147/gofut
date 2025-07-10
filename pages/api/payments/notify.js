// /api/payments/notify.js

import mercadopago from 'mercadopago';
import { createClient } from '@supabase/supabase-js';

// ⚙️ Configuração do Mercado Pago
mercadopago.configure({
  access_token: process.env.MERCADOPAGO_ACCESS_TOKEN
});

// ⚙️ Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export const config = {
  api: {
    bodyParser: true, // ⚠️ importante para interpretar JSON
  },
};

export default async function handler(req, res) {
  console.log("📥 Webhook recebido:", req.method, req.body);

  if (req.method !== 'POST') {
    console.warn("⚠️ Método não permitido:", req.method);
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const paymentId = req.body?.data?.id;
    const topic = req.body?.type;

    console.log("🔍 Extraído do corpo - paymentId:", paymentId, "| topic:", topic);

    if (topic !== 'payment' || !paymentId) {
      console.warn("⚠️ Notificação não é de pagamento válido");
      return res.status(200).send('Evento ignorado');
    }

    // 🔍 Buscar detalhes do pagamento
    const result = await mercadopago.payment.findById(paymentId);

    if (!result || !result.body) {
      console.error("❌ Pagamento não encontrado no Mercado Pago");
      return res.status(404).json({ error: 'Pagamento não encontrado' });
    }

    const payment = result.body;
    const status = payment.status;
    const userId = payment.metadata?.user_id;

    console.log("📦 Pagamento status:", status, "| userId:", userId);

    if (status === 'approved' && userId) {
      const { error } = await supabase.rpc('add_gps_to_user', {
        uid: userId,
        quantidade: 150
      });

      if (error) {
        console.error("❌ Erro ao adicionar GPs:", error);
        return res.status(500).json({ error: 'Erro ao adicionar GPs' });
      }

      console.log("✅ GPs creditados com sucesso para o usuário:", userId);
      return res.status(200).send('GPs creditados');
    }

    console.warn("⚠️ Pagamento não aprovado ou user_id ausente");
    return res.status(200).send('Pagamento não aprovado');

  } catch (error) {
    console.error("❌ Erro no processamento do webhook:", error);
    return res.status(500).json({ error: 'Erro interno no webhook' });
  }
}
