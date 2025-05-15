document.addEventListener("DOMContentLoaded", function () {
  const iframe = document.getElementById('iframe-conteudo');
  const overlay = document.getElementById('loader-overlay');
  const loaderTexto = document.getElementById('loader-texto');

  const textosPorPagina = {
    'tabela.html': '📊 Carregando Tabela...',
    'resultados.html': '📈 Carregando Resultados...',
    'cronograma.html': '📅 Carregando Cronograma...',
    'apostas.html': '⚽ Carregando Área de Apostas...',
    'ranking.html': '🏆 Carregando Ranking...',
    'noticias.html': '📰 Carregando Notícias...',
    'regulamento.html': '📜 Carregando Regulamento...'
  };

  // Função para validar as páginas carregadas
  function validarPagina(pagina) {
    const paginasPermitidas = [
      'tabela.html', 'resultados.html', 'cronograma.html', 
      'apostas.html', 'ranking.html', 'noticias.html', 'regulamento.html'
    ];
    return paginasPermitidas.includes(pagina);
  }

  // Função para escapar HTML e evitar XSS
  function escapeHtml(texto) {
    const element = document.createElement('div');
    if (texto) element.innerText = texto;
    return element.innerHTML;
  }

  // Função para mostrar ou esconder o overlay
  function mostrarOverlay(estado) {
    if (estado === 'mostrar') {
      overlay.classList.add('mostrar');
      iframe.classList.remove('fade');
    } else {
      overlay.classList.remove('mostrar');
      iframe.classList.add('fade');
    }
  }

  // Função para atualizar o texto de carregamento
  function obterTextoDeCarregamento(pagina) {
    return textosPorPagina[pagina] || 'Carregando...';
  }

  // Função para atualizar a classe de "active" no link da navegação
  function atualizarClasseDoLink(link) {
    document.querySelectorAll('.navbar a').forEach(item => item.classList.remove('active'));
    link.classList.add('active');
  }

  // Função para atualizar o conteúdo do iframe
  function atualizarIframe(pagina) {
    iframe.src = pagina;
    iframe.classList.remove('fade');
  }

  // Função para carregar a página dentro do iframe
  function carregarPagina(elemento) {
    const pagina = elemento.dataset.page;

    if (!validarPagina(pagina)) {
      console.error('Página não permitida:', pagina);
      return;  // Impede o carregamento de páginas não autorizadas
    }

    loaderTexto.textContent = obterTextoDeCarregamento(pagina);
    mostrarOverlay('mostrar');

    atualizarIframe(pagina);
    atualizarClasseDoLink(elemento);
  }

  // Delegação de eventos para navegação
  document.querySelector('.navbar').addEventListener('click', function(event) {
    if (event.target.tagName.toLowerCase() === 'a') {
      carregarPagina(event.target);
    }
  });

  // Evento para quando o iframe for carregado
  iframe.addEventListener('load', () => {
    mostrarOverlay('esconder');
  });
});
