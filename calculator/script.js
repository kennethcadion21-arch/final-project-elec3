// ========================================
// MODERN CALCULATOR - Refactored
// Clean, maintainable, well-documented code
// ========================================

const DOM = {
  expression: document.getElementById("expression"),
  result: document.getElementById("result"),
  keys: document.getElementById("keys"),
  themeToggle: document.getElementById("themeToggle"),
};

const STATE = {
  firstOperand: null,
  secondOperand: null,
  operator: null,
  input: "0",
  hasEvaluated: false,
  error: false,
};

// ========================================
// UTILITY FUNCTIONS
// ========================================

/**
 * Format number to readable string with proper decimals
 */
function formatNumber(num) {
  if (!Number.isFinite(num)) return "Error";
  const rounded = Math.round((num + Number.EPSILON) * 1e12) / 1e12;
  return String(rounded);
}

/**
 * Get current input as number
 */
function getCurrentNumber() {
  if ([".", "-."].includes(STATE.input)) return 0;
  return Number(STATE.input);
}

/**
 * Check if calculator is in error state
 */
function isInError() {
  return STATE.error || STATE.input === "Error";
}

/**
 * Update display with expression and result
 */
function updateDisplay() {
  const parts = [];
  
  if (STATE.firstOperand !== null) {
    parts.push(formatNumber(STATE.firstOperand));
  }
  if (STATE.operator) {
    parts.push(STATE.operator);
  }
  if (STATE.secondOperand !== null && !STATE.hasEvaluated) {
    parts.push(formatNumber(STATE.secondOperand));
  }

  DOM.expression.textContent = parts.join(" ");
  DOM.result.textContent = STATE.input;
}

/**
 * Reset calculator to initial state
 */
function reset() {
  STATE.firstOperand = null;
  STATE.secondOperand = null;
  STATE.operator = null;
  STATE.input = "0";
  STATE.hasEvaluated = false;
  STATE.error = false;
  updateDisplay();
}

/**
 * Clear input if fresh start or after equals
 */
function resetIfNeeded() {
  if (isInError() || STATE.hasEvaluated) {
    STATE.firstOperand = null;
    STATE.secondOperand = null;
    STATE.operator = null;
    STATE.input = "0";
    STATE.hasEvaluated = false;
    STATE.error = false;
  }
}

// ========================================
// CALCULATOR OPERATIONS
// ========================================

/**
 * Add digit to input
 */
function addDigit(digit) {
  resetIfNeeded();

  if (STATE.input === "0") {
    STATE.input = digit;
  } else if (STATE.input === "-0") {
    STATE.input = "-" + digit;
  } else {
    STATE.input += digit;
  }

  updateDisplay();
}

/**
 * Add decimal point
 */
function addDecimal() {
  resetIfNeeded();

  if (!STATE.input.includes(".")) {
    STATE.input += ".";
  }

  updateDisplay();
}

/**
 * Toggle positive/negative
 */
function toggleSign() {
  if (isInError()) return;
  if (["0", "0."].includes(STATE.input)) return;

  STATE.input = STATE.input.startsWith("-") 
    ? STATE.input.slice(1) 
    : "-" + STATE.input;

  updateDisplay();
}

/**
 * Remove last character
 */
function backspace() {
  if (isInError()) return;
  if (STATE.hasEvaluated) return;

  if (STATE.input.length <= 1 || (STATE.input.length === 2 && STATE.input.startsWith("-"))) {
    STATE.input = "0";
  } else {
    STATE.input = STATE.input.slice(0, -1);
    if (STATE.input === "-") STATE.input = "0";
  }

  updateDisplay();
}

/**
 * Perform arithmetic operation
 */
function compute(a, op, b) {
  switch (op) {
    case "+": return a + b;
    case "-": return a - b;
    case "*": return a * b;
    case "/": return b === 0 ? NaN : a / b;
    default: return NaN;
  }
}

/**
 * Select operator
 */
function selectOperator(op) {
  if (isInError()) return;

  const currentNum = getCurrentNumber();

  // If after equals, continue calculation
  if (STATE.hasEvaluated) {
    STATE.hasEvaluated = false;
    STATE.secondOperand = null;
  }

  // First operand not set yet
  if (STATE.firstOperand === null) {
    STATE.firstOperand = currentNum;
    STATE.operator = op;
    STATE.input = "0";
    updateDisplay();
    return;
  }

  // Chain operations: if operator and number entered, calculate first
  if (STATE.operator && STATE.input !== "0") {
    STATE.secondOperand = currentNum;
    const result = compute(STATE.firstOperand, STATE.operator, STATE.secondOperand);

    if (!Number.isFinite(result)) {
      setError();
      return;
    }

    STATE.firstOperand = result;
    STATE.secondOperand = null;
    STATE.operator = op;
    STATE.input = "0";
    updateDisplay();
    return;
  }

  // Just change operator without entering next number
  STATE.operator = op;
  updateDisplay();
}

/**
 * Calculate result
 */
function calculate() {
  if (isInError()) return;
  if (STATE.operator === null || STATE.firstOperand === null) return;

  const currentNum = getCurrentNumber();
  const secondNum = STATE.hasEvaluated 
    ? (STATE.secondOperand ?? currentNum)
    : currentNum;

  const result = compute(STATE.firstOperand, STATE.operator, secondNum);

  if (!Number.isFinite(result)) {
    setError();
    return;
  }

  STATE.secondOperand = secondNum;
  STATE.firstOperand = result;
  STATE.input = formatNumber(result);
  STATE.hasEvaluated = true;
  updateDisplay();
}

/**
 * Set error state
 */
function setError() {
  STATE.input = "Error";
  STATE.error = true;
  STATE.firstOperand = null;
  STATE.secondOperand = null;
  STATE.operator = null;
  updateDisplay();
}

// ========================================
// THEME MANAGEMENT
// ========================================

function initTheme() {
  const saved = localStorage.getItem("calculator_theme");
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
  localStorage.setItem("calculator_theme", next);
  updateThemeIcon(next);
}

// ========================================
// EVENT LISTENERS
// ========================================

// Button clicks
DOM.keys.addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;

  if (btn.dataset.digit) addDigit(btn.dataset.digit);
  else if (btn.dataset.op) selectOperator(btn.dataset.op);
  else if (btn.dataset.action === "dot") addDecimal();
  else if (btn.dataset.action === "clear") reset();
  else if (btn.dataset.action === "backspace") backspace();
  else if (btn.dataset.action === "sign") toggleSign();
  else if (btn.dataset.action === "equals") calculate();
});

// Keyboard support
document.addEventListener("keydown", (e) => {
  const key = e.key;

  if (key >= "0" && key <= "9") return addDigit(key);
  if (key === ".") return addDecimal();
  if (key === "Enter" || key === "=") { e.preventDefault(); return calculate(); }
  if (key === "Backspace" || key === "Delete") return backspace();
  if (key === "Escape") return reset();
  if (["+", "-", "*", "/"].includes(key)) return selectOperator(key);
});

// Theme toggle
DOM.themeToggle.addEventListener("click", toggleTheme);

// ========================================
// INITIALIZE
// ========================================

initTheme();
reset();
