// loja.js – lógica da página LOJA

document.addEventListener("DOMContentLoaded", async () => {
  await carregarSaldo();
  verificarStatusPagamento(); // ✅ Nova função adicionada
});

// 🔄 Buscar saldo atual do usuário
async function carregarSaldo() {
  try {
    const res = await fetch('/api/wallet', { credentials: 'include' });
    const data = await res.json();
    const saldo = data?.balance_gp ?? 0;
    document.getElementById('gp-saldo').textContent = `${saldo} GPs`;
  } catch (e) {
    console.error("Erro ao carregar saldo:", e);
    document.getElementById('gp-saldo').textContent = "Erro ao carregar.";
    showToast("Erro ao carregar saldo.", "error");
  }
}

// 💳 Comprar GPs via Mercado Pago (Checkout Pro) com feedback visual e toast
async function comprarGP(quantidade) {
  const botao = document.querySelector(`.pacotes button[onclick*="${quantidade}"]`);
  const textoOriginal = botao.textContent;

  // 🌀 Feedback visual com spinner
  botao.disabled = true;
  botao.innerHTML = `<span class="spinner"></span> Processando...`;

  try {
    // Buscar o user_id da sessão atual
    const sessao = await fetch('/api/session', { credentials: 'include' });
    const dadosSessao = await sessao.json();
    const userId = dadosSessao?.user?.id;

    if (!userId) {
      showToast("Você precisa estar logado para comprar GPs.", "error");
      botao.disabled = false;
      botao.innerHTML = textoOriginal;
      return;
    }

    // ✅ CORRIGIDO: adicionado body para evitar erro 405
    const res = await fetch('/api/pagamento', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });

    if (!res.ok) {
      const erroTexto = await res.text();
      console.error("Erro na resposta da API:", res.status, erroTexto);
      throw new Error(`Erro ${res.status}: ${erroTexto}`);
    }

    const data = await res.json();

    if (data.init_point) {
      showToast("Redirecionando para o pagamento...", "success");
      window.location.href = data.init_point;
    } else {
      throw new Error("Falha ao gerar link de pagamento.");
    }
  } catch (e) {
    console.error("Erro ao processar compra:", e);
    showToast("Erro ao iniciar pagamento. Tente novamente.", "error");
    botao.disabled = false;
    botao.innerHTML = textoOriginal;
  }
}

// 📢 Toast elegante com animação e ícones (compatível com estilos avançados)
function showToast(mensagem, tipo = "success") {
  const toast = document.createElement("div");
  toast.className = `toast ${tipo}`;
  toast.innerHTML = `
    <span class="toast-icon"></span>
    <span>${mensagem}</span>
  `;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("show");
  }, 100);

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => document.body.removeChild(toast), 500);
  }, 3000);
}

// 🔁 Detectar parâmetro de status de pagamento e exibir toast correspondente
function verificarStatusPagamento() {
  const urlParams = new URLSearchParams(window.location.search);
  const status = urlParams.get("status");

  if (status) {
    let mensagem = "";
    let tipo = "info";

    if (status === "success") {
      mensagem = "✅ Pagamento aprovado! Seus GPs foram creditados.";
      tipo = "success";
    } else if (status === "failure") {
      mensagem = "❌ Pagamento não foi aprovado. Tente novamente.";
      tipo = "error";
    } else if (status === "pending") {
      mensagem = "⏳ Pagamento pendente. Aguarde confirmação.";
      tipo = "warning";
    }

    if (mensagem) {
      showToast(mensagem, tipo);
    }

    // ✂️ Limpa o status da URL
    const cleanUrl = window.location.origin + window.location.pathname;
    window.history.replaceState({}, document.title, cleanUrl);
  }
}

// 💠 Estilo da animação spinner (injetado se não existir)
if (!document.querySelector("#spinner-style")) {
  const style = document.createElement("style");
  style.id = "spinner-style";
  style.textContent = `
    .spinner {
      display: inline-block;
      width: 16px;
      height: 16px;
      border: 3px solid #fff;
      border-top: 3px solid transparent;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin-right: 8px;
      vertical-align: middle;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
}
