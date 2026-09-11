// Progressive enhancement only. Navigation and content all work with this
// file absent — see the <details>-based mobile menu and the CSS
// prefers-color-scheme default theme.

function prefersDark() {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
}

function currentTheme() {
  const explicit = document.documentElement.getAttribute('data-theme');
  if (explicit === 'light' || explicit === 'dark') return explicit;
  return prefersDark() ? 'dark' : 'light';
}

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  document.documentElement.style.colorScheme = theme;
  try {
    localStorage.setItem('theme', theme);
  } catch (_) {
    /* ignore */
  }
  document.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
}

function initThemeToggle() {
  const buttons = document.querySelectorAll('[data-theme-toggle]');
  if (!buttons.length) return;

  const label = () => (currentTheme() === 'dark' ? 'Light' : 'Dark');
  const sync = () => {
    buttons.forEach((button) => {
      button.textContent = label();
      button.setAttribute('aria-label', `Switch to ${label().toLowerCase()} theme`);
    });
  };
  sync();

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      setTheme(currentTheme() === 'dark' ? 'light' : 'dark');
      sync();
    });
  });
}

// Close the mobile <details> menu when a link inside it is followed, so a
// back-navigation doesn't land with the menu still open.
function initMobileNav() {
  const nav = document.querySelector('.nav-mobile');
  if (!nav) return;
  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      nav.removeAttribute('open');
    });
  });
}

async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const el = document.createElement('textarea');
  el.value = text;
  el.setAttribute('readonly', '');
  el.style.position = 'fixed';
  el.style.opacity = '0';
  document.body.append(el);
  el.select();
  try {
    document.execCommand('copy');
  } finally {
    el.remove();
  }
}

function initCodeCopy() {
  const blocks = document.querySelectorAll('.article-body pre, .page-body pre');
  blocks.forEach((pre) => {
    if (pre.closest('.code-block')) return;

    const wrapper = document.createElement('div');
    wrapper.className = 'code-block';
    pre.before(wrapper);
    wrapper.append(pre);

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'code-copy';
    button.textContent = 'Copy';
    button.setAttribute('aria-label', 'Copy code to clipboard');
    wrapper.append(button);

    button.addEventListener('click', async () => {
      try {
        const code = pre.querySelector('code')?.textContent ?? pre.textContent;
        await copyText(code.trimEnd());
        button.textContent = 'Copied';
        button.classList.add('code-copy--done');
      } catch (_) {
        button.textContent = 'Failed';
      }
      setTimeout(() => {
        button.textContent = 'Copy';
        button.classList.remove('code-copy--done');
      }, 1600);
    });
  });
}

// Mermaid is only fetched from the CDN when a page actually has a diagram —
// most pages never pay for it.
function initMermaid() {
  const nodes = document.querySelectorAll('.mermaid');
  if (!nodes.length) return;

  import('https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs')
    .then(({ default: mermaid }) => {
      const render = () => {
        mermaid.initialize({
          startOnLoad: false,
          theme: currentTheme() === 'dark' ? 'dark' : 'default',
          securityLevel: 'strict',
          fontFamily: 'inherit',
        });
        mermaid.run({ nodes });
      };
      render();
      document.addEventListener('themechange', () => {
        nodes.forEach((n, i) => {
          if (!n.dataset.mermaidSource) n.dataset.mermaidSource = n.textContent;
          n.removeAttribute('data-processed');
          n.innerHTML = n.dataset.mermaidSource;
        });
        render();
      });
    })
    .catch(() => {
      // Offline or blocked: the raw diagram source still renders as a code
      // block via the site's normal fenced-code styling.
    });
}

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initMobileNav();
  initCodeCopy();
  initMermaid();
});
