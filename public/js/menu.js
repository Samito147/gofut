(async () => {
  const placeholder = document.getElementById('menu-placeholder');
  placeholder.style.visibility = 'hidden';

  // 1️⃣ Verifica sessão
  async function fetchSession() {
    try {
      const res = await fetch('/api/session', { credentials: 'include' });
      const json = await res.json();
      const isLoggedIn = Boolean(json.isLoggedIn);
      const user = json.user || null;
      return { isLoggedIn, user };
    } catch (e) {
      console.error('Erro ao verificar sessão:', e);
      return { isLoggedIn: false, user: null };
    }
  }

  // 2️⃣ Carrega e injeta o menu
  const { isLoggedIn, user } = await fetchSession();
  const role = user?.role || null;

  try {
    const resHtml = await fetch('menu.html');
    const html = await resHtml.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Injeta CSS
    doc.head.querySelectorAll('link[rel="stylesheet"], style')
      .forEach(node => document.head.appendChild(node.cloneNode(true)));

    // Injeta o <nav>
    const nav = doc.querySelector('nav.navbar');
    placeholder.appendChild(nav);

    // Revela o menu
    placeholder.style.visibility = 'visible';

    const main = document.querySelector('main.profile-page.admin-page');
    if (main) {
      main.style.visibility = 'visible';
      main.style.opacity = '1';
    }

    // 3️⃣ Inicializa submenu
    await initProfileMenu(isLoggedIn, role, user?.id);

    // ✅ Dispara evento indicando que o menu foi totalmente carregado
    dispatchEvent(new Event('menu:ready'));
    document.body.classList.add('menu-ready');

  } catch (err) {
    console.error('Erro ao carregar menu:', err);
    placeholder.style.visibility = 'visible';

    const main = document.querySelector('main.profile-page.admin-page');
    if (main) {
      main.style.visibility = 'visible';
      main.style.opacity = '1';
    }

    // 🔄 Mesmo com erro, ainda dispara o evento para não travar páginas dependentes
    dispatchEvent(new Event('menu:ready'));
    document.body.classList.add('menu-ready');
  }

  // 🧩 Submenu com exibição de saldo adaptativa
  async function initProfileMenu(isLoggedIn, role, userId) {
    const toggle = document.getElementById('profile-toggle');
    const menu = document.getElementById('profile-menu');

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
          ...(role === 'admin' ? [
            { text: 'Admin', href: 'admin.html', icon: 'fas fa-cog' },
            { text: 'Campeonatos', href: 'match-campeonato.html', icon: 'fas fa-trophy' }
          ] : []),
          { text: 'Perfil', href: 'perfil.html', icon: 'fas fa-id-badge' },
          { text: 'Carteira', href: 'carteira.html', icon: 'fas fa-wallet' }, // 🆕 Adicionado submenu da carteira
          { text: 'Sair', href: 'sair.html', icon: 'fas fa-sign-out-alt' }
        ];

    menu.innerHTML = '';

    // 💰 Cria elemento de saldo MOBILE (invisível por padrão)
    const saldoMobile = document.createElement('div');
    saldoMobile.id = 'saldo-mobile';
    saldoMobile.style.display = 'none';
    saldoMobile.style.fontWeight = '600';
    saldoMobile.style.padding = '0.5rem 1rem';
    saldoMobile.style.color = '#fff';
    saldoMobile.style.fontSize = '0.95rem';
    saldoMobile.style.borderBottom = '1px solid #333';
    menu.appendChild(saldoMobile); // adiciona antes das opções

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

      // ☑️ Quando abrir o menu em tela pequena, mostra saldo
      if (window.innerWidth <= 768 && saldoMobile.textContent) {
        saldoMobile.style.display = menu.classList.contains('show') ? 'block' : 'none';
      }
    });

    document.addEventListener('click', e => {
      if (!toggle.contains(e.target) && !menu.contains(e.target)) {
        menu.classList.remove('show');
        saldoMobile.style.display = 'none';
      }
    });

    const ajustarPadding = () => {
      document.body.style.paddingTop = toggle.parentElement.offsetHeight + 'px';
    };
    ajustarPadding();
    window.addEventListener('resize', ajustarPadding);

    // 🪙 EXIBE SALDO de forma adaptativa
    if (isLoggedIn && userId) {
      try {
        const resSaldo = await fetch(`/api/wallet?user_id=${userId}`);
        const json = await resSaldo.json();
        const saldo = json?.balance_gp ?? 0;

        // 🖥️ DESKTOP – saldo ao lado do ícone
        if (window.innerWidth > 768) {
          const saldoSpan = document.createElement('span');
          saldoSpan.textContent = `SALDO: ${saldo} GPs`;
          saldoSpan.style.marginRight = '1rem';
          saldoSpan.style.color = '#fff';
          saldoSpan.style.fontWeight = '600';
          saldoSpan.style.fontSize = '0.9rem';

          const parentFlex = toggle.parentElement;
          parentFlex.insertBefore(saldoSpan, toggle);
        }

        // 📱 MOBILE – preenche conteúdo do saldoMobile
        saldoMobile.textContent = `SALDO: ${saldo} GPs`;

      } catch (err) {
        console.error('Erro ao buscar saldo da carteira:', err);
      }
    }
  }
})();
