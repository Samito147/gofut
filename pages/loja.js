import { useEffect, useState } from 'react';
import Head from 'next/head';
import Script from 'next/script';

export default function Loja() {
  const [saldo, setSaldo] = useState('Carregando...');

  useEffect(() => {
    async function carregarSaldo() {
      try {
        const res = await fetch('/api/wallet', { credentials: 'include' });
        const data = await res.json();
        const valor = data?.balance_gp ?? 0;
        setSaldo(`${valor} GPs`);
      } catch (e) {
        console.error("Erro ao carregar saldo:", e);
        setSaldo("Erro ao carregar.");
        if (window?.showToast) {
          window.showToast("Erro ao carregar saldo.", "error");
        }
      }
    }

    carregarSaldo();
  }, []);

  return (
    <>
      <Head>
        <title>Loja de GPs</title>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="stylesheet" href="/css/styles.css" />
        <link rel="stylesheet" href="/css/menu.css" />
        <link rel="stylesheet" href="/css/loja.css" />
        <link
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
          rel="stylesheet"
        />
      </Head>

      <div id="menu-placeholder"></div>

      <main className="loja-page">
        <section className="saldo-section">
          <h1><i className="fas fa-coins"></i> Saldo Atual</h1>
          <div id="gp-saldo">{saldo}</div>
        </section>

        <section className="depositar-section">
          <h2><i className="fas fa-credit-card"></i> Comprar GPs</h2>
          <div className="pacotes">
            <button onClick={() => window.comprarGP?.(150)}>R$7,50 → 150 GPs</button>
          </div>
        </section>

        <section className="mercado-section">
          <h2><i className="fas fa-store"></i> Mercado (em breve)</h2>
          <p>Itens especiais poderão ser comprados aqui usando seus GPs acumulados.</p>
        </section>
      </main>

      <Script src="/js/menu.js" strategy="afterInteractive" />
      <Script src="/js/loja.js" strategy="afterInteractive" />

      <noscript>
        <style>{`main { display: none; }`}</style>
        <div className="no-js-warning">
          ⚠️ Este site requer JavaScript para funcionar corretamente.
        </div>
      </noscript>
    </>
  );
}
