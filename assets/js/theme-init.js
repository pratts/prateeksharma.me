(() => {
  // Runs before first paint (loaded synchronously in <head>) so there is no
  // flash of the wrong theme. Only ever sets an explicit override — with no
  // stored preference the CSS `prefers-color-scheme` query decides.
  try {
    const stored = localStorage.getItem('theme');
    if (stored === 'light' || stored === 'dark') {
      document.documentElement.setAttribute('data-theme', stored);
    }
  } catch (_) {
    // Storage can be unavailable (private mode, disabled cookies); default
    // theme still works via prefers-color-scheme.
  }
})();
