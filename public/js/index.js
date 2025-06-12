// js/index.js

// 1️⃣ Dados e renderização da tabela
const jogadores = [
  { nome:"Samuel",  pontos:25, jogos:10, vitorias:8, empates:1, derrotas:1, golsPro:20, golsContra:10, saldoGols:10, vermelhos:0 },
  { nome:"Fernando",pontos:18, jogos:10, vitorias:5, empates:3, derrotas:2, golsPro:15, golsContra:12, saldoGols:3,  vermelhos:0 },
  { nome:"Vinicius",pontos:22, jogos:10, vitorias:7, empates:1, derrotas:2, golsPro:18, golsContra:11, saldoGols:7,  vermelhos:1 },
  { nome:"Cauã",    pontos:16, jogos:10, vitorias:4, empates:4, derrotas:2, golsPro:14, golsContra:13, saldoGols:1,  vermelhos:0 },
  { nome:"Douglas", pontos:20, jogos:10, vitorias:6, empates:2, derrotas:2, golsPro:17, golsContra:12, saldoGols:5,  vermelhos:0 },
  { nome:"Ericles", pontos:14, jogos:10, vitorias:4, empates:2, derrotas:4, golsPro:12, golsContra:14, saldoGols:-2, vermelhos:0 },
  { nome:"Michel",  pontos:10, jogos:10, vitorias:3, empates:1, derrotas:6, golsPro:11, golsContra:18, saldoGols:-7, vermelhos:1 },
  { nome:"Danilo A",pontos:12, jogos:10, vitorias:3, empates:3, derrotas:4, golsPro:13, golsContra:15, saldoGols:-2, vermelhos:0 },
  { nome:"Danilo P",pontos: 8, jogos:10, vitorias:2, empates:2, derrotas:6, golsPro:10, golsContra:17, saldoGols:-7, vermelhos:0 },
  { nome:"Wagner",  pontos: 6, jogos:10, vitorias:1, empates:3, derrotas:6, golsPro: 9, golsContra:19, saldoGols:-10,vermelhos:0 },
  { nome:"Roger",   pontos:13, jogos:10, vitorias:4, empates:1, derrotas:5, golsPro:12, golsContra:16, saldoGols:-4, vermelhos:0 },
  { nome:"Caio",    pontos:11, jogos:10, vitorias:3, empates:2, derrotas:5, golsPro:11, golsContra:17, saldoGols:-6, vermelhos:0 },
  { nome:"Breno",   pontos: 9, jogos:10, vitorias:2, empates:3, derrotas:5, golsPro:10, golsContra:18, saldoGols:-8, vermelhos:0 },
  { nome:"Tone",    pontos:15, jogos:10, vitorias:5, empates:0, derrotas:5, golsPro:14, golsContra:14, saldoGols:0,  vermelhos:0 },
  { nome:"Davi",    pontos:17, jogos:10, vitorias:5, empates:2, derrotas:3, golsPro:16, golsContra:13, saldoGols:3,  vermelhos:0 },
  { nome:"Jhon",    pontos: 7, jogos:10, vitorias:2, empates:1, derrotas:7, golsPro: 8, golsContra:20, saldoGols:-12, vermelhos:1 },
  { nome:"Isaac",   pontos:19, jogos:10, vitorias:6, empates:1, derrotas:3, golsPro:17, golsContra:11, saldoGols:6,  vermelhos:0 },
  { nome:"Diego",   pontos:21, jogos:10, vitorias:6, empates:3, derrotas:1, golsPro:18, golsContra:10, saldoGols:8,  vermelhos:0 },
  { nome:"Antonio", pontos: 4, jogos:10, vitorias:1, empates:1, derrotas:8, golsPro: 7, golsContra:21, saldoGols:-14, vermelhos:1 },
  { nome:"Roberio", pontos: 5, jogos:10, vitorias:1, empates:2, derrotas:7, golsPro: 6, golsContra:20, saldoGols:-14, vermelhos:1 }
];

function renderizarTabela() {
  const tabela = document.getElementById("tabela-corpo");
  tabela.innerHTML = jogadores
    .slice().sort((a,b) => b.pontos - a.pontos)
    .map((jog, i) => {
      const rank  = i + 1;
      const first = i === 0;
      const last  = i === jogadores.length - 1;
      const avatar = jog.nome === "Samuel"
        ? "/assets/fotos/Samuel.png"
        : `https://randomuser.me/api/portraits/men/${i+1}.jpg`;

      let cls = "avatar";
      if (first) cls += " first-place-avatar";
      if (last ) cls += " last-place-avatar";

      const rowCls = [
        first ? "first-place-row" : "",
        i===1    ? "second-place-row": "",
        i===2    ? "third-place-row" : "",
        last     ? "last-place-row"  : "",
        i===jogadores.length-2 ? "penultimate-place-row" : "",
        i===17   ? "eighteenth-place-row"  : "",
        i===16   ? "seventeenth-place-row" : ""
      ].filter(Boolean).join(" ");

      const icon = first ? "🏆" : i===1 ? "🥈" : i===2 ? "🥉" : last ? "💀" : "";
      const filename = jog.nome
        .normalize("NFD").replace(/[\u0300-\u036f]/g,"")
        .replace(/\s+/g,"").toLowerCase() + ".html";

      return `
        <tr class="${rowCls}">
          <td class="player-info">
            <span class="icon">${icon}</span>
            <span class="ranking">${rank}</span>
            <img src="${avatar}" alt="Avatar de ${jog.nome}"
                 class="${cls}" onclick="openModal('${filename}')"/>
            <span onclick="openModal('${filename}')">${jog.nome}</span>
          </td>
          <td><strong>${jog.pontos}</strong></td>
          <td>${jog.jogos}</td>
          <td>${jog.vitorias}</td>
          <td>${jog.empates}</td>
          <td>${jog.derrotas}</td>
          <td>${jog.golsPro}</td>
          <td>${jog.golsContra}</td>
          <td>${jog.saldoGols}</td>
          <td class="highlight-vermelhos">${jog.vermelhos}</td>
        </tr>`;
    }).join("");
}

renderizarTabela();

// 3️⃣ Funções do modal
function resizeIframe(ifr) {
  try {
    const h = ifr.contentDocument.documentElement.scrollHeight;
    ifr.style.height = h + "px";
  } catch(e){}
}

function openModal(page) {
  const m = document.getElementById("modal"),
        b = document.getElementById("modal-body");
  m.style.display = "flex";
  fetch(page)
    .then(r => r.ok ? r.text() : Promise.reject())
    .then(html => {
      const srcdoc = `
        <base href="./" />
        <style>
          html,body{height:auto!important;display:block!important;overflow:visible!important;background:transparent!important;}
          .card-wrapper{transform:scale(0.75)!important;transform-origin:top center!important;}
        </style>${html}`;
      b.innerHTML = `<iframe srcdoc="${srcdoc.replace(/"/g,'&quot;')}"
                         onload="resizeIframe(this)"></iframe>`;
    })
    .catch(_ => b.innerHTML = "<p>Perfil não encontrado.</p>");
}

function closeModal() {
  document.getElementById("modal").style.display = "none";
}

// Fecha modal ao clicar no X
document.querySelector(".modal-close").addEventListener("click", closeModal);
