// public/js/login.js

document.addEventListener('DOMContentLoaded', () => {
  const form         = document.getElementById('login-form');
  const toastError   = document.getElementById('toast-error');
  const toastSuccess = document.getElementById('toast-success');

  function showToast(el, message) {
    el.textContent = message;
    el.classList.remove('show');
    void el.offsetWidth;
    el.classList.add('show');
  }

  form.addEventListener('submit', async e => {
    e.preventDefault();
    console.log('➡️ Submit iniciado');  // 📣

    const identifier = form.usernameOrEmail.value.trim();
    const password   = form.password.value;
    console.log('Dados do form:', { identifier, password });  // 📣

    if (!identifier || !password) {
      showToast(toastError, 'Preencha todos os campos.');
      console.warn('⚠️ Campos vazios');  // 📣
      return;
    }

    try {
      const res = await fetch('/api/login', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ usernameOrEmail: identifier, password })
      });
      console.log('Status da resposta:', res.status);  // 📣

      const json = await res.json();
      console.log('Corpo da resposta:', json);         // 📣

      if (!res.ok) {
        throw new Error(json.error || 'Falha ao logar.');
      }

      showToast(toastSuccess, '🎉 Logado com sucesso!');
      console.log('🔄 Redirecionando em 1s…');  // 📣
      setTimeout(() => window.location.href = '/index.html', 1000);

    } catch (err) {
      console.error('❌ Erro no login:', err);  // 📣
      showToast(toastError, err.message);
    }
  });
});
