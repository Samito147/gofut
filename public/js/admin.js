// 0️⃣ Injeta o CSS de admin antes de qualquer outra coisa
(function () {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'css/admin.css';
  document.head.appendChild(link);
})();

// 1️⃣ Esconde o conteúdo até a injeção do nav global
(function () {
  const styleTag = document.createElement('style');
  styleTag.id = 'hide-admin-content';
  styleTag.textContent = `
    main.profile-page.admin-page {
      visibility: hidden;
      opacity: 0;
      transition: opacity 0.3s ease;
    }
  `;
  document.head.appendChild(styleTag);
})();

// Aguarda nav global
const _obs = new MutationObserver((_, o) => {
  const placeholder = document.getElementById('menu-placeholder');
  if (placeholder && placeholder.querySelector('nav')) {
    document.getElementById('hide-admin-content')?.remove();
    o.disconnect();
  }
});
_obs.observe(document.getElementById('menu-placeholder'), { childList: true });

// ─── HELPER PARA REPORTAR ERROS ──────────────────────────────
async function reportError(err) {
  try {
    await fetch('/api/log-js-error', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: err.message,
        stack: err.stack,
        url: location.href,
        time: new Date().toISOString(),
      }),
    });
  } catch (e) {
    console.error('Falha ao reportar erro ao servidor:', e);
  }
}

// Função para inicializar conteúdo de campeonatos após injeção
window.carregarCampeonatos = async function () {
  try {
    const { iniciarMatchCampeonato } = await import('/js/match-campeonato.js');
    iniciarMatchCampeonato();
  } catch (e) {
    console.error('❌ Erro ao carregar módulo de campeonatos:', e);
    reportError(e);
  }
};

// 🔁 DOM Principal

document.addEventListener('DOMContentLoaded', async () => {
  const { isLoggedIn, user } = await (await fetch('/api/session', { credentials: 'include' })).json();
  if (!isLoggedIn) return window.location.href = '/login.html';
  if (user.role !== 'admin') {
    alert('🚫 Você não tem permissão de admin!');
    return window.location.href = '/';
  }

  const main = document.querySelector('main.profile-page.admin-page');
  const h1 = main.querySelector('h1');
  const toWrap = Array.from(main.children).filter(el => el !== h1);

  const container = document.createElement('div');
  container.classList.add('admin-container');

  const menu = document.createElement('aside');
  menu.classList.add('admin-menu');
  menu.innerHTML = `
    <ul>
      <li><button data-section="stats" class="active">Estatísticas dos Jogadores</button></li>
      <li><button data-section="users">Gestão de Usuários</button></li>
      <li><button data-section="champs">Campeonatos</button></li>
      <li><button data-section="results">Resultados</button></li>
    </ul>
  `;

  const content = document.createElement('div');
  content.classList.add('admin-content');
  toWrap.forEach(el => content.appendChild(el));

  main.innerHTML = '';
  main.appendChild(h1);
  main.appendChild(menu);
  main.appendChild(container);
  container.appendChild(content);

  const searchGroup = content.querySelector('.search-group');
  const searchInput = content.querySelector('#player-search');
  const searchBtn = content.querySelector('#search-btn');
  const resultsList = content.querySelector('#search-results');
  const form = content.querySelector('#stats-form');
  const toast = content.querySelector('#toast-admin');
  const hiddenIdField = content.querySelector('#player-id');
  const nameSpan = content.querySelector('#player-name');
  const fullNameSpan = content.querySelector('#player-fullname');
  const ageSpan = content.querySelector('#player-age');

  form.style.display = 'none';

  const buttons = menu.querySelectorAll('button[data-section]');
  buttons.forEach(btn => {
    btn.addEventListener('click', async () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      searchGroup.style.display = 'none';
      form.style.display = 'none';
      content.querySelector('#admin-users')?.remove();
      content.querySelector('#admin-champs')?.remove();
      content.querySelector('#match-tester-frame')?.remove();
      content.querySelector('#campeonatos-content')?.remove();

      if (btn.dataset.section === 'stats') {
        searchGroup.style.display = '';
      }

      if (btn.dataset.section === 'users') {
        const usersDiv = document.createElement('div');
        usersDiv.id = 'admin-users';
        usersDiv.innerHTML = `<h2>Gestão de Usuários</h2><ul class="user-list"></ul>`;
        content.appendChild(usersDiv);
        await loadAllUsers(usersDiv.querySelector('.user-list'));
      }

      if (btn.dataset.section === 'champs') {
        const template = document.getElementById('match-tester-template');
        const clone = template.content.cloneNode(true);
        const container = document.createElement('div');
        container.id = 'campeonatos-content';
        container.appendChild(clone);
        content.appendChild(container);

        if (!document.getElementById('match-campeonato-css')) {
          const cssLink = document.createElement('link');
          cssLink.rel = 'stylesheet';
          cssLink.href = 'css/match-campeonato.css';
          cssLink.id = 'match-campeonato-css';
          document.head.appendChild(cssLink);
        }

        const oldScript = document.querySelector('script[src="js/match-campeonato.js"]');
        if (oldScript) oldScript.remove();

        const script = document.createElement('script');
        script.src = 'js/match-campeonato.js';
        document.body.appendChild(script);

        setTimeout(() => {
          if (typeof window.carregarCampeonatos === 'function') {
            window.carregarCampeonatos();
          } else {
            console.warn("⚠️ Função carregarCampeonatos não encontrada após injeção!");
          }
        }, 300);
      }

      if (btn.dataset.section === 'results') {
        const iframe = document.createElement('iframe');
        iframe.id = 'match-tester-frame';
        iframe.src = 'match-tester.html';
        iframe.style = 'width: 100%; height: 100vh; border: none;';
        content.appendChild(iframe);
      }
    });
  });
  buttons[0].click();

  function showToast(msg, isError = false) {
    toast.textContent = msg;
    toast.className = `toast ${isError ? 'error show' : 'success show'}`;
    setTimeout(() => toast.classList.remove('show'), 3000);
  }

  let supabaseUrl, supabaseKey;
  try {
    const cfg = await fetch('/api/config').then(r => r.json());
    supabaseUrl = cfg.supabaseUrl;
    supabaseKey = cfg.supabaseKey;
  } catch (e) {
    showToast('❌ Não foi possível carregar configuração.', true);
    return;
  }

  if (!supabaseUrl || !supabaseKey) {
    showToast('❌ Configuração da Supabase inválida.', true);
    return;
  }

  const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm');
  const supabase = createClient(supabaseUrl, supabaseKey);

  async function searchPlayers(term) {
    const { data, error } = await supabase
      .from('users')
      .select('id, username')
      .ilike('username', `%${term}%`)
      .limit(10);
    if (error) { reportError(error); showToast(`❌ ${error.message}`, true); return []; }
    return data;
  }

  async function doSearch() {
    const term = searchInput.value.trim();
    if (!term) {
      resultsList.innerHTML = '';
      resultsList.style.display = 'none';
      form.style.display = 'none';
      return;
    }
    const players = await searchPlayers(term);
    resultsList.innerHTML = players.length
      ? players.map(u => `<li data-id="${u.id}"><i class="fas fa-user"></i> ${u.username}</li>`).join('')
      : `<li>Nenhum jogador encontrado.</li>`;
    resultsList.style.display = 'block';
  }

  searchInput.addEventListener('focus', () => {
    resultsList.innerHTML = '';
    resultsList.style.display = 'none';
  });
  searchBtn.addEventListener('click', doSearch);
  searchInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      doSearch();
    }
  });

  async function loadPlayerStats(userId) {
    let { data: stats, error: statsErr } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    if (statsErr) { reportError(statsErr); showToast('❌ Erro ao carregar dados.', true); return; }

    if (!stats) {
      const { data: newStats, error: insErr } = await supabase
        .from('user_stats')
        .insert({ user_id: userId })
        .select('*')
        .single();
      if (insErr) { reportError(insErr); showToast('❌ Erro ao inicializar.', true); return; }
      stats = newStats;
    }

    const { data: userInfo, error: userErr } = await supabase
      .from('users')
      .select('username, full_name, birth_date')
      .eq('id', userId)
      .single();
    if (userErr) { reportError(userErr); showToast('❌ Erro ao buscar usuário.', true); return; }

    hiddenIdField.value = stats.id;
    nameSpan.textContent = userInfo.username;
    fullNameSpan.textContent = userInfo.full_name;

    const birth = new Date(userInfo.birth_date);
    let age = new Date().getFullYear() - birth.getFullYear();
    const m = new Date().getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && new Date().getDate() < birth.getDate())) age--;
    ageSpan.textContent = `${age} anos`;

    ['played', 'goals', 'victories', 'draws', 'losses', 'yellow', 'red', 'corners', 'possession'].forEach(f => {
      content.querySelector(`#${f}-current`).textContent = stats[f] ?? 0;
      content.querySelector(`#${f}`).value = '';
    });

    form.style.display = '';
  }

  content.querySelector('#search-results')?.addEventListener('click', async e => {
    const li = e.target.closest('li[data-id]');
    if (!li) return;
    const userId = li.dataset.id;
    searchInput.value = li.textContent.trim();
    resultsList.innerHTML = '';
    resultsList.style.display = 'none';
    await loadPlayerStats(userId);
  });

  async function loadAllUsers(listEl) {
    listEl.innerHTML = '<li>Carregando usuários...</li>';
    const { data, error } = await supabase.from('users').select('id, username, full_name');
    if (error) {
      reportError(error);
      listEl.innerHTML = `<li>❌ Erro ao carregar usuários: ${error.message}</li>`;
      return;
    }

    if (!data.length) {
      listEl.innerHTML = '<li>Nenhum usuário encontrado.</li>';
      return;
    }

    listEl.innerHTML = '';
    data.forEach(u => {
      const li = document.createElement('li');
      li.className = 'user-item';
      li.innerHTML = `
        <span class="user-name">${u.username}</span>
        <span class="user-full">${u.full_name}</span>
        <button class="delete-user" data-id="${u.id}" title="Deletar usuário">🗑️</button>
      `;
      listEl.appendChild(li);
    });

    listEl.querySelectorAll('.delete-user').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        if (!confirm('Confirma exclusão permanente deste usuário?')) return;
        const { error: delErr } = await supabase.from('users').delete().eq('id', id);
        if (delErr) {
          reportError(delErr);
          showToast(`❌ Erro ao deletar: ${delErr.message}`, true);
        } else {
          showToast('✅ Usuário deletado.', false);
          btn.closest('li').remove();
        }
      });
    });
  }

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const statsId = hiddenIdField.value;
    const updates = {};
    ['played', 'goals', 'victories', 'draws', 'losses', 'yellow', 'red', 'corners', 'possession'].forEach(field => {
      const inc = +content.querySelector(`#${field}`).value || 0;
      const current = +content.querySelector(`#${field}-current`).textContent || 0;
      updates[field] = current + inc;
    });

    const { error } = await supabase.from('user_stats').update(updates).eq('id', statsId);
    if (error) {
      reportError(error);
      showToast(`❌ ${error.message}`, true);
    } else {
      showToast('✅ Estatísticas atualizadas!', false);
      Object.keys(updates).forEach(field => {
        content.querySelector(`#${field}-current`).textContent = updates[field];
        content.querySelector(`#${field}`).value = '';
      });
    }
  });

  main.style.visibility = 'visible';
  main.style.opacity = '1';
});
