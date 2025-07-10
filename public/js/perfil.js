// 🔓 FUNÇÕES GLOBAIS PARA O MODAL
function abrirModal() {
  const modal = document.getElementById('modal-config');
  if (modal) modal.classList.add('show');
}

function fecharModal() {
  const modal = document.getElementById('modal-config');
  if (modal) modal.classList.remove('show');
}

document.addEventListener('DOMContentLoaded', async () => {
  const toastError = document.getElementById('toast-error');
  const profileContent = document.getElementById('profile-content');

  try {
    const res = await fetch('/api/profile', {
      method: 'GET',
      credentials: 'include',
      headers: { 'Accept': 'application/json' }
    });

    if (!res.ok) {
      let errMsg = res.statusText;
      try {
        const errJson = await res.json();
        errMsg = errJson.error || errMsg;
      } catch {}
      throw new Error(`${res.status} — ${errMsg}`);
    }

    const data = await res.json();
    const userId = data.id;

    // ✅ FOTO DINÂMICA COM FALLBACK (.jpg → .png → PADRAO) VIA SUPABASE
    const avatarImg = document.getElementById('profile-avatar');
    const baseURL = 'https://artrfawxkzeukuddvxkq.supabase.co/storage/v1/object/public/fotos';
    const jpgPath = `${baseURL}/${data.nick}.jpg`;
    const pngPath = `${baseURL}/${data.nick}.png`;

    avatarImg.src = jpgPath;
    avatarImg.onerror = () => {
      avatarImg.onerror = () => {
        avatarImg.src = '/assets/fotos/PADRAO.png';
      };
      avatarImg.src = pngPath;
    };

    document.getElementById('profile-nick').textContent = data.nick;

    // ✅ FORMATAR NOME: Primeiro Nome + Último Sobrenome
    const nomeSplit = data.fullName.trim().split(' ');
    let nomeFormatado = data.fullName;
    if (nomeSplit.length === 2) {
      nomeFormatado = nomeSplit.join(' ');
    } else if (nomeSplit.length >= 3) {
      nomeFormatado = `${nomeSplit[0]} ${nomeSplit[nomeSplit.length - 1]}`;
    }
    document.getElementById('profile-name').textContent = nomeFormatado;

    document.getElementById('profile-age').textContent = data.age + ' anos';

    document.getElementById('stat-played').textContent = data.stats.played;
    document.getElementById('stat-goals').textContent = data.stats.goals;
    document.getElementById('stat-victories').textContent = data.stats.victories;
    document.getElementById('stat-losses').textContent = data.stats.losses;
    document.getElementById('stat-draws').textContent = data.stats.draws;
    document.getElementById('stat-yellow').textContent = data.stats.yellow ?? 0;
    document.getElementById('stat-red').textContent = data.stats.red ?? 0;

    const avgCorners = (Number(data.stats.corners) || 0) / (Number(data.stats.played) || 1);
    document.getElementById('stat-corners').textContent = avgCorners.toFixed(1);

    const avgChutes = (Number(data.stats.chutes) || 0) / (Number(data.stats.played) || 1);
    document.getElementById('stat-kick-on-target').textContent = avgChutes.toFixed(1);

    const avgPossession = (Number(data.stats.possession) || 0) / (Number(data.stats.played) || 1);
    document.getElementById('stat-possession').textContent = avgPossession.toFixed(1) + '%';

    const winPct = ((data.stats.victories || 0) / (data.stats.played || 1)) * 100;
    const drawPct = ((data.stats.draws || 0) / (data.stats.played || 1)) * 100;
    const lossPct = ((data.stats.losses || 0) / (data.stats.played || 1)) * 100;

    const svg = document.querySelector('.efficiency-circle svg');
    if (svg) {
      const radius = svg.querySelector('circle.bg').r.baseVal.value;
      const circumference = 2 * Math.PI * radius;
      svg.querySelectorAll('circle.segment').forEach(c => c.remove());
      const addSegment = (color, offset, pct) => {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('class', 'segment');
        circle.setAttribute('r', radius);
        circle.setAttribute('cx', '50%');
        circle.setAttribute('cy', '50%');
        circle.style.fill = 'none';
        circle.style.stroke = color;
        circle.style.strokeWidth = '8';
        circle.style.strokeDasharray = `${(circumference * pct) / 100} ${circumference}`;
        circle.style.strokeDashoffset = circumference * (1 - offset / 100);
        svg.appendChild(circle);
      };
      addSegment('#4caf50', 0, winPct);
      addSegment('#9e9e9e', winPct, drawPct);
      addSegment('#f44336', winPct + drawPct, lossPct);
      document.getElementById('efficiency-text').textContent = Math.round(winPct) + '%';
    }

    // 🔽 Tabela de estatísticas + Histórico visual
    const tableBody = document.getElementById('stats-table-body');
    const histEl = document.getElementById('match-history');

    try {
      const resHist = await fetch(`/api/history?userId=${userId}`);
      const partidas = await resHist.json();
      const fullHistoryEl = document.getElementById('history');

      histEl.innerHTML = '';

      if (Array.isArray(partidas) && partidas.length) {
        const ultimosResultados = partidas.slice(-5).map(match => {
          const you = match.player1 === userId ? 'player1' : 'player2';
          const opp = you === 'player1' ? 'player2' : 'player1';

          const yourScore = match[`${you}_score`];
          const oppScore = match[`${opp}_score`];

          if (yourScore > oppScore) return 'win';
          if (yourScore < oppScore) return 'loss';
          return 'draw';
        });

        ultimosResultados.forEach(result => {
          const dot = document.createElement('span');
          dot.classList.add('match', result);
          histEl.appendChild(dot);
        });
      } else {
        for (let i = 0; i < 5; i++) {
          const dot = document.createElement('span');
          dot.classList.add('match', 'empty');
          dot.textContent = 'X';
          histEl.appendChild(dot);
        }
      }

      if (Array.isArray(partidas) && partidas.length) {
        fullHistoryEl.innerHTML = '';
        tableBody.innerHTML = '';
        partidas.forEach((match, i) => {
          const you = match.player1 === userId ? 'player1' : 'player2';
          const opp = you === 'player1' ? 'player2' : 'player1';

          const yourScore = match[`${you}_score`];
          const oppScore = match[`${opp}_score`];
          const yourCorners = match[`${you}_corners`] ?? 0;
          const yourYellow = match[`${you}_yellow`] ?? 0;
          const yourRed = match[`${you}_red`] ?? 0;
          const result =
            yourScore > oppScore ? '✅ Vitória' :
            yourScore < oppScore ? '❌ Derrota' : '🤝 Empate';

          const row = document.createElement('tr');
          row.innerHTML = `
            <td>${i + 1}</td>
            <td>${result}</td>
            <td>${yourScore}</td>
            <td>${yourCorners}</td>
            <td><span style="color:#f1c40f;">${yourYellow}</span> / <span style="color:#e74c3c;">${yourRed}</span></td>
            <td>${new Date(match.played_at).toLocaleDateString()}</td>
          `;
          tableBody.appendChild(row);
        });
      } else {
        tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">⚠️ Nenhuma estatística encontrada.</td></tr>';
      }
    } catch (err) {
      console.warn('Erro ao carregar histórico:', err);
    }

    // 🔥 NOVA FUNÇÃO: carregar conquistas REAL da nova tabela
    const achievementsEl = document.getElementById('achievements');
    try {
      const resAch = await fetch(`/api/achievements?userId=${userId}`);
      const achievements = await resAch.json();

      achievementsEl.innerHTML = '';
      if (Array.isArray(achievements) && achievements.length) {
        achievements.forEach(ach => {
          const box = document.createElement('div');
          box.className = 'achievement-box';
          box.innerHTML = `
            <div class="icon"><i class="${ach.icon}"></i></div>
            <div class="content">
              <h3>${ach.title}</h3>
              <p>${ach.description}</p>
            </div>
          `;
          achievementsEl.appendChild(box);
        });
      } else {
        achievementsEl.innerHTML = '<p style="text-align:center; color:#999;">⚠️ Nenhuma conquista obtida ainda.</p>';
      }
    } catch (err) {
      console.warn('Erro ao carregar conquistas:', err);
    }

    // Tabs
    const tabs = document.querySelectorAll('.tabs button');
    const panels = document.querySelectorAll('.tab-content > div');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        panels.forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById(tab.dataset.tab).classList.add('active');
      });
    });

    // ✅ Exibe o conteúdo somente após carregar tudo
    if (profileContent) profileContent.style.display = 'block';

    // ✅ FILTRO DE QUANTIDADE DE CARDS VISÍVEIS POR PÁGINA
    const container = document.getElementById('history');
    const filtroWrapper = document.createElement('div');
    filtroWrapper.style = 'margin-bottom:1rem; display:flex; align-items:center; gap:0.5rem; justify-content:end; flex-wrap:wrap;';
    const filtroLabel = document.createElement('label');
    filtroLabel.textContent = 'Exibir:';
    filtroLabel.style = 'color:#ccc;';
    const filtroSelect = document.createElement('select');
    filtroSelect.innerHTML = '<option value="1">1</option><option value="5">5</option><option value="10">10</option>';
    filtroSelect.style = 'background:#111; color:#fff; border:1px solid #333; padding:4px 8px; border-radius:4px;';
    filtroWrapper.appendChild(filtroLabel);
    filtroWrapper.appendChild(filtroSelect);
    container.prepend(filtroWrapper);

    let cardsPorPagina = parseInt(filtroSelect.value);
    let paginaAtual = 1;

    const renderizarCards = () => {
      const cards = [...container.querySelectorAll('.match-entry')];
      const inicio = (paginaAtual - 1) * cardsPorPagina;
      const fim = inicio + cardsPorPagina;
      cards.forEach((card, i) => {
        card.style.display = (i >= inicio && i < fim) ? 'block' : 'none';
      });
    };

    filtroSelect.addEventListener('change', () => {
      cardsPorPagina = parseInt(filtroSelect.value);
      paginaAtual = 1;
      renderizarCards();
    });

    setTimeout(renderizarCards, 500);

  } catch (err) {
    console.error('🛑 perfil.js erro:', err);
    toastError.textContent = `❌ ${err.message}`;
    toastError.classList.add('show');
  }
});

// ✅ EXPÕE A FUNÇÃO GLOBAL PARA FECHAR O MODAL DE DENTRO DO IFRAME
window.closeModal = fecharModal;
