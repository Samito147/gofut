// ✅ Preview da imagem selecionada
document.getElementById('foto').addEventListener('change', function (e) {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (evt) {
      document.getElementById('previewImg').src = evt.target.result;
    };
    reader.readAsDataURL(file);
  }
});

// ✅ Upload da imagem para /api/upload-foto
document.getElementById('fotoForm').addEventListener('submit', async function (e) {
  e.preventDefault();
  const formData = new FormData(this);

  try {
    // 🔍 Recupera o nick real via /api/profile
    const profileRes = await fetch('/api/profile', {
      method: 'GET',
      credentials: 'include',
      headers: { 'Accept': 'application/json' }
    });

    if (!profileRes.ok) {
      throw new Error('Não foi possível recuperar o nome do usuário.');
    }

    const profile = await profileRes.json();
    const nick = profile.nick || 'usuario';

    // ⬅️ Anexa o nome real do usuário no FormData
    formData.append('username', nick);

    const res = await fetch('/api/upload-foto', {
      method: 'POST',
      body: formData
    });

    // ✅ Verifica se a resposta é JSON válida
    const contentType = res.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Resposta inesperada do servidor');
    }

    const json = await res.json();

    if (res.ok && json.success) {
      document.getElementById('previewImg').src = json.file;
      showToast('✅ Foto salva com sucesso!');
      document.getElementById('statusMsg').textContent = '';

      // ✅ Fecha o modal pai após delay
      setTimeout(() => {
        if (window.parent && typeof window.parent.closeModal === 'function') {
          window.parent.closeModal();
        } else {
          console.warn("⚠️ Não foi possível fechar o modal: função 'closeModal' não encontrada no parent.");
        }
      }, 1500);

    } else {
      showToast('⚠️ Erro ao salvar: ' + (json.error || 'Erro desconhecido'));
      document.getElementById('statusMsg').textContent = '⚠️ Erro ao salvar';
    }

  } catch (err) {
    console.error('❌ Erro no upload:', err);
    showToast('❌ Falha ao enviar a foto.');
    document.getElementById('statusMsg').textContent = '❌ Falha ao enviar a foto.';
  }
});

// ✅ Toast flutuante no centro da tela
function showToast(msg) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }

  toast.textContent = msg;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}
