// loja.js – lógica da página LOJA

document.addEventListener("DOMContentLoaded", async () => {
  await carregarSaldo();
  aguardarGPCardParaAdicionarIcone();
  criarOverlayGP(); // ✅ cria o fundo escuro invisível
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

  botao.disabled = true;
  botao.innerHTML = `<span class="spinner"></span> Processando...`;

  try {
    const sessao = await fetch('/api/session', { credentials: 'include' });
    const dadosSessao = await sessao.json();
    const userId = dadosSessao?.user?.id;

    if (!userId) {
      showToast("Você precisa estar logado para comprar GPs.", "error");
      botao.disabled = false;
      botao.innerHTML = textoOriginal;
      return;
    }

    const valor = quantidade;

    const res = await fetch('/api/pagamento', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantidade, valor })
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

// 📢 Toast elegante com animação e ícones
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

// 💠 Spinner (injetado 1x)
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

// 💠 Fundo escurecido (overlay)
function criarOverlayGP() {
  if (!document.getElementById('gp-info-overlay')) {
    const overlay = document.createElement('div');
    overlay.id = 'gp-info-overlay';

    // ✅ Estilos robustos com fallback total
    Object.assign(overlay.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      right: '0',
      bottom: '0',
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      zIndex: '9998',
      display: 'none'
    });

    overlay.onclick = fecharModalGP;
    document.body.appendChild(overlay);
  }
}


// 💠 Adiciona botão de info após #gp-card existir
function aguardarGPCardParaAdicionarIcone() {
  const tentar = () => {
    const card = document.getElementById('gp-card');
    if (card) {
      adicionarIconeInfoGP(card);
    } else {
      requestAnimationFrame(tentar);
    }
  };
  tentar();
}

// 💠 Ícone de info no canto superior direito do card
function adicionarIconeInfoGP(card) {
  if (!card || card.querySelector('.info-btn')) return;

  const infoBtn = document.createElement('button');
  infoBtn.className = 'info-btn';
  infoBtn.innerHTML = '<i class="fas fa-circle-info"></i>';
  infoBtn.title = "Informações sobre GPs";
  infoBtn.onclick = abrirModalGP;
  card.style.position = 'relative';
  card.appendChild(infoBtn);
}

// 🔍 Exibe o conteúdo do GPS.html no card flutuante com overlay
async function abrirModalGP() {
  const antigo = document.getElementById('gp-info-modal');
  if (antigo) antigo.remove();

  const modal = document.createElement('div');
  modal.id = 'gp-info-modal';
  modal.style = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: #1c1c1c;
    color: #fff;
    border-radius: 12px;
    padding: 2rem;
    z-index: 9999;
    max-width: 600px;
    width: 90%;
    max-height: 80vh;
    overflow-y: auto;
    box-shadow: 0 0 30px rgba(0,0,0,0.6);
    font-family: 'Poppins', sans-serif;
  `;

  const fechar = document.createElement('button');
  fechar.innerHTML = '&times;';
  fechar.style = `
    position: absolute;
    top: 8px;
    right: 12px;
    background: none;
    border: none;
    color: #fff;
    font-size: 1.5rem;
    cursor: pointer;
  `;
  fechar.onclick = fecharModalGP;

  modal.appendChild(fechar);

  try {
    const res = await fetch('GPS.html');
    const html = await res.text();
    const conteudo = document.createElement('div');
    conteudo.innerHTML = html;
    modal.appendChild(conteudo);
  } catch (e) {
    modal.innerHTML += `<p style="color: red;">Erro ao carregar informações dos GPs.</p>`;
  }

  document.body.appendChild(modal);
  document.getElementById('gp-info-overlay').style.display = 'block';
}

// ❌ Fecha o modal e o fundo escuro
function fecharModalGP() {
  const modal = document.getElementById('gp-info-modal');
  const overlay = document.getElementById('gp-info-overlay');
  if (modal) modal.remove();
  if (overlay) overlay.style.display = 'none';
}
