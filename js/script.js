document.documentElement.classList.add('js');

// Alternância de tema claro/escuro
const themeToggle = document.getElementById('themeToggle');
themeToggle.addEventListener('click', () => {
  const current = document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
  const next = current === 'light' ? 'dark' : 'light';
  document.documentElement.dataset.theme = next;
  try { localStorage.setItem('portfolio-theme', next); } catch (_) {}
});

// Menu mobile
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

navToggle.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', isOpen);
});

navLinks.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

// Ano atual no rodapé
document.getElementById('year').textContent = new Date().getFullYear();

// Revela elementos ao rolar a página
const revealTargets = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && revealTargets.length) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
  );
  revealTargets.forEach((el) => observer.observe(el));
} else {
  revealTargets.forEach((el) => el.classList.add('is-visible'));
}

// Barra de progresso de leitura
const progressBar = document.getElementById('progress');
if (progressBar) {
  const updateProgress = () => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
    progressBar.style.width = `${progress}%`;
  };
  window.addEventListener('scroll', updateProgress, { passive: true });
  window.addEventListener('resize', updateProgress);
  updateProgress();
}

// Botão de voltar ao topo
const backToTop = document.getElementById('backToTop');
if (backToTop) {
  const toggleBackToTop = () => {
    backToTop.classList.toggle('is-visible', window.scrollY > window.innerHeight * 0.6);
  };
  window.addEventListener('scroll', toggleBackToTop, { passive: true });
  toggleBackToTop();

  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// Efeito de máquina de escrever nos títulos de primeiro nível
// Roda depois do DOMContentLoaded para garantir que o texto já foi traduzido pelo i18n.js
document.addEventListener('DOMContentLoaded', () => {
  const typeTargets = document.querySelectorAll('.type-target');
  if (!typeTargets.length) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const tokenize = (node, tokens = []) => {
    node.childNodes.forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        Array.from(child.textContent).forEach((ch) => tokens.push({ type: 'char', value: ch }));
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        if (child.tagName === 'BR') {
          tokens.push({ type: 'br' });
        } else {
          tokens.push({ type: 'open', tag: child.tagName.toLowerCase(), className: child.className });
          tokenize(child, tokens);
          tokens.push({ type: 'close' });
        }
      }
    });
    return tokens;
  };

  const typeElement = (el, speed = 32) => {
    const tokens = tokenize(el);
    el.textContent = '';
    el.classList.add('is-typing');
    const stack = [el];
    let i = 0;

    const step = () => {
      if (i >= tokens.length) {
        el.classList.remove('is-typing');
        el.classList.add('is-typed');
        return;
      }
      const token = tokens[i];
      const top = stack[stack.length - 1];

      if (token.type === 'char') {
        const last = top.lastChild;
        if (last && last.nodeType === Node.TEXT_NODE) {
          last.textContent += token.value;
        } else {
          top.appendChild(document.createTextNode(token.value));
        }
      } else if (token.type === 'br') {
        top.appendChild(document.createElement('br'));
      } else if (token.type === 'open') {
        const wrapper = document.createElement(token.tag);
        if (token.className) wrapper.className = token.className;
        top.appendChild(wrapper);
        stack.push(wrapper);
      } else if (token.type === 'close') {
        stack.pop();
      }

      i += 1;
      setTimeout(step, speed);
    };

    step();
  };

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    typeTargets.forEach((el) => el.classList.add('is-typed'));
    return;
  }

  const typeObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          typeElement(entry.target);
          typeObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.4 }
  );
  typeTargets.forEach((el) => typeObserver.observe(el));
});
