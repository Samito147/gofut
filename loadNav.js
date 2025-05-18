// loadNav.js
(async function() {
  try {
    const res  = await fetch('nav.html');
    const html = await res.text();
    document.getElementById('nav-placeholder').innerHTML = html;

    // Marca o link ativo conforme a URL atual:
    const page = location.pathname.split('/').pop();
    document.querySelectorAll('.navbar a').forEach(a => {
      if (a.getAttribute('href') === page) a.classList.add('active');
    });
  } catch (e) {
    console.error('Erro carregando nav:', e);
  }
})();
