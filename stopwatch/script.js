// ========================================
// MODERN STOPWATCH - Refactored
// With lap timing and improved UX
// ========================================

const DOM = {
  time: document.getElementById("time"),
  startPause: document.getElementById("startPause"),
  lap: document.getElementById("lap"),
  reset: document.getElementById("reset"),
  lapList: document.getElementById("lapList"),
  themeToggle: document.getElementById("themeToggle"),
};

const STATE = {
  isRunning: false,
  startTime: 0,
  elapsedMs: 0,
  rafId: 0,
  laps: [],
};

// ========================================
// UTILITY FUNCTIONS
// ========================================

/**
 * Format milliseconds to HH:MM:SS.CS
 */
function formatTime(ms) {
  const totalCentiseconds = Math.floor(ms / 10);
  const centiseconds = totalCentiseconds % 100;

  const totalSeconds = Math.floor(totalCentiseconds / 100);
  const seconds = totalSeconds % 60;

  const totalMinutes = Math.floor(totalSeconds / 60);
  const minutes = totalMinutes % 60;

  const hours = Math.floor(totalMinutes / 60);

  return [
    String(hours).padStart(2, "0"),
    String(minutes).padStart(2, "0"),
    String(seconds).padStart(2, "0"),
  ].join(":") + "." + String(centiseconds).padStart(2, "0");
}

/**
 * Update time display
 */
function updateDisplay(ms) {
  DOM.time.textContent = formatTime(ms);
}

/**
 * Animation frame callback for continuous update
 */
function tick() {
  if (!STATE.isRunning) return;

  const now = performance.now();
  const currentElapsed = STATE.elapsedMs + (now - STATE.startTime);
  updateDisplay(currentElapsed);

  STATE.rafId = requestAnimationFrame(tick);
}

/**
 * Update button states
 */
function updateButtons() {
  DOM.startPause.textContent = STATE.isRunning 
    ? "Pause" 
    : (STATE.elapsedMs > 0 ? "Resume" : "Start");
  
  DOM.lap.disabled = !STATE.isRunning;
  DOM.reset.disabled = STATE.isRunning || STATE.elapsedMs === 0;
}

/**
 * Start/Resume stopwatch
 */
function start() {
  if (STATE.isRunning) return;

  STATE.isRunning = true;
  STATE.startTime = performance.now();

  if (!STATE.rafId) {
    STATE.rafId = requestAnimationFrame(tick);
  }

  updateButtons();
}

/**
 * Pause stopwatch
 */
function pause() {
  if (!STATE.isRunning) return;

  STATE.isRunning = false;

  if (STATE.rafId) {
    cancelAnimationFrame(STATE.rafId);
    STATE.rafId = 0;
  }

  STATE.elapsedMs += performance.now() - STATE.startTime;
  updateDisplay(STATE.elapsedMs);
  updateButtons();
}

/**
 * Record lap time
 */
function recordLap() {
  if (!STATE.isRunning) return;

  const now = performance.now();
  const lapTime = STATE.elapsedMs + (now - STATE.startTime);
  
  STATE.laps.push({
    totalTime: lapTime,
    lapNumber: STATE.laps.length + 1,
  });

  renderLaps();
}

/**
 * Reset stopwatch
 */
function resetStopwatch() {
  if (STATE.isRunning) return;

  if (STATE.rafId) {
    cancelAnimationFrame(STATE.rafId);
    STATE.rafId = 0;
  }

  STATE.startTime = 0;
  STATE.elapsedMs = 0;
  STATE.laps = [];

  updateDisplay(0);
  renderLaps();
  updateButtons();
}

/**
 * Render lap times
 */
function renderLaps() {
  DOM.lapList.innerHTML = "";

  if (STATE.laps.length === 0) return;

  for (let i = 0; i < STATE.laps.length; i++) {
    const lap = STATE.laps[i];
    const previousLap = i > 0 ? STATE.laps[i - 1].totalTime : 0;
    const lapDuration = lap.totalTime - previousLap;

    const lapEl = document.createElement("div");
    lapEl.className = "lap-item";
    lapEl.innerHTML = `
      <span class="lap-number">Lap ${lap.lapNumber}</span>
      <span class="lap-time">${formatTime(lapDuration)}</span>
      <span class="lap-total">(${formatTime(lap.totalTime)})</span>
    `;
    DOM.lapList.appendChild(lapEl);
  }
}

// ========================================
// THEME MANAGEMENT
// ========================================

function initTheme() {
  const saved = localStorage.getItem("stopwatch_theme");
  const theme = saved || "dark";
  document.documentElement.setAttribute("data-theme", theme);
  updateThemeIcon(theme);
}

function updateThemeIcon(theme) {
  DOM.themeToggle.textContent = theme === "light" ? "🌙" : "☀️";
}

function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme") || "dark";
  const next = current === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("stopwatch_theme", next);
  updateThemeIcon(next);
}

// ========================================
// EVENT LISTENERS
// ========================================

DOM.startPause.addEventListener("click", () => {
  STATE.isRunning ? pause() : start();
});

DOM.lap.addEventListener("click", recordLap);
DOM.reset.addEventListener("click", resetStopwatch);

DOM.themeToggle.addEventListener("click", toggleTheme);

// Keyboard support
document.addEventListener("keydown", (e) => {
  const key = e.key.toLowerCase();

  if (key === " " || e.code === "Space") {
    e.preventDefault();
    STATE.isRunning ? pause() : start();
  } else if (key === "l") {
    recordLap();
  } else if (key === "r") {
    resetStopwatch();
  }
});

// Handle visibility change
document.addEventListener("visibilitychange", () => {
  if (document.hidden && STATE.isRunning) {
    // Convert running time to elapsed
    STATE.elapsedMs += performance.now() - STATE.startTime;
    STATE.startTime = performance.now();
    updateDisplay(STATE.elapsedMs);

    if (STATE.rafId) {
      cancelAnimationFrame(STATE.rafId);
      STATE.rafId = 0;
    }
  } else if (!document.hidden && STATE.isRunning && !STATE.rafId) {
    STATE.startTime = performance.now();
    STATE.rafId = requestAnimationFrame(tick);
  }
});

// ========================================
// INITIALIZE
// ========================================

initTheme();
updateDisplay(0);
updateButtons();
