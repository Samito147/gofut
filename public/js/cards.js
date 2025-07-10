// 🧠 Extrai parâmetros da URL 
const urlParams = new URLSearchParams(window.location.search);
const userId = urlParams.get('user_id') || null;
const championshipId = urlParams.get('championship_id') || null;
const posicao = urlParams.get('posicao') || null;

function getUsernameFromInjectedVariable() {
  return window.USERNAME || null;
}

const usernameFallback = getUsernameFromInjectedVariable();
let currentUsername = "jogador"; // fallback global

function carregarHistoricoReal(userId) {
  const history = document.getElementById('history');
  history.innerHTML = '';

  fetch(`/api/history?userId=${userId}`, {
    method: 'GET',
    credentials: 'include'
  })
  .then(res => res.ok ? res.json() : Promise.reject(res))
  .then(matches => {
    if (!Array.isArray(matches) || matches.length === 0) {
      for (let i = 0; i < 5; i++) {
        const dot = document.createElement('div');
        dot.className = 'history-dot gray';
        dot.innerText = 'X';
        history.appendChild(dot);
      }
      return;
    }

    matches.slice(0, 5).forEach(match => {
      const you = match.player1 === +userId ? 'player1' : 'player2';
      const opp = you === 'player1' ? 'player2' : 'player1';
      const yourScore = match[`${you}_score`];
      const oppScore = match[`${opp}_score`];

      const dot = document.createElement('div');
      dot.className = 'history-dot';

      if (yourScore > oppScore) dot.classList.add('green');
      else if (yourScore < oppScore) dot.classList.add('red');
      else dot.classList.add('gray');

      history.appendChild(dot);
    });
  })
  .catch(err => {
    console.error("❌ Erro ao carregar histórico real:", err);
  });
}

// 🔄 Lógica de fallback para foto
function carregarFotoPerfil(username) {
  const fotoEl = document.getElementById('player-photo');
  const base = 'https://artrfawxkzeukuddvxkq.supabase.co/storage/v1/object/public/fotos/';
  const jpgUrl = `${base}/${username}.jpg`;
  const pngUrl = `${base}/${username}.png`;

  const imgJPG = new Image();
  imgJPG.onload = () => {
    fotoEl.src = jpgUrl;
  };
  imgJPG.onerror = () => {
    const imgPNG = new Image();
    imgPNG.onload = () => {
      fotoEl.src = pngUrl;
    };
    imgPNG.onerror = () => {
      fotoEl.src = '/assets/fotos/PADRAO.png';
    };
    imgPNG.src = pngUrl;
  };
  imgJPG.src = jpgUrl;
}

function carregarDados(username) {
  currentUsername = username;
  fetch(`/api/championships/player-stats?${userId ? 'user_id=' + userId : 'username=' + username}&championship_id=${championshipId}`, {
    method: 'GET',
    credentials: 'include'
  })
  .then(res => res.ok ? res.json() : Promise.reject(res))
  .then(data => {
    const jogos = data.jogos ?? 0;
    const gols = data.golspro ?? 0;
    const vitorias = data.vitorias ?? 0;

    const mediaGols = jogos > 0 ? (gols / jogos).toFixed(2) : '0.00';
    const porcentagemVitoriasRaw = jogos > 0 ? (vitorias / jogos) * 100 : 0;
    const porcentagemVitorias = porcentagemVitoriasRaw.toFixed(2) + '%';

    document.getElementById('player-name').textContent = username;
    document.getElementById('gols').textContent = mediaGols;

    const vitoriasElement = document.getElementById('vitorias');
    vitoriasElement.textContent = porcentagemVitorias;

    if (porcentagemVitoriasRaw > 50) {
      vitoriasElement.style.color = '#10b981';
    } else if (porcentagemVitoriasRaw >= 40) {
      vitoriasElement.style.color = '#facc15';
    } else {
      vitoriasElement.style.color = '#ef4444';
    }

    const posicaoElement = document.getElementById('posicao');
    if (posicao) {
      posicaoElement.textContent = `${posicao}º`;
      const numero = parseInt(posicao);
      posicaoElement.style.color =
        numero >= 1 && numero <= 3 ? '#10b981' :
        numero >= 17 && numero <= 20 ? '#ef4444' :
        '#ffffff';
    } else {
      posicaoElement.textContent = '-';
      posicaoElement.style.color = '#ffffff';
    }

    carregarFotoPerfil(username); // ✅ Aplicar fallback

    carregarHistoricoReal(userId);

    document.querySelector("[data-label='posicao-label']").innerText = '🏅 POSIÇÃO';
    document.querySelector("[data-label='gols-label']").innerText = '⚽ GOLS';
    document.querySelector("[data-label='vitorias-label']").innerText = '🏆 VITÓRIAS';
  })
  .catch(err => {
    console.error("❌ Erro ao carregar dados do jogador no campeonato:", err);
    document.getElementById('player-name').textContent = 'Desconhecido';
  });
}

if (!userId && !usernameFallback) {
  console.error("❌ ID do jogador (USER_ID) ou USERNAME não fornecidos.");
  document.getElementById('player-name').textContent = 'Desconhecido';
} else if (!championshipId) {
  console.error("❌ ID do campeonato não fornecido (championship_id).");
  document.getElementById('player-name').textContent = 'Desconhecido';
} else {
  if (userId) {
    fetch(`/api/users/by-id?id=${userId}`, {
      method: 'GET',
      credentials: 'include'
    })
    .then(res => res.ok ? res.json() : Promise.reject(res))
    .then(userData => {
      const username = userData.username;
      if (!username) throw new Error('Username não encontrado para o user_id fornecido.');
      carregarDados(username);
    })
    .catch(err => {
      console.error("❌ Erro ao buscar username:", err);
      document.getElementById('player-name').textContent = 'Desconhecido';
    });
  } else {
    console.warn("⚠️ USER_ID não fornecido. Usando fallback com USERNAME.");
    carregarDados(usernameFallback);
  }
}

// 📸 SALVAR PNG + FECHAR com TOAST
document.addEventListener("DOMContentLoaded", () => {
  const shareButton = document.getElementById("btn-share");
  const closeButton = document.getElementById("btn-close");

  const toast = document.createElement("div");
  toast.id = "toast";
  toast.style.position = "fixed";
  toast.style.top = "20px";
  toast.style.left = "50%";
  toast.style.transform = "translateX(-50%)";
  toast.style.padding = "12px 24px";
  toast.style.borderRadius = "8px";
  toast.style.backgroundColor = "#10b981";
  toast.style.color = "#fff";
  toast.style.fontSize = "16px";
  toast.style.fontWeight = "bold";
  toast.style.boxShadow = "0 0 12px rgba(0,0,0,0.25)";
  toast.style.opacity = "0";
  toast.style.transition = "opacity 0.4s ease";
  toast.style.zIndex = "9999";
  toast.style.textAlign = "center";
  toast.innerText = "✅ CARD salvo com sucesso!";
  document.body.appendChild(toast);

  function mostrarToast() {
    toast.style.opacity = "1";
    setTimeout(() => { toast.style.opacity = "0"; }, 2500);
  }

  if (shareButton) {
    shareButton.addEventListener("click", async () => {
      shareButton.style.display = "none";
      closeButton.style.display = "none";

      try {
        const card = document.querySelector(".player-card");
        const scale = 2;

        const dataUrl = await domtoimage.toPng(card, {
          width: card.offsetWidth * scale,
          height: card.offsetHeight * scale,
          style: {
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            width: `${card.offsetWidth}px`,
            height: `${card.offsetHeight}px`,
            boxShadow: "none",
            backgroundColor: "transparent"
          }
        });

        const timestamp = new Date().toISOString().replace(/[-:.]/g, "").slice(0, 15);
        const safeUsername = currentUsername.replace(/\W+/g, "_").toLowerCase();
        const filename = `cartao_${safeUsername}_${timestamp}.png`;

        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        mostrarToast();
      } catch (err) {
        console.error("❌ Erro ao gerar PNG:", err);
        alert("Erro ao tentar salvar o cartão.");
      } finally {
        shareButton.style.display = "block";
        closeButton.style.display = "block";
      }
    });
  }

  if (closeButton) {
    closeButton.addEventListener("click", () => {
      if (window.parent && typeof window.parent.closeModal === 'function') {
        window.parent.closeModal();
      } else {
        const wrapper = document.querySelector('.card-wrapper');
        if (wrapper) {
          wrapper.remove();
        }
      }
    });
  }
});
