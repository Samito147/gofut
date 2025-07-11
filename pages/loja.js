import Head from 'next/head';
import Script from 'next/script';

export default function Loja() {
  return (
    <>
      <Head>
        <title>Loja de GPs</title>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        {/* CSS externos */}
        <link rel="stylesheet" href="/css/menu.css" />
        <link rel="stylesheet" href="/css/styles.css" />
        <link rel="stylesheet" href="/css/loja.css" />
        <link
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
          rel="stylesheet"
        />
      </Head>

      {/* 🔽 Menu carregado dinamicamente */}
      <div id="menu-placeholder"></div>

      {/* 🔲 Fundo escurecido para modal */}
      <div id="gp-info-overlay" onClick={() => fecharInfoGP()}></div>

      {/* 🔒 Conteúdo principal só aparece após menu */}
      <main className="loja-page">
        {/* 💰 SALDO ATUAL DO USUÁRIO */}
        <section className="saldo-section" style={{ position: 'relative' }} id="gp-card">
          <h1><i className="fas fa-coins"></i> Saldo Atual</h1>
          {/* ✅ Ícone no canto superior direito */}
          <button className="info-btn" onClick={() => abrirInfoGP()} title="Sobre os GPs">
            <i className="fas fa-circle-info"></i>
          </button>
          <div id="gp-saldo">Carregando...</div>
        </section>

        {/* 💳 COMPRA DE GPs */}
        <section className="depositar-section">
          <h2><i className="fas fa-credit-card"></i> Depositar GPs</h2>
          <div className="pacotes">
            <button onClick={() => comprarGP(150)}>150 GPs</button>
            <button onClick={() => comprarGP(300)}>300 GPs</button>
            <button onClick={() => comprarGP(500)}>500 GPs</button>
          </div>
        </section>
      </main>

      {/* 🔳 CARD FLUTUANTE COM CONTEÚDO DE GPS.html */}
      <div id="gp-info-card">
        <button id="gp-info-close" onClick={() => fecharInfoGP()} title="Fechar">
          <i className="fas fa-times"></i>
        </button>
        <iframe src="GPS.html" title="Informações sobre GPs"></iframe>
      </div>

      {/* 📦 SCRIPTS EXTERNOS */}
      <Script src="/js/menu.js" strategy="afterInteractive" />
      <Script src="/js/loja.js" strategy="afterInteractive" />

      {/* 📘 Lógica JS inline para fallback de funções */}
      <Script id="gp-modal-fallback" strategy="afterInteractive">
        {`
          function abrirInfoGP() {
            if (typeof abrirModalGP === "function") abrirModalGP();
          }
          function fecharInfoGP() {
            if (typeof fecharModalGP === "function") fecharModalGP();
          }
        `}
      </Script>

      {/* 🚫 Fallback para JS desativado */}
      <noscript>
        <style>{`main { display: none; }`}</style>
        <div className="no-js-warning">
          ⚠️ Este site requer JavaScript para funcionar corretamente.
        </div>
      </noscript>
    </>
  );
}
