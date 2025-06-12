// js/resultados.js

// 1️⃣ Rank dinâmico
fetch('js/tabela.js')
  .then(res => res.text())
  .then(html => {
    const match = html.match(/const jogadores\s*=\s*(\[[\s\S]*?\]);/);
    const jogadores = match
      ? Function('"use strict";return ' + match[1])()
      : [];
    jogadores.sort((a, b) => b.pontos - a.pontos);
    const rankMap = {};
    jogadores.forEach((j, i) => rankMap[j.nome] = i + 1);

    document.querySelectorAll('.team-block').forEach(block => {
      const nome = block.querySelector('.team-name').textContent.trim();
      const span = block.querySelector('.team-rank');
      const rank = rankMap[nome] || '–';
      span.textContent = rank;
      span.classList.remove('rank-top', 'rank-mid', 'rank-bottom');
      if (rank >= 1 && rank <= 3) span.classList.add('rank-top');
      else if (rank <= 16)        span.classList.add('rank-mid');
      else                         span.classList.add('rank-bottom');
    });
  })
  .catch(console.error);

// 2️⃣ Realça vencedores/derrotas/empates
function highlightBoard(board) {
  const s1 = +board.dataset.team1Score, s2 = +board.dataset.team2Score;
  const a1 = board.querySelector('.team1 .avatar, .team1 canvas'),
        a2 = board.querySelector('.team2 .avatar, .team2 canvas');
  const sc1 = board.querySelector('.team1-score'),
        sc2 = board.querySelector('.team2-score');

  if (s1 > s2) {
    a1.classList.add('winner'); sc1.classList.add('winner');
    a2.classList.add('loser');  sc2.classList.add('loser');
  } else if (s2 > s1) {
    a2.classList.add('winner'); sc2.classList.add('winner');
    a1.classList.add('loser');  sc1.classList.add('loser');
  } else {
    [a1, a2, sc1, sc2].forEach(el => el.classList.add('draw'));
  }
}

// 3️⃣ Ao carregar a página
window.addEventListener('load', () => {
  document.querySelectorAll('.scoreboard').forEach(board => {
    highlightBoard(board);
  });

  // Alta qualidade para avatar Samito
  document.querySelectorAll('img.avatar[src="../assets/fotos/Samuel.png"]').forEach(imgEl => {
    const cssW = imgEl.clientWidth, cssH = imgEl.clientHeight;
    const comp = getComputedStyle(imgEl), dpr = window.devicePixelRatio || 1;
    const canvas = document.createElement('canvas');
    canvas.width  = cssW * dpr;
    canvas.height = cssH * dpr;
    canvas.style.width  = cssW + 'px';
    canvas.style.height = cssH + 'px';
    canvas.className    = imgEl.className;
    canvas.style.borderRadius = comp.borderRadius;
    canvas.style.border       = comp.border;
    canvas.style.objectFit    = 'cover';
    canvas.style.display      = 'block';
    canvas.style.marginBottom = comp.marginBottom;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    const hiRes = new Image();
    hiRes.src = imgEl.src;
    hiRes.onload = () => {
      ctx.drawImage(hiRes, 0, 0, cssW, cssH);
      imgEl.replaceWith(canvas);
    };
  });
});

// 4️⃣ Compartilhamento PNG com fundo transparente
document.addEventListener('click', e => {
  if (e.target.classList.contains('share-icon')) {
    const board = e.target.closest('.scoreboard');
    const icon = board.querySelector('.share-icon');
    icon.style.display = 'none';
    html2canvas(board, {
      useCORS: true,
      scale: (window.devicePixelRatio || 1) * 2,
      backgroundColor: null
    }).then(canvas => {
      icon.style.display = '';  // restaura ícone
      canvas.toBlob(blob => {
        const file = new File([blob], 'card.png', { type: 'image/png' });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          navigator.share({ files: [file] }).catch(console.error);
        } else {
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = 'card.png';
          link.click();
        }
      });
    });
  }
});
