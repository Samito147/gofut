// Função exportável para ativar o acordeão no container do modal
export function ativarRegulamentoExpand(containerElement) {
  try {
    const sections = containerElement.querySelectorAll('.container section h2');
    sections.forEach(h2 => {
      h2.addEventListener('click', () => {
        h2.parentElement.classList.toggle('open');
      });
    });
  } catch (e) {
    console.error('Erro ao ativar o comportamento do Regulamento:', e);
  }
}
