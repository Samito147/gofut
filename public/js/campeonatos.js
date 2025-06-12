import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabase = createClient(
  'https://artrfawxkzeukuddvxkq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFydHJmYXd4a3pldWt1ZGR2eGtxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzMTYyMjksImV4cCI6MjA2Mzg5MjIyOX0.z2ofiYiv6Un4dVOcRgn12P19TnYyHBR99OVBw-bEB_g'
);

document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('campeonatos-lista');

  try {
    // 🔐 Buscar perfil do usuário autenticado
    const resUser = await fetch('/api/profile', {
      credentials: 'include',
      headers: { 'Accept': 'application/json' }
    });

    if (!resUser.ok) throw new Error('Erro ao buscar perfil');
    const user = await resUser.json();

    if (!user || user.error) {
      container.innerHTML = '<p>Você precisa estar logado para ver os campeonatos.</p>';
      return;
    }

    const userId = user.id;
    const userElo = user.stats?.elo ?? 1000;

    // 📡 Buscar campeonatos ativos
    const resCamp = await fetch('/api/campeonatos');
    if (!resCamp.ok) {
      const textoErro = await resCamp.text();
      throw new Error(`Erro ${resCamp.status} ao buscar campeonatos:\n${textoErro}`);
    }

    const campeonatos = await resCamp.json();
    container.innerHTML = '';

    campeonatos.forEach(camp => {
      const elegivel = userElo >= camp.min_elo && userElo <= camp.max_elo;
      if (!camp.ativo) return; // ⛔ ainda vamos respeitar campo "ativo"

      const div = document.createElement('div');
      div.classList.add('campeonato-card');

      const inscrito = camp.jogadores.includes(userId);
      const vagasRestantes = 20 - camp.jogadores.length;

      // 🔥 Gerar o nome da imagem baseado no título
      const slugTitle = camp.title
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // remove acentos
        .toLowerCase()
        .replace(/\s+/g, '-') // espaços por hífens
        .replace(/[^a-z0-9\-]/g, ''); // remove outros caracteres inválidos

      const bannerUrl = `/assets/banners/${slugTitle}.png`;

      // 🎁 Dados do banco FORMATADOS:
      const dataInicio = camp.inicio
        ? new Date(camp.inicio).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
        : '---';

      const premioTotal = camp.premio
        ? `R$ ${Number(camp.premio).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
        : '---';

      const valorInscricao = camp.inscricao
        ? `R$ ${Number(camp.inscricao).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
        : '---';

      // 🎨 Cor dos ícones (dinâmica):
      const iconeColorStyle = camp.cor && camp.cor.trim() !== ''
        ? `style="color: ${camp.cor};"`
        : '';

      // 🔄 Determinar estado do botão
      let botaoHtml = '';

      if (inscrito) {
        botaoHtml = `<button class="inscrito" disabled>✅ Inscrito</button>`;
      } else if (vagasRestantes <= 0) {
        botaoHtml = `<p class="fechado">Campeonato completo</p>`;
      } else if (!elegivel) {
        // ELO insuficiente → botão desativado visível
        botaoHtml = `<button class="btn-inscrever" disabled title="Seu ELO atual não permite inscrição">INSCREVER</button>`;
      } else {
        // ELO permitido → botão normal
        botaoHtml = `<button class="btn-inscrever" data-id="${camp.id}">INSCREVER</button>`;
      }

      div.innerHTML = `
        <img class="banner" src="${bannerUrl}" alt="Banner do campeonato"/>
        <h3>${camp.title}</h3>

        <div class="info-block">
          <p><i class="fas fa-calendar-alt" ${iconeColorStyle}></i> <strong>Início:</strong> ${dataInicio}</p>
          <p><i class="fas fa-trophy" ${iconeColorStyle}></i> <strong>Prêmio Total:</strong> ${premioTotal}</p>
          <p><i class="fas fa-credit-card" ${iconeColorStyle}></i> <strong>Inscrição:</strong> ${valorInscricao}</p>
          <p><i class="fas fa-users" ${iconeColorStyle}></i> <strong>Participantes:</strong> ${camp.jogadores.length} / ${camp.max_players}</p>
          <p><i class="fas fa-chart-line" ${iconeColorStyle}></i> <strong>ELO permitido:</strong> ${camp.min_elo} - ${camp.max_elo}</p>
        </div>

        ${botaoHtml}
      `;

      container.appendChild(div);
    });

    // ✅ Exibir o conteúdo
    const main = document.querySelector("main.championships-page");
    main.style.visibility = 'visible';
    main.style.opacity = '1';

    // 🎯 Lógica do botão INSCREVER (somente botões habilitados)
    document.querySelectorAll('.btn-inscrever:not([disabled])').forEach(btn => {
      btn.addEventListener('click', async () => {
        const championshipId = btn.dataset.id;
        btn.disabled = true;
        btn.textContent = 'Enviando...';

        const res = await fetch('/api/inscrever', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: userId, championship_id: championshipId })
        });

        const result = await res.json();
        if (result.success) {
          btn.classList.add('inscrito');
          btn.textContent = '✅ Inscrito';
        } else {
          btn.textContent = result.error || 'Erro';
          btn.disabled = false;
        }
      });
    });

  } catch (err) {
    console.error('Erro ao carregar campeonatos:', err);
    container.innerHTML = '<p>Não foi possível carregar os campeonatos no momento.</p>';
  }
});
