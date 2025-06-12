document.addEventListener('DOMContentLoaded', async () => {
  const toastError = document.getElementById('toast-error');
  const main = document.querySelector('main.profile-page');

  main.style.visibility = 'visible';
  main.style.opacity = '1';

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

    document.getElementById('profile-avatar').src = data.avatarUrl;
    document.getElementById('profile-nick').textContent = data.nick;
    document.getElementById('profile-name').textContent = data.fullName;
    document.getElementById('profile-age').textContent = data.age + ' anos';

    document.getElementById('profile-elo').textContent = data.stats?.elo ?? '--';
    document.getElementById('profile-class').textContent = data.stats?.rank_class ?? '--';
    const createdAt = data.created_at;
    if (createdAt) {
      const dataObj = new Date(createdAt);
      const dia = String(dataObj.getDate()).padStart(2, '0');
      const mes = String(dataObj.getMonth() + 1).padStart(2, '0');
      const ano = dataObj.getFullYear();
      document.getElementById('profile-member-since').textContent = `Membro desde: ${dia}/${mes}/${ano}`;
    }

    document.getElementById('stat-played').textContent = data.stats.played;
    document.getElementById('stat-goals').textContent = data.stats.goals;
    document.getElementById('stat-victories').textContent = data.stats.victories;
    document.getElementById('stat-losses').textContent = data.stats.losses;
    document.getElementById('stat-draws').textContent = data.stats.draws;
    document.getElementById('stat-yellow').textContent = data.stats.yellow ?? 0;
    document.getElementById('stat-red').textContent = data.stats.red ?? 0;

    const avgCorners = (Number(data.stats.corners) || 0) / (Number(data.stats.played) || 1);
    document.getElementById('stat-corners').textContent = avgCorners.toFixed(1);

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

    const histEl = document.getElementById('match-history');
    histEl.innerHTML = '';
    (data.stats.history || ['win', 'loss', 'draw', 'win', 'loss']).slice(-5).forEach(result => {
      const dot = document.createElement('span');
      dot.classList.add('match', result);
      histEl.appendChild(dot);
    });

    // 🔽 NOVO TRECHO: tabela de estatísticas
    const tableBody = document.getElementById('stats-table-body');

    try {
      const resHist = await fetch(`/api/history?userId=${userId}`);
      const partidas = await resHist.json();
      const fullHistoryEl = document.getElementById('history');
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

          const yourName = match[`${you}_user`]?.username || `ID ${match[you]}`;
          const oppName = match[`${opp}_user`]?.username || `ID ${match[opp]}`;
          const oppCorners = match[`${opp}_corners`] ?? 0;
          const oppYellow = match[`${opp}_yellow`] ?? 0;
          const oppRed = match[`${opp}_red`] ?? 0;
          const yourTeam = match[`${you}_team`] ?? 'Desconhecido';
          const oppTeam = match[`${opp}_team`] ?? 'Desconhecido';
          const yourKick = match[`${you}_kick_on_target`] ?? 0;
          const oppKick = match[`${opp}_kick_on_target`] ?? 0;
          const yourPoss = match[`${you}_possession`] ?? 0;
          const oppPoss = match[`${opp}_possession`] ?? 0;

          const item = document.createElement('div');
          item.className = 'match-entry ' + (result.includes('Vitória') ? 'win' : result.includes('Derrota') ? 'loss' : 'draw');
          item.innerHTML = `
            <div class="match-header">
              <strong>${result}</strong>
              <span class="score">${yourScore} x ${oppScore}</span>
            </div>
            <div class="match-grid">
              <div class="side" style="position:relative;">
                <p class="player-name"><strong>👤 ${yourName}</strong></p>
                <p><i class="fas fa-futbol"></i> Gols: ${yourScore}</p>
                <p><i class="fas fa-flag"></i> Escanteios: ${yourCorners}</p>
                <p><i class="fas fa-bullseye"></i> Chutes no Gol: ${yourKick}</p>
                <p><i class="fas fa-percentage"></i> Posse: ${yourPoss}%</p>
                <p><i class="fas fa-square yellow"></i> ${yourYellow} <i class="fas fa-square red"></i> ${yourRed}</p>
                <img src="/assets/logos/${yourTeam.toLowerCase().replace(/\s+/g, '-').normalize('NFD').replace(/\p{Diacritic}/gu, '')}.png"
                     alt="${yourTeam}" class="team-logo-large">
              </div>
              <div class="divider"></div>
              <div class="side" style="position:relative;">
                <p class="player-name"><strong>👤 ${oppName}</strong></p>
                <p><i class="fas fa-futbol"></i> Gols: ${oppScore}</p>
                <p><i class="fas fa-flag"></i> Escanteios: ${oppCorners}</p>
                <p><i class="fas fa-bullseye"></i> Chutes no Gol: ${oppKick}</p>
                <p><i class="fas fa-percentage"></i> Posse: ${oppPoss}%</p>
                <p><i class="fas fa-square yellow"></i> ${oppYellow} <i class="fas fa-square red"></i> ${oppRed}</p>
                <img src="/assets/logos/${oppTeam.toLowerCase().replace(/\s+/g, '-').normalize('NFD').replace(/\p{Diacritic}/gu, '')}.png"
                     alt="${oppTeam}" class="team-logo-large">
              </div>
            </div>
            <p class="date"><i class="fas fa-calendar-alt"></i> ${new Date(match.played_at).toLocaleString()}</p>`;
          fullHistoryEl.appendChild(item);
        });
      } else {
        tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">⚠️ Nenhuma estatística encontrada.</td></tr>';
      }
    } catch (err) {
      console.warn('Erro ao carregar histórico:', err);
    }

    // 🔥 NOVA FUNÇÃO: carregar conquistas
    const achievementsEl = document.getElementById('achievements');
    if (Array.isArray(data.achievements) && data.achievements.length) {
      achievementsEl.innerHTML = '';
      data.achievements.forEach(ach => {
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
    }

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

  } catch (err) {
    console.error('🛑 perfil.js erro:', err);
    toastError.textContent = `❌ ${err.message}`;
    toastError.classList.add('show');
  }
});
