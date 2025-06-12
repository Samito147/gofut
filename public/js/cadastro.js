// js/cadastro.js

document.addEventListener('DOMContentLoaded', () => {
  // calcula a data-limite (hoje menos 18 anos)
  const today = new Date();
  const eighteenYearsAgo = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());

  // 🚀 Inicialização direta do Flatpickr
  if (typeof flatpickr === 'function') {
    flatpickr('#birth_date', {
      dateFormat: 'Y-m-d',
      // só permite até 18 anos atrás
      maxDate: eighteenYearsAgo,
      altInput: true,
      altFormat: 'd/m/Y',
      allowInput: false,
      locale: {
        firstDayOfWeek: 1,
        weekdays: { shorthand: ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'] },
        months:   { shorthand: ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'] }
      },
      onClose() {
        this.input.blur();
      }
    });
  } else {
    console.error('Flatpickr não carregado — verifique se o <script> está apontando para dist/flatpickr.min.js');
  }

  // ————— bloqueio de digitação manual no campo de data —————
  const birthInput = document.getElementById('birth_date');
  birthInput.addEventListener('keydown', e => {
    // permite só teclas de navegação e edição mínima
    const allowed = ['Tab','Backspace','Delete','ArrowLeft','ArrowRight'];
    if (!allowed.includes(e.key)) e.preventDefault();
  });

  // Função para carregar Flatpickr dinamicamente caso não esteja presente
  function loadFlatpickr(callback) {
    if (window.flatpickr) {
      callback();
    } else {
      // Injeta CSS do Flatpickr
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css';
      document.head.appendChild(link);

      // Injeta script do Flatpickr (bundle correto)
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.js';
      script.onload = () => {
        flatpickr('#birth_date', {
          dateFormat: 'Y-m-d',
          maxDate: eighteenYearsAgo,
          altInput: true,
          altFormat: 'd/m/Y',
          allowInput: false,
          locale: {
            firstDayOfWeek: 1,
            weekdays: { shorthand: ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'] },
            months:   { shorthand: ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'] }
          },
          onClose() {
            this.input.blur();
          }
        });
        callback();
      };
      document.head.appendChild(script);
    }
  }

  // Garante que, se Flatpickr não estava pronto, a biblioteca seja carregada
  loadFlatpickr(() => { /* flatpickr já inicializado acima */ });

  const form         = document.getElementById('signup-form');
  const toastError   = document.getElementById('toast-error');
  const toastSuccess = document.getElementById('toast-success');

  // Função genérica de exibição de toast
  function showToast(el, message) {
    el.textContent = message;
    el.classList.remove('show');
    // força recálculo para reiniciar a animação
    void el.offsetWidth;
    el.classList.add('show');
  }

  /**
   * Verifica se um CPF é válido.
   * @param {string} cpf — apenas dígitos, sem pontuação.
   * @returns {boolean}
   */
  function isValidCPF(cpf) {
    cpf = cpf.replace(/\D+/g, '');             // remove não-dígitos
    if (cpf.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(cpf)) return false; // sequências idênticas inválidas

    const calcDigit = (sliceLength) => {
      const nums = cpf
        .substr(0, sliceLength)
        .split('')
        .map(d => parseInt(d, 10));
      const factorStart = sliceLength + 1;
      const sum = nums.reduce((acc, num, idx) => acc + num * (factorStart - idx), 0);
      const mod = sum % 11;
      return (mod < 2) ? 0 : 11 - mod;
    };

    const digit1 = calcDigit(9);
    const digit2 = calcDigit(10);
    return digit1 === parseInt(cpf.charAt(9), 10)
        && digit2 === parseInt(cpf.charAt(10), 10);
  }

  form.addEventListener('submit', async e => {
    e.preventDefault();

    // Validação de usuário
    const username = form.username.value.trim();
    if (username.length < 4 || username.length > 10) {
      return showToast(toastError, '⚠️ Usuário deve ter entre 4 e 10 caracteres.');
    }

    // Validação de senha
    const pwd  = form.password.value;
    const pwd2 = form.confirm_password.value;
    if (pwd !== pwd2) {
      return showToast(toastError, '🔒 As senhas não coincidem.');
    }

    // Validação de idade mínima
    const birthDate = new Date(form.birth_date.value);
    if (isNaN(birthDate) || birthDate > eighteenYearsAgo) {
      return showToast(toastError, '🚫 Você precisa ter pelo menos 18 anos para se cadastrar!');
    }

    // Validação de CPF real
    const rawCpf = form.cpf.value;
    if (!isValidCPF(rawCpf)) {
      return showToast(toastError, '🚫 CPF inválido. Verifique os dígitos e tente novamente.');
    }

    try {
      // Prepara payload
      const data = Object.fromEntries(new FormData(form));
      delete data.confirm_password;

      // Chama sua API
      const res = await fetch('/api/signup', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(data)
      });

      // Tenta extrair mensagem de erro detalhada
      const contentType = res.headers.get('Content-Type') || '';
      let errorMsg      = res.statusText;
      if (contentType.includes('application/json')) {
        const json = await res.json();
        errorMsg = json.error || json.message || errorMsg;
      } else {
        const text = await res.text();
        if (text) errorMsg = text;
      }

      // Lógica de sucesso / falha
      if (!res.ok) {
        throw new Error(errorMsg);
      }
      showToast(toastSuccess, '🎉 Cadastro realizado com sucesso!');
      form.reset();

      // Redireciona para login após 1s
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 1000);

    } catch (err) {
      showToast(toastError, `❌ ${err.message}`);
    }
  });
});
