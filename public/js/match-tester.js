// 🔽 Carrega lista de campeonatos ativos e popula o <select>
async function carregarCampeonatos() {
  const select = document.getElementById('championship_id');
  try {
    const res = await fetch('/api/campeonatos');
    const campeonatos = await res.json();

    campeonatos.forEach(c => {
      const option = document.createElement('option');
      option.value = c.id;
      option.textContent = `${c.title} (${c.max_players} jogadores)`;
      select.appendChild(option);
    });
  } catch (err) {
    console.error('❌ Erro ao carregar campeonatos:', err);
    const option = document.createElement('option');
    option.textContent = 'Erro ao carregar campeonatos';
    option.disabled = true;
    select.appendChild(option);
  }
}

// 🔍 Busca usuário
async function searchUser(playerNumber) {
  const inputVisible = document.getElementById(`player${playerNumber}Search`);
  const inputHidden  = document.getElementById(`player${playerNumber}Id`);
  const resultsDiv   = document.getElementById(`results${playerNumber}`);
  const detailsBlock = document.getElementById(`player${playerNumber}Details`);
  const term = inputVisible.value.trim();

  if (!term) return;

  try {
    const res = await fetch(`/api/users?search=${encodeURIComponent(term)}`);
    const users = await res.json();

    resultsDiv.innerHTML = '';
    if (!users.length) {
      resultsDiv.innerHTML = '<div>Usuário não encontrado</div>';
    } else {
      users.forEach(user => {
        const div = document.createElement('div');
        div.textContent = `${user.username} (ID: ${user.id})`;
        div.onclick = () => {
          inputHidden.value = user.id;
          inputVisible.value = user.username;
          inputVisible.style.backgroundColor = '#004d00';
          setTimeout(() => {
            inputVisible.style.backgroundColor = '';
          }, 600);
          resultsDiv.style.display = 'none';
          if (detailsBlock) detailsBlock.style.display = 'flex';
        };
        resultsDiv.appendChild(div);
      });
    }
    resultsDiv.style.display = 'block';
  } catch (err) {
    console.error('❌ Erro na busca:', err);
  }
}

// 📤 Envia o formulário
const form = document.getElementById('matchForm');
const logBox = document.getElementById('log');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());

  console.log("📦 Dados enviados para API do campeonato:", data);

  // Converte campos numéricos (exceto UUID do campeonato)
  for (let key in data) {
    if (key !== 'championship_id') {
      data[key] = parseInt(data[key]);
    }
  }

  try {
    const res = await fetch('/api/championships/match', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const json = await res.json();
    logBox.textContent = JSON.stringify(json, null, 2);
  } catch (err) {
    logBox.textContent = `Erro na requisição:\n${err.message}`;
  }
});

// 🚀 Inicia carregamento dos campeonatos ao abrir a página
document.addEventListener('DOMContentLoaded', carregarCampeonatos);
