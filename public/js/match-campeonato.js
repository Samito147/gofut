// ✅ Importa função global de verificação
import { verificarAdmin, showToast } from './auth-check.js';

// ✅ 0️⃣ Garante estrutura mínima de elementos do formulário
function garantirEstruturaMinima() {
  console.log("🛠️ Garantindo estrutura mínima...");
  const form = document.getElementById('matchForm');
  if (!form) {
    console.warn("❗ Formulário #matchForm não encontrado.");
    return;
  }

  if (!document.getElementById('championship_id')) {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = 'championship_id';
    input.id = 'championship_id';
    form.prepend(input);
  }

  if (!document.querySelector('.championship-row')) {
    const wrapper = document.createElement('div');
    wrapper.className = 'championship-row';
    wrapper.innerHTML = `
      <div class="championship-header" style="width: 100%; display: flex; justify-content: flex-end;">
        <button id="reset-btn" class="btn-reset" title="Resetar Tabela" style="background:none;border:none;color:#ccc;font-size:1.1rem;cursor:pointer;">
          <i class="fas fa-rotate-left"></i>
        </button>
      </div>
      <div id="campeonatos-lista" style="display:flex;flex-wrap:wrap;gap:0.8rem;justify-content:center;margin-top:0.6rem;width:100%;"></div>
    `;
    form.prepend(wrapper);
  }

  ['player1', 'player2'].forEach(id => {
    if (!document.getElementById(id)) {
      const select = document.createElement('select');
      select.name = id;
      select.id = id;
      form.prepend(select);
    }
  });
}

// ✅ Modal de confirmação personalizado
function showConfirmReset(callback) {
  if (document.getElementById('reset-confirm-modal')) return;

  const modal = document.createElement('div');
  modal.id = 'reset-confirm-modal';
  modal.style = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(15,15,15,0.95);
    color: #fff;
    padding: 2rem;
    border-radius: 12px;
    z-index: 9999;
    box-shadow: 0 0 20px rgba(0,0,0,0.5);
    font-family: Poppins, sans-serif;
    text-align: center;
    max-width: 300px;
    width: 100%;
  `;

  modal.innerHTML = `
    <p style="margin-bottom: 1.5rem;">⚠️ Confirma o reset da tabela?</p>
    <div style="display:flex; justify-content: center; gap: 1rem;">
      <button id="btn-sim" style="padding: 0.6rem 1.2rem; background: #28a745; border:none; color:#fff; border-radius: 8px; cursor: pointer;">SIM</button>
      <button id="btn-nao" style="padding: 0.6rem 1.2rem; background: #dc3545; border:none; color:#fff; border-radius: 8px; cursor: pointer;">NÃO</button>
    </div>
  `;
  document.body.appendChild(modal);

  document.getElementById('btn-sim').onclick = () => {
    document.body.removeChild(modal);
    callback(true);
  };

  document.getElementById('btn-nao').onclick = () => {
    document.body.removeChild(modal);
    callback(false);
  };
}

// ✅ 1️⃣ Carrega lista de campeonatos ativos
async function carregarCampeonatos() {
  console.log("📡 Carregando lista de campeonatos...");
  garantirEstruturaMinima();

  const container = document.getElementById('campeonatos-lista');
  const inputHidden = document.getElementById('championship_id');
  const resetBtn = document.getElementById('reset-btn');

  if (!container || !inputHidden || !resetBtn) {
    console.error("❌ Elementos da interface não encontrados.");
    return;
  }

  resetBtn.addEventListener('click', () => {
    showConfirmReset(async (confirmado) => {
      if (!confirmado) return;

      try {
        const res = await fetch('/api/championships/reset', { method: 'POST' });
        const json = await res.json();
        if (res.ok) {
          showToast("✅ Estatísticas resetadas com sucesso!");
        } else {
          showToast("⚠️ Erro ao resetar: " + (json.error || 'Erro desconhecido'));
        }
      } catch (err) {
        console.error("❌ Erro ao enviar reset:", err);
        showToast("❌ Falha na requisição.");
      }
    });
  });

  try {
    const res = await fetch('/api/championships/lista');
    const campeonatos = await res.json();

    if (!Array.isArray(campeonatos)) throw new Error("Formato inválido");

    container.innerHTML = ''; // limpa cards anteriores

    campeonatos.forEach(c => {
      const card = document.createElement('div');
      card.className = 'card-campeonato';
      card.innerHTML = `<i class="fas fa-trophy"></i><span class="titulo">${c.title}</span>`;
      card.addEventListener('click', () => {
        document.querySelectorAll('.card-campeonato').forEach(el => el.classList.remove('selecionado'));
        card.classList.add('selecionado');
        inputHidden.value = c.id;
        carregarJogadores(c.id);
      });
      container.appendChild(card);
    });
  } catch (err) {
    console.error('❌ Erro ao carregar campeonatos:', err);
    container.innerHTML = '<p class="erro">Erro ao carregar campeonatos.</p>';
  }
}

// ✅ 2️⃣ Carrega jogadores do campeonato
let jogadoresCache = [];

async function carregarJogadores(campeonatoId) {
  try {
    const res = await fetch(`/api/championships/jogadores?id=${campeonatoId}`);
    const jogadores = await res.json();

    if (!Array.isArray(jogadores)) throw new Error("Jogadores inválidos");

    jogadoresCache = jogadores.map(j => ({
      id: j.user_id || j.id,
      nome: j.username || j.nome || 'Sem nome'
    }));

    atualizarSelects();
  } catch (err) {
    console.error('❌ Erro ao buscar jogadores:', err);
  }
}

// ✅ 3️⃣ Atualiza os dois selects com base no cache
function atualizarSelects() {
  const select1 = document.getElementById('player1');
  const select2 = document.getElementById('player2');

  if (!select1 || !select2) return;

  const player1Selecionado = parseInt(select1.value) || '';
  const player2Selecionado = parseInt(select2.value) || '';

  select1.innerHTML = `<option value="">Jogador 1</option>`;
  select2.innerHTML = `<option value="">Jogador 2</option>`;

  jogadoresCache.forEach(j => {
    if (j.id !== player2Selecionado) {
      const opt1 = document.createElement('option');
      opt1.value = j.id;
      opt1.textContent = j.nome;
      if (j.id === player1Selecionado) opt1.selected = true;
      select1.appendChild(opt1);
    }

    if (j.id !== player1Selecionado) {
      const opt2 = document.createElement('option');
      opt2.value = j.id;
      opt2.textContent = j.nome;
      if (j.id === player2Selecionado) opt2.selected = true;
      select2.appendChild(opt2);
    }
  });

  select1.onchange = atualizarSelects;
  select2.onchange = atualizarSelects;
}

// ✅ 5️⃣ Inicializa a tela COM VERIFICAÇÃO DE ADMIN
document.addEventListener('DOMContentLoaded', () => {
  verificarAdmin(() => {
    // ✅ Exibe a página após verificação bem-sucedida
    document.body.classList.remove('invisible-until-verified');
    document.body.classList.add('visible-after-verification');

    // 🔓 Executado SOMENTE se for ADMIN
    carregarCampeonatos();

    const form = document.getElementById('matchForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());

      for (let key in data) {
        if (key !== 'championship_id' && key !== 'player1_team' && key !== 'player2_team') {
          data[key] = parseInt(data[key]) || 0;
        }
      }

      if (!data.player1 || !data.player2 || !data.championship_id) {
        showToast("⚠️ Preencha todos os campos obrigatórios.");
        return;
      }

      try {
        const res = await fetch('/api/championships/match', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        const json = await res.json();
        if (res.ok) {
          showToast("✅ Partida registrada com sucesso!");
          form.reset();
          atualizarSelects();
        } else {
          showToast("⚠️ Erro ao registrar: " + (json.error || 'Erro desconhecido'));
        }
      } catch (err) {
        console.error("❌ Erro no envio:", err);
        showToast("❌ Falha na requisição.");
      }
    });
  });
});
