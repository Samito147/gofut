// ✅ Carrega todos os jogadores e preenche os <select>
async function carregarJogadores() {
  try {
    const res = await fetch('/api/users');
    const jogadores = await res.json();

    const select1 = document.getElementById('player1');
    const select2 = document.getElementById('player2');

    jogadores.forEach(user => {
      const option1 = document.createElement('option');
      option1.value = user.id;
      option1.textContent = user.username;
      select1.appendChild(option1);

      const option2 = document.createElement('option');
      option2.value = user.id;
      option2.textContent = user.username;
      select2.appendChild(option2);
    });

    // 🔄 Atualiza opções para evitar duplicidade entre seletores
    select1.addEventListener('change', () => atualizarOpcoes(select1, select2));
    select2.addEventListener('change', () => atualizarOpcoes(select2, select1));

  } catch (error) {
    console.error('❌ Erro ao carregar jogadores:', error);
  }
}

// 🚫 Impede seleção duplicada entre os dois <select>
function atualizarOpcoes(origem, destino) {
  const valorSelecionado = origem.value;
  const opcoes = destino.querySelectorAll('option');

  opcoes.forEach(opcao => {
    if (opcao.value === valorSelecionado && valorSelecionado !== '') {
      opcao.disabled = true;
    } else {
      opcao.disabled = false;
    }
  });
}

// ✅ Card de feedback flutuante centralizado
function showFloatingCard(jogador1, elo1, jogador2, elo2) {
  const card = document.createElement('div');
  card.className = 'match-result-card';
  card.innerHTML = `
    <button class="close-btn" onclick="this.parentElement.remove()">✖</button>
    <h2>✅ Partida registrada!</h2>
    <div class="player-line">🧑‍💼 ${jogador1}: <span style="color:${elo1 >= 0 ? '#0f0' : '#f44'}">${elo1 >= 0 ? '+' : ''}${elo1} ELO</span></div>
    <div class="player-line">🧑‍💼 ${jogador2}: <span style="color:${elo2 >= 0 ? '#0f0' : '#f44'}">${elo2 >= 0 ? '+' : ''}${elo2} ELO</span></div>
  `;
  document.body.appendChild(card);
}

// 📤 Envia o formulário de partida comum
const form = document.getElementById('matchForm');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());

  console.log("📦 Dados enviados para API de partidas comuns:", data);

  // Converte campos numéricos
  for (let key in data) {
    if (!isNaN(data[key]) && data[key] !== '') {
      data[key] = parseInt(data[key]);
    }
  }

  try {
    const res = await fetch('/api/match', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const json = await res.json();

    if (res.ok) {
      const player1Select = document.getElementById('player1');
      const player2Select = document.getElementById('player2');
      const player1Name = player1Select.options[player1Select.selectedIndex]?.text || 'Jogador 1';
      const player2Name = player2Select.options[player2Select.selectedIndex]?.text || 'Jogador 2';
      const delta1 = json.delta1 ?? 0;
      const delta2 = json.delta2 ?? 0;

      showFloatingCard(player1Name, delta1, player2Name, delta2);
      form.reset();
      atualizarOpcoes(player1Select, player2Select);
      atualizarOpcoes(player2Select, player1Select);
    } else {
      alert(`Erro: ${json.error || 'Falha ao registrar partida'}`);
    }
  } catch (err) {
    alert(`Erro na requisição: ${err.message}`);
  }
});

// 🚀 Inicia carregamento de jogadores assim que o script é executado
carregarJogadores();
