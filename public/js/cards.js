// 🧠 Extrai parâmetros da URL
const urlParams = new URLSearchParams(window.location.search);
const userId = urlParams.get('user_id') || null;
const championshipId = urlParams.get('championship_id') || null;
const posicao = urlParams.get('posicao') || null;  // NOVO - extrai posicao

// 🧠 Extrai o USERNAME como fallback (se você ainda quiser permitir fallback manual)
function getUsernameFromInjectedVariable() {
  return window.USERNAME || null;
}

const usernameFallback = getUsernameFromInjectedVariable();

if (!userId && !usernameFallback) {
  console.error("❌ ID do jogador (USER_ID) ou USERNAME não fornecidos.");
  document.getElementById('player-name').textContent = 'Desconhecido';
} else if (!championshipId) {
  console.error("❌ ID do campeonato não fornecido (championship_id).");
  document.getElementById('player-name').textContent = 'Desconhecido';
} else {
  // Se temos USER_ID → fluxo padrão completo
  if (userId) {
    // 🔍 Primeiro busca USERNAME correspondente ao USER_ID
    fetch(`/api/users/by-id?id=${userId}`, {
      method: 'GET',
      credentials: 'include'
    })
    .then(res => res.ok ? res.json() : Promise.reject(res))
    .then(userData => {
      const username = userData.username;

      if (!username) {
        throw new Error('Username não encontrado para o user_id fornecido.');
      }

      // 🚀 Agora carrega dados do jogador na tabela CHAMPIONSHIP_PLAYERS
      return fetch(`/api/championships/player-stats?user_id=${userId}&championship_id=${championshipId}`, {
        method: 'GET',
        credentials: 'include'
      })
      .then(res => res.ok ? res.json() : Promise.reject(res))
      .then(data => {
        const gols = data.golspro ?? 0;
        const vitorias = data.vitorias ?? 0;
        const derrotas = data.derrotas ?? 0;       // NOVO
        const saldo = data.saldo_gols ?? 0;        // NOVO

        document.getElementById('player-name').textContent = username;
        document.getElementById('gols').textContent = gols;
        document.getElementById('vitorias').textContent = vitorias;
        document.getElementById('derrotas').textContent = derrotas;    // NOVO
        document.getElementById('saldo').textContent = saldo;          // NOVO

        // ✅ Preencher POSIÇÃO se disponível
        if (posicao) {
          document.getElementById('posicao').textContent = `${posicao}º`;
        } else {
          document.getElementById('posicao').textContent = '-';
        }

        // ✅ Tenta carregar a imagem do jogador
        const foto = new Image();
        foto.onload = () => {
          document.getElementById('player-photo').src = `/assets/fotos/${username}.png`;
        };
        foto.onerror = () => {
          console.warn(`⚠️ Imagem de ${username}.png não encontrada. Usando padrão.`);
          document.getElementById('player-photo').src = '/assets/fotos/padrao.jpg';
        };
        foto.src = `/assets/fotos/${username}.png`;
      });
    })
    .catch(err => {
      console.error("❌ Erro ao carregar dados do jogador no campeonato:", err);
      document.getElementById('player-name').textContent = 'Desconhecido';
    });
  } 
  // Se não temos USER_ID mas temos USERNAME → fallback limitado
  else if (usernameFallback) {
    console.warn("⚠️ USER_ID não fornecido. Usando fallback com USERNAME.");
    
    // 🚀 Carrega dados do campeonato baseado em USERNAME (se sua API suportar username também)
    fetch(`/api/championships/player-stats?username=${usernameFallback}&championship_id=${championshipId}`, {
      method: 'GET',
      credentials: 'include'
    })
    .then(res => res.ok ? res.json() : Promise.reject(res))
    .then(data => {
      const gols = data.golspro ?? 0;
      const vitorias = data.vitorias ?? 0;
      const derrotas = data.derrotas ?? 0;       // NOVO
      const saldo = data.saldo_gols ?? 0;        // NOVO

      document.getElementById('player-name').textContent = usernameFallback;
      document.getElementById('gols').textContent = gols;
      document.getElementById('vitorias').textContent = vitorias;
      document.getElementById('derrotas').textContent = derrotas;    // NOVO
      document.getElementById('saldo').textContent = saldo;          // NOVO

      // ✅ Preencher POSIÇÃO se disponível
      if (posicao) {
        document.getElementById('posicao').textContent = `${posicao}º`;
      } else {
        document.getElementById('posicao').textContent = '-';
      }

      // ✅ Tenta carregar a imagem do jogador
      const foto = new Image();
      foto.onload = () => {
        document.getElementById('player-photo').src = `/assets/fotos/${usernameFallback}.png`;
      };
      foto.onerror = () => {
        console.warn(`⚠️ Imagem de ${usernameFallback}.png não encontrada. Usando padrão.`);
        document.getElementById('player-photo').src = '/assets/fotos/padrao.jpg';
      };
      foto.src = `/assets/fotos/${usernameFallback}.png`;
    })
    .catch(err => {
      console.error("❌ Erro ao carregar dados do jogador no campeonato (fallback USERNAME):", err);
      document.getElementById('player-name').textContent = 'Desconhecido';
    });
  }
}
