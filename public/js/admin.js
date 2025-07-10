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
      <li><button data-section="users" class="active">Gestão de Usuários</button></li>
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

  const toast = content.querySelector('#toast-admin');

  const buttons = menu.querySelectorAll('button[data-section]');
  buttons.forEach(btn => {
    btn.addEventListener('click', async () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      content.querySelector('#admin-users')?.remove();
      content.querySelector('#match-tester-frame')?.remove();

      if (btn.dataset.section === 'users') {
        const usersDiv = document.createElement('div');
        usersDiv.id = 'admin-users';
        usersDiv.innerHTML = `<ul class="user-list"></ul>`;
        content.appendChild(usersDiv);
        await loadAllUsers(usersDiv.querySelector('.user-list'));
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

  main.style.visibility = 'visible';
  main.style.opacity = '1';
});
