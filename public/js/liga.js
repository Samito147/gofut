// Priorizar Menu
document.addEventListener("DOMContentLoaded", () => {
  const checkMenu = () => {
    const menuNav = document.querySelector('#menu-placeholder nav.navbar');
    if (menuNav) {
      const main = document.getElementById('main-content');
      main.style.visibility = 'visible';
      main.style.opacity = '1';
    } else {
      setTimeout(checkMenu, 50);
    }
  };
  checkMenu();
});

// 1️⃣ Buscar jogadores do backend
async function fetchJogadores() {
  try {
    const res = await fetch('/api/tabela');
    if (!res.ok) throw new Error("Erro ao buscar jogadores.");
    const data = await res.json();
    return data.jogadores || [];
  } catch (e) {
    console.error(e);
    return [];
  }
}

// 🧠 Verifica se a imagem do jogador existe — com cache otimizado
const imagemCache = {};
function verificarImagem(src) {
  if (imagemCache.hasOwnProperty(src)) {
    return Promise.resolve(imagemCache[src]);
  }

  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      imagemCache[src] = true;
      resolve(true);
    };
    img.onerror = () => {
      imagemCache[src] = false;
      resolve(false);
    };
    img.src = src;
  });
}

// 2️⃣ Renderizar a tabela
async function renderizarTabela() {
  const tabela = document.getElementById("tabela-corpo");
  if (!tabela) {
    console.error("Elemento #tabela-corpo não encontrado.");
    return;
  }

  try {
    let jogadores = await fetchJogadores();

    jogadores = jogadores.slice().sort((a, b) => b.pontos - a.pontos);
    while (jogadores.length < 20) {
      jogadores.push({
        nome: 'VAGA DISPONÍVEL',
        pontos: 0,
        jogos: 0,
        vitorias: 0,
        empates: 0,
        derrotas: 0,
        golsPro: 0,
        golsContra: 0,
        saldoGols: 0,
        vermelhos: 0
      });
    }

    const linhas = await Promise.all(jogadores.map(async (jog, i) => {
      const rank = i + 1;
      const first = i === 0;
      const last = i === jogadores.length - 1;

      let avatarSrc = "https://cdn-icons-png.flaticon.com/512/3665/3665923.png";
if (jog.nome !== "VAGA DISPONÍVEL") {
  const username = jog.username ?? null; // <- deve vir da API
  const base = "https://artrfawxkzeukuddvxkq.supabase.co/storage/v1/object/public/fotos";
  const jpgPath = username ? `${base}/${username}.jpg` : "";
  const pngPath = username ? `${base}/${username}.png` : "";

  const existeJPG = await verificarImagem(jpgPath);
  if (existeJPG) {
    avatarSrc = jpgPath;
  } else {
    const existePNG = await verificarImagem(pngPath);
    avatarSrc = existePNG ? pngPath : "/assets/fotos/PADRAO.png";
  }
}


      let cls = "avatar";
      if (first) cls += " first-place-avatar";
      if (last) cls += " last-place-avatar";

      const rowCls = [
        first ? "first-place-row" : "",
        i === 1 ? "second-place-row" : "",
        i === 2 ? "third-place-row" : "",
        last ? "last-place-row" : "",
        i === jogadores.length - 2 ? "penultimate-place-row" : "",
        i === 17 ? "eighteenth-place-row" : "",
        i === 16 ? "seventeenth-place-row" : ""
      ].filter(Boolean).join(" ");

      const icon = jog.nome === "VAGA DISPONÍVEL" ? "🆓" :
                   first ? "🏆" : i === 1 ? "🥈" : i === 2 ? "🥉" : last ? "💀" : "";

      const filename = jog.nome === "VAGA DISPONÍVEL" 
        ? "#" 
        : `/assets/cards/campeonatos.html?user_id=${encodeURIComponent(jog.user_id)}&championship_id=${encodeURIComponent(jog.championship_id)}&posicao=${rank}`;

      const avatarClick = jog.nome === "VAGA DISPONÍVEL" ? '' : `onclick="openModal('${filename}')"`;      
      const nameClick = jog.nome === "VAGA DISPONÍVEL" ? '' : `onclick="openModal('${filename}')"`;      
      const nameClass = jog.nome === "VAGA DISPONÍVEL" ? 'vaga-disponivel' : '';

      return `
        <tr class="${rowCls}">
          <td class="player-info">
            <span class="icon">${icon}</span>
            <span class="ranking">${rank}</span>
            <img src="${avatarSrc}" alt="Avatar de ${jog.nome}" class="${cls}" ${avatarClick}/>
            <span class="${nameClass}" ${nameClick}>${jog.nome}</span>
          </td>
          <td><strong>${jog.pontos}</strong></td>
          <td>${jog.jogos}</td>
          <td>${jog.vitorias}</td>
          <td>${jog.empates}</td>
          <td>${jog.derrotas}</td>
          <td>${jog.golsPro}</td>
          <td>${jog.golsContra}</td>
          <td>${jog.saldoGols}</td>
          <td class="highlight-vermelhos">${jog.vermelhos}</td>
        </tr>`;
    }));

    tabela.innerHTML = linhas.join("");

  } catch (err) {
    console.error("Erro ao renderizar tabela:", err);
    tabela.innerHTML = `<tr><td colspan="10">Erro ao carregar tabela.</td></tr>`;
  }
}

// 🔐 Verificar autenticação real via API
async function verificarAutenticacao() {
  try {
    const res = await fetch('/api/session', { credentials: 'include' });
    const json = await res.json();
    return Boolean(json.isLoggedIn);
  } catch (e) {
    console.error("Erro ao verificar autenticação:", e);
    return false;
  }
}

// 3️⃣ Modal dinâmico para perfil (CARD de jogador)
function resizeIframe(ifr) {
  try {
    const h = ifr.contentDocument.documentElement.scrollHeight;
    ifr.style.height = h + "px";
  } catch (e) {}
}

async function openModal(page) {
  const m = document.getElementById("modal"),
        b = document.getElementById("modal-body"),
        modalClose = document.querySelector(".modal-close");

  const isCardDeJogador = page.includes("campeonatos.html");
  const logado = await verificarAutenticacao();

  if (isCardDeJogador && !logado) {
    m.style.display = "flex";
    modalClose.style.display = "block";
    m.classList.remove('no-background');
    b.innerHTML = `
      <h2 style="font-size: 1.4em; margin-bottom: 20px; color: #fff; text-align: center;">
        🔒 Conteúdo exclusivo para usuários:
      </h2>
      <div class="botoes-card-bloqueado" style="display: flex; justify-content: center; gap: 20px;">
        <a href="/login.html" class="btn-login">Entrar</a>
        <a href="/cadastro.html" class="btn-cadastro">Cadastre-se</a>
      </div>
    `;
    return;
  }

  if (isCardDeJogador) {
    modalClose.style.display = "none";
    m.classList.add('no-background');
  } else {
    modalClose.style.display = "block";
    m.classList.remove('no-background');
  }

  m.style.display = "flex";
  b.innerHTML = `
    <iframe
      src="${page}"
      sandbox="allow-scripts allow-same-origin allow-downloads allow-popups allow-forms"
      onload="resizeIframe(this)">
    </iframe>`;
}

function closeModal() {
  document.getElementById("modal").style.display = "none";
}

// 🧨 Fecha modal via X externo (mantido)
document.querySelector(".modal-close").addEventListener("click", closeModal);

// 🚀 Iniciar tabela
document.addEventListener("DOMContentLoaded", renderizarTabela);

// 4️⃣ Novo! Modal de conteúdo (Regulamento, Premiação)
function abrirModalConteudo(pagina) {
  const m = document.getElementById("modal"),
        b = document.getElementById("modal-body"),
        modalClose = document.querySelector(".modal-close");

  modalClose.style.display = "block";
  m.classList.remove('no-background');
  m.style.display = "flex";
  b.innerHTML = "<p>⏳ Carregando conteúdo...</p>";

  fetch(pagina)
    .then(r => r.ok ? r.text() : Promise.reject())
    .then(html => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const conteudo = doc.querySelector('.container') || doc.body;

      b.innerHTML = "";

      const style = document.createElement('style');
      style.textContent = `@import url("/css/regulamento.css");`;
      b.appendChild(style);

      const clonedContent = conteudo.cloneNode(true);
      clonedContent.style.opacity = '0';
      clonedContent.style.transition = 'opacity 0.3s ease';

      b.appendChild(clonedContent);
      requestAnimationFrame(() => {
        clonedContent.style.opacity = '1';
      });

      if (pagina.includes('regulamento.html')) {
        import('/js/regulamento.js')
          .then(module => {
            if (module && typeof module.ativarRegulamentoExpand === 'function') {
              module.ativarRegulamentoExpand(b);
            }
          })
          .catch(console.error);
      }
    })
    .catch(() => {
      b.innerHTML = "<p>❌ Erro ao carregar conteúdo.</p>";
    });
}
