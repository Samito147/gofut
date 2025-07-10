import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabase = createClient(
  'https://artrfawxkzeukuddvxkq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFydHJmYXd4a3pldWt1ZGR2eGtxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzMTYyMjksImV4cCI6MjA2Mzg5MjIyOX0.z2ofiYiv6Un4dVOcRgn12P19TnYyHBR99OVBw-bEB_g'
);

document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('campeonatos-lista');
  const toastSuccess = document.getElementById('toast-success');
  const toastError = document.getElementById('toast-error');

  let user = null;

  try {
    const resUser = await fetch('/api/profile', {
      credentials: 'include',
      headers: { 'Accept': 'application/json' }
    });

    if (resUser.ok) {
      const json = await resUser.json();
      if (!json.error) {
        user = json;
      }
    }

    const userId = user?.id ?? null;
    const userElo = user?.stats?.elo ?? 1000;

    const resCamp = await fetch('/api/campeonatos');
    if (!resCamp.ok) {
      const textoErro = await resCamp.text();
      throw new Error(`Erro ${resCamp.status} ao buscar campeonatos:\n${textoErro}`);
    }

    const campeonatos = await resCamp.json();
    container.innerHTML = '';

    campeonatos.forEach(camp => {
      if (!camp.ativo) return;

      const div = document.createElement('div');
      div.classList.add('campeonato-card');

      const inscrito = user && camp.jogadores.includes(userId);
      const vagasRestantes = camp.max_players - camp.jogadores.length;
      const elegivel = user && (userElo >= camp.min_elo && userElo <= camp.max_elo);

      const slugTitle = camp.title
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9\-]/g, '');

      const bannerUrl = `/assets/banners/${slugTitle}.png`;

      const dataInicio = camp.inicio
        ? new Date(camp.inicio).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
        : '---';

      const premioTotal = camp.premio
        ? `R$ ${Number(camp.premio).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
        : '---';

      const valorInscricao = camp.inscricao
        ? `${Number(camp.inscricao)} GPs`
        : '---';

      const iconeColorStyle = camp.cor && camp.cor.trim() !== ''
        ? `style="color: ${camp.cor};"`
        : '';

      let botaoHtml = '';

      if (!user) {
        botaoHtml = `
          <div class="login-prompt">
            🔒 Faça login para se inscrever<br/>
            <a href="/login.html" class="btn-login">🔑 Entrar Agora</a>
          </div>
        `;
      } else if (inscrito) {
        botaoHtml = `<button class="inscrito" disabled>✅ Inscrito</button>`;
      } else if (vagasRestantes <= 0) {
        botaoHtml = `<p class="fechado">Campeonato completo</p>`;
      } else if (!elegivel) {
        botaoHtml = `<button class="btn-inscrever" disabled title="Seu ELO atual não permite inscrição">INSCREVER</button>`;
      } else {
        botaoHtml = `<button class="btn-inscrever" data-id="${camp.id}" data-valor="${camp.inscricao}">INSCREVER</button>`;
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

    const main = document.querySelector("main.championships-page");
    main.style.visibility = 'visible';
    main.style.opacity = '1';

    document.querySelectorAll('.btn-inscrever:not([disabled])').forEach(btn => {
      btn.addEventListener('click', async () => {
        const championshipId = btn.dataset.id;
        const valorInscricao = parseFloat(btn.dataset.valor);

        btn.disabled = true;
        btn.textContent = 'Verificando...';

        const saldoRes = await fetch(`/api/wallet?user_id=${userId}`);
        const saldoJson = await saldoRes.json();
        const saldo = saldoJson?.balance_gp ?? 0;

        if (saldo < valorInscricao) {
          btn.disabled = false;
          btn.textContent = 'INSCREVER';

          toastError.textContent = `Você não tem saldo suficiente para realizar a inscrição!`;
          toastError.classList.add('show');
          setTimeout(() => toastError.classList.remove('show'), 4000);
          return;
        }

        // ✅ Etapa 1: Inscrição
        btn.textContent = 'Inscrevendo...';

        const res = await fetch('/api/inscrever', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: userId, championship_id: championshipId })
        });

        const result = await res.json();

        if (result.success) {
          // ✅ Etapa 2: Desconta GP da carteira
          const { error: walletError } = await supabase
            .from('gp_transactions')
            .insert({
              user_id: userId,
              amount: -valorInscricao,
              type: 'saida',
              origin: 'campeonato',
              description: `Inscrição no campeonato "${result.title || 'Campeonato'}"`
            });

          if (walletError) {
            console.error('Erro ao registrar saída de GP:', walletError);
            toastError.textContent = `Inscrição concluída, mas falha ao debitar GP.`;
            toastError.classList.add('show');
            setTimeout(() => toastError.classList.remove('show'), 4000);
          }

          btn.classList.add('inscrito');
          btn.textContent = '✅ Inscrito';

          toastSuccess.textContent = '🎉 Inscrição realizada com sucesso!';
          toastSuccess.classList.add('show');
          setTimeout(() => toastSuccess.classList.remove('show'), 3000);

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
