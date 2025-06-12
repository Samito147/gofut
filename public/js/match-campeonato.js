// ✅ 0️⃣ Garante estrutura mínima de elementos do formulário
function garantirEstruturaMinima() {
  console.log("🛠️ Garantindo estrutura mínima...");
  const form = document.getElementById('matchForm');
  if (!form) {
    console.warn("❗ Formulário #matchForm não encontrado.");
    return;
  }

  if (!document.getElementById('championship_id')) {
    console.log("➕ Adicionando campo hidden championship_id");
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = 'championship_id';
    input.id = 'championship_id';
    form.prepend(input);
  }

  if (!document.getElementById('campeonatos-lista')) {
    console.log("➕ Adicionando lista de campeonatos");
    const wrapper = document.createElement('div');
    wrapper.className = 'championship-row';
    wrapper.innerHTML = `
      <label>Selecione um Campeonato:</label>
      <div id="campeonatos-lista"></div>
    `;
    form.prepend(wrapper);
  }

  ['player1', 'player2'].forEach(id => {
    if (!document.getElementById(id)) {
      console.log(`➕ Adicionando select para ${id}`);
      const select = document.createElement('select');
      select.name = id;
      select.id = id;
      form.prepend(select);
    }
  });
}

// ✅ 1️⃣ Carrega lista de campeonatos ativos
async function carregarCampeonatos() {
  console.log("📡 Carregando lista de campeonatos...");
  garantirEstruturaMinima();

  const container = document.getElementById('campeonatos-lista');
  const inputHidden = document.getElementById('championship_id');

  if (!container || !inputHidden) {
    console.error("❌ Elementos para campeonatos não encontrados.");
    return;
  }

  try {
    const res = await fetch('/api/championships/lista');
    const campeonatos = await res.json();

    console.log("🏆 Campeonatos recebidos:", campeonatos);

    if (!Array.isArray(campeonatos)) throw new Error("Formato inválido");

    container.innerHTML = '';
    campeonatos.forEach(c => {
      const card = document.createElement('div');
      card.className = 'card-campeonato';
      card.innerHTML = `<i class="fas fa-trophy"></i><span class="titulo">${c.title}</span>`;

      card.addEventListener('click', () => {
        console.log(`🎯 Campeonato selecionado: ${c.title} (ID: ${c.id})`);
        document.querySelectorAll('.card-campeonato').forEach(c => c.classList.remove('selecionado'));
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
  console.log(`🔄 Buscando jogadores para o campeonato ID ${campeonatoId}...`);
  try {
    const res = await fetch(`/api/championships/jogadores?id=${campeonatoId}`);
    const jogadores = await res.json();

    if (!Array.isArray(jogadores)) throw new Error("Jogadores inválidos");

    jogadoresCache = jogadores.map(j => ({
      id: j.user_id || j.id,
      nome: j.username || j.nome || 'Sem nome'
    }));

    console.log("🎯 Jogadores carregados:", jogadoresCache);
    atualizarSelects();

  } catch (err) {
    console.error('❌ Erro ao buscar jogadores:', err);
  }
}

// ✅ 3️⃣ Atualiza os dois selects com base no cache
function atualizarSelects() {
  console.log("🔁 Atualizando selects de jogadores...");
  const select1 = document.getElementById('player1');
  const select2 = document.getElementById('player2');

  if (!select1 || !select2) {
    console.error("❌ Selects player1 ou player2 não encontrados.");
    return;
  }

  const player1Selecionado = parseInt(select1.value) || '';
  const player2Selecionado = parseInt(select2.value) || '';

  select1.innerHTML = `<option value="">Selecione o Jogador 1</option>`;
  select2.innerHTML = `<option value="">Selecione o Jogador 2</option>`;

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

// ✅ 4️⃣ Toast flutuante
function showToast(mensagem) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }

  toast.textContent = mensagem;
  toast.classList.remove('hidden');
  setTimeout(() => toast.classList.add('hidden'), 3000);
}

// ✅ 5️⃣ Inicialização da tela e registro do form
document.addEventListener('DOMContentLoaded', () => {
  console.log("📦 DOM totalmente carregado.");
  carregarCampeonatos();

  const form = document.getElementById('matchForm');
  if (!form) {
    console.error("❌ Formulário #matchForm não encontrado.");
    return;
  }

  console.log("📝 Evento de envio registrado no formulário.");

  form.addEventListener('submit', async (e) => {
    console.log("📨 Submit interceptado.");
    e.preventDefault();

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    console.log("📦 Dados brutos do formulário:", data);

    for (let key in data) {
      if (
        key !== 'championship_id' &&
        key !== 'player1_team' &&
        key !== 'player2_team'
      ) {
        data[key] = parseInt(data[key]) || 0;
      }
    }

    console.log("📤 Dados preparados para envio:", data);

    if (!data.player1 || !data.player2 || !data.championship_id) {
      showToast("⚠️ Preencha todos os campos obrigatórios.");
      console.warn("⛔ Campos obrigatórios ausentes:", data);
      return;
    }

    try {
      const res = await fetch('/api/championships/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const json = await res.json();
      console.log("📬 Resposta da API:", json);

      if (res.ok) {
        showToast("✅ Partida registrada com sucesso!");
        form.reset();
        atualizarSelects();
      } else {
        showToast("⚠️ Erro ao registrar: " + (json.error || 'Erro desconhecido'));
        console.warn("⚠️ Resposta da API com erro:", json);
      }
    } catch (err) {
      showToast("❌ Falha na requisição: " + err.message);
      console.error("❌ Erro no envio da partida:", err);
    }
  });
});
