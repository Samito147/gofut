
document.addEventListener('DOMContentLoaded', async () => {
  const tabela = document.querySelector('#ranking-table tbody')

  try {
    const res = await fetch('/api/ranking', {
      method: 'GET',
      credentials: 'include',
      headers: { 'Accept': 'application/json' }
    })

    if (!res.ok) throw new Error('Erro ao buscar ranking')

    const jogadores = await res.json()

    jogadores.forEach((jogador, index) => {
      const tr = document.createElement('tr')

      const posicao = document.createElement('td')
      posicao.textContent = index + 1

      const nome = document.createElement('td')
      nome.innerHTML = \`
        <img class="avatar" src="\${jogador.avatarUrl}" alt="avatar"/>
        \${jogador.full_name || jogador.username}
      \`

      const elo = document.createElement('td')
      elo.textContent = jogador.elo || '--'

      const classe = document.createElement('td')
      classe.textContent = jogador.classe || '-'
      classe.classList.add('classe-' + jogador.classe)

      tr.appendChild(posicao)
      tr.appendChild(nome)
      tr.appendChild(elo)
      tr.appendChild(classe)

      tabela.appendChild(tr)
    })
  } catch (err) {
    console.error('Erro ao carregar ranking:', err)
    tabela.innerHTML = '<tr><td colspan="4">Erro ao carregar ranking</td></tr>'
  }
})
