/* 1) Importa Supabase (ESM) */
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

/* 2) Configura cliente Supabase */
const supabase = createClient(
  'https://SEU-PROJETO.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' // sua chave pública (anon)
)

/* 3) Referências de DOM */
const playerEloEl     = document.getElementById('playerElo')
const playerClassEl   = document.getElementById('playerClass')
const searchBtn       = document.getElementById('searchBtn')
const searchStatus    = document.getElementById('searchStatus')
const queueList       = document.getElementById('queueList')
const emptyQueue      = document.getElementById('emptyQueue')
const rankingList     = document.getElementById('rankingList')
const historyList     = document.getElementById('historyList')
const noHistory       = document.getElementById('noHistory')

/* 4) Estado local */
let currentUser = null
let inQueue     = false

/* 🔐 Verifica sessão via /api/session */
async function checkSession() {
  try {
    const res = await fetch('/api/session', { credentials: 'include' })
    const json = await res.json()
    return json?.isLoggedIn ? json.user : null
  } catch (err) {
    console.error('Erro ao verificar sessão:', err)
    return null
  }
}

/* Utilitários ----------------------------------------------------------------*/

function getPlayerClass(winRate) {
  if (winRate < 40) return 'D'
  if (winRate < 60) return 'C'
  if (winRate < 85) return 'B'
  return 'A'
}

function renderQueueItem(item) {
  const li = document.createElement('li')
  li.innerHTML = `
    <span>${item.nickname} • <strong>${item.elo}</strong> (${item.player_class})</span>
    ${item.user_id !== currentUser?.id
      ? `<button class="btn-primary btn-accept" data-id="${item.id}">
          <i class="fa-solid fa-handshake"></i> Aceitar
        </button>`
      : `<span class="tag-badge">Você</span>`
    }
  `
  return li
}

function renderHistoryItem(match) {
  const li = document.createElement('li')
  const resultIcon = match.result === 'win'
    ? 'fa-circle-check'
    : match.result === 'loss'
      ? 'fa-circle-xmark'
      : 'fa-handshake'
  li.innerHTML = `
    <span><i class="fa-solid ${resultIcon}"></i> ${match.opponent}</span>
    <span>${new Date(match.played_at).toLocaleDateString()}</span>
  `
  return li
}

function showToast(message) {
  const toast = document.getElementById('toast-alert')
  const msg = document.getElementById('toast-msg')
  msg.textContent = message

  toast.classList.remove('hidden')
  toast.classList.add('show')

  setTimeout(() => {
    toast.classList.remove('show')
    setTimeout(() => toast.classList.add('hidden'), 300)
  }, 3000)
}

function showSearchStatus() {
  searchStatus.style.visibility = 'visible'
  searchStatus.style.opacity = '1'
  searchStatus.style.height = 'auto'
  searchStatus.style.overflow = 'visible'
}

function hideSearchStatus() {
  searchStatus.style.visibility = 'hidden'
  searchStatus.style.opacity = '0'
  searchStatus.style.height = '0'
  searchStatus.style.overflow = 'hidden'
}

/* 5) Carrega infos do jogador */
async function loadPlayerPanel() {
  const { data: stats, error } = await supabase
    .from('user_stats')
    .select('elo,wins,draws,losses')
    .eq('user_id', currentUser.id)
    .single()

  if (error) {
    console.error('Erro ao carregar stats:', error)
    return
  }

  const total = (stats?.wins ?? 0) + (stats?.draws ?? 0) + (stats?.losses ?? 0)
  const winRate = total ? (stats.wins / total) * 100 : 0
  const playerClass = getPlayerClass(winRate)

  playerEloEl.textContent = stats?.elo ?? 0
  playerClassEl.textContent = playerClass
}

/* 6) Ranking TOP 10 */
async function loadRanking() {
  const { data, error } = await supabase
    .from('user_stats')
    .select('nickname,elo')
    .order('elo', { ascending: false })
    .limit(10)

  if (error) return console.error('Ranking error:', error)

  rankingList.innerHTML = ''
  data.forEach(row => {
    const li = document.createElement('li')
    li.textContent = `${row.nickname} – ${row.elo}`
    rankingList.appendChild(li)
  })
}

/* 7) Últimas 5 partidas */
async function loadHistory() {
  const { data, error } = await supabase
    .from('matches')
    .select('opponent,result,played_at')
    .or(`player1.eq.${currentUser.id},player2.eq.${currentUser.id}`)
    .order('played_at', { ascending: false })
    .limit(5)

  if (error) return console.error('History error:', error)

  historyList.innerHTML = ''
  if (!data.length) {
    noHistory.classList.remove('hidden')
    return
  }
  noHistory.classList.add('hidden')

  data.forEach(match => historyList.appendChild(renderHistoryItem(match)))
}

/* 8) Lista inicial da fila */
async function loadQueue() {
  const { data, error } = await supabase
    .from('matchmaking_queue')
    .select('*')
    .eq('status', 'searching')

  if (error) return console.error('Fila error:', error)

  queueList.innerHTML = ''
  if (!data.length) {
    emptyQueue.classList.remove('hidden')
  } else {
    emptyQueue.classList.add('hidden')
    data.forEach(item => queueList.appendChild(renderQueueItem(item)))
  }
}

/* 9) Canal realtime */
function subscribeQueue() {
  supabase
    .channel('public:matchmaking_queue')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'matchmaking_queue', filter: 'status=eq.searching' },
      () => loadQueue()
    )
    .subscribe()
}

/* 10) Entrar ou sair da fila */
async function toggleQueue() {
  if (!currentUser) {
    showToast('⚠️ Você precisa estar logado para buscar partidas.')
    return
  }

  if (inQueue) {
    const { error } = await supabase
      .from('matchmaking_queue')
      .delete()
      .eq('user_id', currentUser.id)
      .eq('status', 'searching')

    if (!error) {
      inQueue = false
      hideSearchStatus()
      searchBtn.innerHTML = '<i class="fa-solid fa-magnifying-glass"></i> Buscar Partida'
      searchBtn.disabled = false
    }
    return
  }

  const { data: exists } = await supabase
    .from('matchmaking_queue')
    .select('id')
    .eq('user_id', currentUser.id)
    .eq('status', 'searching')
    .single()

  inQueue = true
  showSearchStatus()
  searchBtn.innerHTML = '<i class="fa-solid fa-xmark"></i> Cancelar Busca'
  searchBtn.disabled = false

  if (exists) return

  const { error } = await supabase
    .from('matchmaking_queue')
    .insert({
      user_id: currentUser.id,
      nickname: currentUser.nickname,
      elo: parseInt(playerEloEl.textContent, 10),
      player_class: playerClassEl.textContent,
      status: 'searching'
    })

  if (error) {
    console.error('Erro ao entrar na fila:', error)
    inQueue = false
    hideSearchStatus()
    searchBtn.innerHTML = '<i class="fa-solid fa-magnifying-glass"></i> Buscar Partida'
  }
}

/* 11) Aceitar match */
async function acceptMatch(queueId) {
  const { error } = await supabase
    .from('matchmaking_queue')
    .update({
      status: 'matched',
      opponent_id: currentUser.id
    })
    .eq('id', queueId)
    .eq('status', 'searching')

  if (error) return alert('Erro ao aceitar partida!')
  alert('✅ Partida criada! Redirecionando…')
}

/* 12) Eventos */
searchBtn.addEventListener('click', toggleQueue)
queueList.addEventListener('click', e => {
  const btn = e.target.closest('.btn-accept')
  if (btn) acceptMatch(btn.dataset.id)
})

/* 13) Inicialização */
;(async () => {
  currentUser = await checkSession()
  if (!currentUser) return

  await loadPlayerPanel()

  const { data: alreadyInQueue } = await supabase
    .from('matchmaking_queue')
    .select('id')
    .eq('user_id', currentUser.id)
    .eq('status', 'searching')
    .single()

  if (alreadyInQueue) {
    inQueue = true
    showSearchStatus()
    searchBtn.innerHTML = '<i class="fa-solid fa-xmark"></i> Cancelar Busca'
  }

  await Promise.all([loadRanking(), loadHistory(), loadQueue()])
  subscribeQueue()
})()
