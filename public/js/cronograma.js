// script de rank dinâmico
fetch('js/index.js')
  .then(res => res.text())
  .then(html => {
    const match = html.match(/const jogadores\s*=\s*(\[[\s\S]*?\]);/);
    const jogadores = match
      ? Function('"use strict";return ' + match[1])()
      : [];
    jogadores.sort((a,b)=> b.pontos - a.pontos);
    const rankMap = {};
    jogadores.forEach((j,i)=> rankMap[j.nome] = i+1);

    document.querySelectorAll('.player').forEach(player => {
      const nameEl = player.querySelector('.team-name');
      const span   = player.querySelector('.team-rank');
      const nome   = nameEl.textContent.trim();
      const rank   = rankMap[nome] || '–';

      span.textContent = rank;
      span.classList.remove('rank-top','rank-mid','rank-bottom');
      if (rank >= 1 && rank <= 3)       span.classList.add('rank-top');
      else if (rank >= 4 && rank <= 16) span.classList.add('rank-mid');
      else                               span.classList.add('rank-bottom');
    });
  })
  .catch(console.error);
