// The Color API integration: https://www.thecolorapi.com
// No API key required; supports CORS

const DOM = {
  hexInput: document.getElementById('hexInput'),
  randomBtn: document.getElementById('randomBtn'),
  searchBtn: document.getElementById('searchBtn'),
  themeToggle: document.getElementById('themeToggle'),
  status: document.getElementById('status'),
  errorBox: document.getElementById('errorBox'),
  colorResult: document.getElementById('colorResult'),
  swatch: document.getElementById('swatch'),
  name: document.getElementById('name'),
  hex: document.getElementById('hex'),
  rgb: document.getElementById('rgb'),
  hsl: document.getElementById('hsl'),
  cmyk: document.getElementById('cmyk'),
  paletteBox: document.getElementById('paletteBox'),
  paletteGrid: document.getElementById('paletteGrid'),
  loadMoreBtn: document.getElementById('loadMoreBtn'),
};

function setLoading(isLoading, msg = '') {
  DOM.status.textContent = msg;
  DOM.searchBtn.disabled = isLoading;
  DOM.randomBtn.disabled = isLoading;
  DOM.hexInput.disabled = isLoading;
}

function showError(message) {
  DOM.errorBox.textContent = message;
  DOM.errorBox.classList.remove('hidden');
}

function clearError() {
  DOM.errorBox.textContent = '';
  DOM.errorBox.classList.add('hidden');
}

function validateColorInput(value) {
  const v = value.trim();
  if (!v) return { ok: false, message: 'Enter a HEX like #4f46e5 or rgb(79,70,229)' };
  // Accept hex (#fff, #ffffff) or rgb(...)
  const isHex = /^#?[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/.test(v);
  const isRgb = /^rgb\s*\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/.test(v);
  if (!isHex && !isRgb) return { ok: false, message: 'Invalid format. Try #4f46e5 or rgb(79,70,229)' };
  return { ok: true, value: v };
}

async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Request failed: ${res.status} ${res.statusText}`);
  return res.json();
}

function hexToQuery(hex) {
  const clean = hex.startsWith('#') ? hex.slice(1) : hex;
  return `hex=${encodeURIComponent(clean)}`;
}

function rgbToQuery(rgb) {
  return `rgb=${encodeURIComponent(rgb)}`;
}

async function getColorInfo(input) {
  const q = input.trim().startsWith('#') || /^[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/.test(input)
    ? hexToQuery(input)
    : rgbToQuery(input);
  const url = `https://www.thecolorapi.com/id?${q}`;
  return fetchJSON(url);
}

async function getPalette(hex, mode = 'analogic', count = 5) {
  const clean = hex.startsWith('#') ? hex.slice(1) : hex;
  const url = `https://www.thecolorapi.com/scheme?hex=${encodeURIComponent(clean)}&mode=${mode}&count=${count}`;
  return fetchJSON(url);
}

function renderColor(data) {
  const hex = data.hex?.value || '#000000';
  const name = data.name?.value || 'Unknown';
  const rgb = data.rgb ? `rgb(${data.rgb.r}, ${data.rgb.g}, ${data.rgb.b})` : 'N/A';
  const hsl = data.hsl ? `hsl(${data.hsl.h}, ${data.hsl.s}%, ${data.hsl.l}%)` : 'N/A';
  const cmyk = data.cmyk ? `cmyk(${data.cmyk.c}%, ${data.cmyk.m}%, ${data.cmyk.y}%, ${data.cmyk.k}%)` : 'N/A';

  DOM.swatch.style.background = hex;
  DOM.name.textContent = name;
  DOM.hex.textContent = hex;
  DOM.rgb.textContent = rgb;
  DOM.hsl.textContent = hsl;
  DOM.cmyk.textContent = cmyk;

  DOM.colorResult.classList.remove('hidden');
}

function renderPalette(scheme) {
  const colors = scheme.colors || [];
  DOM.paletteGrid.innerHTML = '';

  colors.forEach((c) => {
    const hex = c.hex?.value || '#000000';
    const card = document.createElement('div');
    card.className = 'palette-card';
    card.innerHTML = `
      <div class="palette-chip" style="background:${hex}"></div>
      <div class="palette-meta">
        <span class="palette-hex">${hex}</span>
        <button class="btn-primary" data-copy="${hex}">Copy</button>
      </div>
    `;
    DOM.paletteGrid.appendChild(card);
  });

  DOM.paletteBox.classList.remove('hidden');
}

function attachCopyHandlers() {
  DOM.paletteGrid.addEventListener('click', async (e) => {
    const btn = e.target.closest('button[data-copy]');
    if (!btn) return;
    const hex = btn.getAttribute('data-copy');
    try {
      await navigator.clipboard.writeText(hex);
      btn.textContent = 'Copied!';
      setTimeout(() => (btn.textContent = 'Copy'), 1000);
    } catch {}
  });
}

async function runSearch() {
  clearError();
  DOM.paletteBox.classList.add('hidden');
  DOM.colorResult.classList.add('hidden');

  const check = validateColorInput(DOM.hexInput.value);
  if (!check.ok) {
    showError(check.message);
    return;
  }

  try {
    setLoading(true, 'Fetching color...');
    const info = await getColorInfo(check.value);
    renderColor(info);

    setLoading(true, 'Fetching palette...');
    const scheme = await getPalette(info.hex.value, 'analogic-complement');
    renderPalette(scheme);
    setLoading(false, '');
  } catch (err) {
    console.error(err);
    setLoading(false, '');
    showError(err.message || 'Failed to fetch color');
  }
}

function randomHex() {
  const rnd = Math.floor(Math.random() * 0xffffff);
  return `#${rnd.toString(16).padStart(6, '0')}`;
}

async function runRandom() {
  DOM.hexInput.value = randomHex();
  await runSearch();
  // After random search, show Load More button
  DOM.loadMoreBtn.classList.remove('hidden');
}

// Append additional random colors as mini cards
async function loadMoreRandom(count = 6) {
  clearError();
  try {
    setLoading(true, 'Loading more colors...');
    // Generate multiple random colors and append their cards
    for (let i = 0; i < count; i++) {
      const hex = randomHex();
      const info = await getColorInfo(hex);
      // Create a compact palette card using the single color
      const card = document.createElement('div');
      card.className = 'palette-card';
      const h = info.hex?.value || hex;
      card.innerHTML = `
        <div class="palette-chip" style="background:${h}"></div>
        <div class="palette-meta">
          <span class="palette-hex">${h}</span>
          <button class="btn-primary" data-copy="${h}">Copy</button>
        </div>
      `;
      DOM.paletteGrid.appendChild(card);
    }
    DOM.paletteBox.classList.remove('hidden');
    setLoading(false, '');
  } catch (err) {
    console.error(err);
    setLoading(false, '');
    showError(err.message || 'Failed to load more colors');
  }
}

function initTheme() {
  const saved = localStorage.getItem('color_theme');
  const theme = saved || 'dark';
  document.documentElement.setAttribute('data-theme', theme);
  DOM.themeToggle.textContent = theme === 'light' ? '🌙' : '☀️';
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'dark';
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('color_theme', next);
  DOM.themeToggle.textContent = next === 'light' ? '🌙' : '☀️';
}

// Events
DOM.searchBtn.addEventListener('click', runSearch);
DOM.randomBtn.addEventListener('click', runRandom);
DOM.loadMoreBtn.addEventListener('click', () => loadMoreRandom(6));
DOM.hexInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') runSearch(); });
DOM.themeToggle.addEventListener('click', toggleTheme);
attachCopyHandlers();

// Initialize
initTheme();
