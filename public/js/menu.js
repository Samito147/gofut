// js/menu.js

(async () => {
  const placeholder = document.getElementById('menu-placeholder');
  // Mantém o placeholder invisível até injetar o nav
  placeholder.style.visibility = 'hidden';

  // 1️⃣ Verifica sessão
  async function fetchSession() {
    try {
      const res  = await fetch('../api/session', { credentials: 'include' });
      const json = await res.json();
      const isLoggedIn = Boolean(json.isLoggedIn);
      const user       = json.user || null;
      return { isLoggedIn, user };
    } catch (e) {
      console.error('Erro ao verificar sessão:', e);
      return { isLoggedIn: false, user: null };
    }
  }

  // 2️⃣ Carrega e injeta o menu o quanto antes
  const { isLoggedIn, user } = await fetchSession();
  const role = user?.role || null;

  try {
    const resHtml = await fetch('public/menu.html');
    const html    = await resHtml.text();
    const parser  = new DOMParser();
    const doc     = parser.parseFromString(html, 'text/html');

    // Injeta estilos e links
    doc.head.querySelectorAll('link[rel="stylesheet"], style')
       .forEach(node => document.head.appendChild(node.cloneNode(true)));

    // Injeta o próprio <nav>
    const nav = doc.querySelector('nav.navbar');
    placeholder.appendChild(nav);

    // Agora que temos o nav, revela o placeholder
    placeholder.style.visibility = 'visible';
    // Revela também o <main> que estava oculto via CSS
    const main = document.querySelector('main.profile-page.admin-page');
    if (main) {
      main.style.visibility = 'visible';
      main.style.opacity    = '1';
    }

    // 3️⃣ Inicializa submenu
    initProfileMenu(isLoggedIn, role);

  } catch (err) {
    console.error('Erro ao carregar menu:', err);
    placeholder.style.visibility = 'visible';
    // Mesmo em erro, revela o main
    const main = document.querySelector('main.profile-page.admin-page');
    if (main) {
      main.style.visibility = 'visible';
      main.style.opacity    = '1';
    }
  }

  // Função de submenu (sem alterações)
  function initProfileMenu(isLoggedIn, role) {
    const toggle = document.getElementById('profile-toggle');
    const menu   = document.getElementById('profile-menu');

    if (isLoggedIn) {
      toggle.classList.add('logged-in');
      toggle.classList.remove('logged-out');
    } else {
      toggle.classList.add('logged-out');
      toggle.classList.remove('logged-in');
    }
    toggle.classList.add('initialized');

    const items = !isLoggedIn
      ? [{ text: 'Entrar', href: 'login.html' }]
      : [
          ...(role === 'admin' ? [{ text: 'Admin', href: 'admin.html', icon: 'fas fa-cog' }] : []),
          { text: 'Perfil',        href: 'perfil.html',       icon: 'fas fa-id-badge' },
          { text: 'Configurações', href: 'configuracoes.html',icon: 'fas fa-sliders-h' },
          { text: 'Sair',          href: 'sair.html',         icon: 'fas fa-sign-out-alt' }
        ];

    menu.innerHTML = '';
    for (const item of items) {
      const a = document.createElement('a');
      a.href = item.href;
      if (item.icon) {
        const i = document.createElement('i');
        item.icon.split(' ').forEach(c => i.classList.add(c));
        a.appendChild(i);
        a.append(' ');
      }
      a.append(item.text);
      menu.appendChild(a);
    }

    const logoutLink = menu.querySelector('a[href="sair.html"]');
    if (logoutLink) {
      logoutLink.addEventListener('click', async e => {
        e.preventDefault();
        await fetch('/api/logout', { method: 'POST', credentials: 'include' });
        window.location.href = 'login.html';
      });
    }

    toggle.addEventListener('click', e => {
      e.preventDefault();
      menu.classList.toggle('show');
    });

    document.addEventListener('click', e => {
      if (!toggle.contains(e.target) && !menu.contains(e.target)) {
        menu.classList.remove('show');
      }
    });

    // Ajusta padding-top do body
    const ajustarPadding = () => {
      document.body.style.paddingTop = toggle.parentElement.offsetHeight + 'px';
    };
    ajustarPadding();
    window.addEventListener('resize', ajustarPadding);
  }
})();
