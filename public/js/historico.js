async function carregarHistorico(root = document) {
  const container =
    root.querySelector('#history-list') ||
    root.querySelector('#history') ||
    root.getElementById?.('history-list') ||
    root.getElementById?.('history') ||
    null;

  if (!container) return;

  let userId;

  // 🌐 1. Tenta obter da URL (modo LIGA)
  const params = new URLSearchParams(window.location.search);
  if (params.has('userId')) {
    userId = params.get('userId');
  }

  // 👤 2. Se não houver ID, pega do usuário autenticado (modo PERFIL)
  if (!userId) {
    try {
      const resUser = await fetch('/api/profile', {
        method: 'GET',
        credentials: 'include',
        headers: { 'Accept': 'application/json' }
      });
      if (!resUser.ok) throw new Error('Não autenticado');
      const userData = await resUser.json();
      userId = userData.id;
    } catch (e) {
      container.innerHTML = '<p>❌ Erro ao identificar o usuário logado.</p>';
      return;
    }
  }

  try {
    const res = await fetch(`/api/history?userId=${userId}`);
    const matches = await res.json();

    if (!Array.isArray(matches) || matches.length === 0) {
      container.innerHTML = '<p>⚠️ Nenhuma partida encontrada.</p>';
      return;
    }

    container.innerHTML = '';
    matches.forEach(match => {
      const you = match.player1 === +userId ? 'player1' : 'player2';
      const opp = you === 'player1' ? 'player2' : 'player1';

      const yourScore = match[`${you}_score`];
      const oppScore = match[`${opp}_score`];
      const yourCorners = match[`${you}_corners`] ?? 0;
      const yourYellow = match[`${you}_yellow`] ?? 0;
      const yourRed = match[`${you}_red`] ?? 0;
      const oppCorners = match[`${opp}_corners`] ?? 0;
      const oppYellow = match[`${opp}_yellow`] ?? 0;
      const oppRed = match[`${opp}_red`] ?? 0;
      const yourTeam = match[`${you}_team`] ?? 'Desconhecido';
      const oppTeam = match[`${opp}_team`] ?? 'Desconhecido';
      const yourKick = match[`${you}_kick_on_target`] ?? 0;
      const oppKick = match[`${opp}_kick_on_target`] ?? 0;
      const yourPoss = match[`${you}_possession`] ?? 0;
      const oppPoss = match[`${opp}_possession`] ?? 0;

      const yourName = match[`${you}_user`]?.username || `ID ${match[you]}`;
      const oppName = match[`${opp}_user`]?.username || `ID ${match[opp]}`;

      const result =
        yourScore > oppScore ? '✅ Vitória' :
        yourScore < oppScore ? '❌ Derrota' : '🤝 Empate';

      const resultClass =
        yourScore > oppScore ? 'win' :
        yourScore < oppScore ? 'loss' : 'draw';

      const item = document.createElement('div');
      item.className = 'match-entry ' + resultClass;
      item.innerHTML = `
        <div class="match-header">
          <strong>${result}</strong>
          <span class="score">${yourScore} x ${oppScore}</span>
        </div>
        <div class="match-grid">
          <div class="side">
            <p class="player-name"><strong>👤 ${yourName}</strong></p>
            <p><i class="fas fa-futbol"></i> Gols: ${yourScore}</p>
            <p><i class="fas fa-flag"></i> Escanteios: ${yourCorners}</p>
            <p><i class="fas fa-bullseye"></i> Chutes no Gol: ${yourKick}</p>
            <p><i class="fas fa-percentage"></i> Posse: ${yourPoss}%</p>
            <p><i class="fas fa-square yellow"></i> ${yourYellow} <i class="fas fa-square red"></i> ${yourRed}</p>
            <img src="/assets/logos/${yourTeam.toLowerCase().replace(/\s+/g, '-').normalize('NFD').replace(/\p{Diacritic}/gu, '')}.png" alt="${yourTeam}" class="team-logo-large">
          </div>
          <div class="divider"></div>
          <div class="side">
            <p class="player-name"><strong>👤 ${oppName}</strong></p>
            <p><i class="fas fa-futbol"></i> Gols: ${oppScore}</p>
            <p><i class="fas fa-flag"></i> Escanteios: ${oppCorners}</p>
            <p><i class="fas fa-bullseye"></i> Chutes no Gol: ${oppKick}</p>
            <p><i class="fas fa-percentage"></i> Posse: ${oppPoss}%</p>
            <p><i class="fas fa-square yellow"></i> ${oppYellow} <i class="fas fa-square red"></i> ${oppRed}</p>
            <img src="/assets/logos/${oppTeam.toLowerCase().replace(/\s+/g, '-').normalize('NFD').replace(/\p{Diacritic}/gu, '')}.png" alt="${oppTeam}" class="team-logo-large">
          </div>
        </div>
        <p class="date"><i class="fas fa-calendar-alt"></i> ${new Date(match.played_at).toLocaleString()}</p>
      `;
      container.appendChild(item);
    });
  } catch (err) {
    container.innerHTML = '<p>❌ Erro ao carregar histórico.</p>';
    console.error(err);
  }
}

// ✅ Executa automaticamente no PERFIL
if (typeof document !== 'undefined') {
  if (!window.__HISTORICO_AUTOLOAD__) {
    document.addEventListener('DOMContentLoaded', () => carregarHistorico());
  }
}

export default carregarHistorico;
