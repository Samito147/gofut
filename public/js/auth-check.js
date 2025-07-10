/**
 * 🔐 Verifica se o usuário está logado e é ADMIN.
 * Redireciona para login ou index, e executa callback se for admin.
 * 
 * @param {Function} onAuthorized - Função a ser executada se o usuário for admin
 */
export async function verificarAdmin(onAuthorized) {
  try {
    const res = await fetch('/api/session', { credentials: 'include' });
    const json = await res.json();

    if (!json.isLoggedIn) {
      window.location.href = 'login.html';
      return;
    }

    const user = json.user || {};
    if (user.role !== 'admin') {
      showToast("⛔ Você não tem permissão para acessar esse conteúdo!");
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1500);
      return;
    }

    // ✅ Remove ocultação visual da página após validação positiva
    document.body.classList.remove('invisible-until-verified');
    document.body.classList.add('visible-after-verification');

    // ✅ Se for admin, executa o callback autorizado
    if (typeof onAuthorized === 'function') {
      onAuthorized(user);
    }

  } catch (err) {
    console.error("❌ Erro ao verificar sessão:", err);
    showToast("❌ Erro ao verificar autenticação.");
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 1500);
  }
}

// ✅ Toast genérico
export function showToast(msg) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.remove('hidden');
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
    toast.classList.add('hidden');
  }, 3000);
}
