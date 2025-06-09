const input = document.getElementById('input');
const buttons = document.querySelectorAll('button');
const sound = document.getElementById('clickSound');
const toggleBtn = document.getElementById('modeToggle');
const status = document.getElementById('status');
const historyContainer = document.getElementById('history');

let string = "";
let memory = 0;

const parser = new exprEval.Parser();

buttons.forEach(button => {
  if (button.id === 'modeToggle') return;

  button.addEventListener('click', (e) => {
    let value = e.target.innerText.trim();

    if (value === 'x') value = '*';
    else if (value === '÷') value = '/';

    handleInput(value);
    playClickSound();
  });
});

document.addEventListener('keydown', (e) => {
  let key = e.key;
  let keyMap = {
    'Enter': '=', 'Backspace': 'DEL',
    'Escape': 'AC', '^': '^', '%': '%',
    '*': '*', '/': '/', '+': '+',
    '-': '-', '.': '.', '(': '(', ')': ')',
    'r': '√'
  };

  if (!isNaN(key)) {
    handleInput(key);
    playClickSound();
    return;
  }

  const mapped = keyMap[key];
  if (mapped) {
    handleInput(mapped);
    playClickSound();
    e.preventDefault();
  }
});

function handleInput(value) {
  switch (value) {
    case '=':
      evaluate();
      break;
    case 'AC':
      string = "";
      input.value = "";
      status.innerText = "Cleared";
      historyContainer.innerHTML = ""; // Clear history entries here
      break;
    case 'DEL':
      string = string.slice(0, -1);
      input.value = string;
      break;
    case '%':
      applyRelativePercent();
      break;
    case '√':
      applySqrt();
      break;
    case '^':
  string += '^';
  input.value = string;
  status.innerText = "Power";
  break;

    case 'M+':
  memory = parser.evaluate(string || "0");
  string = "";
  input.value = "";
  status.innerText = `Memory: ${memory}`;
  break;

case 'M-':
  memory -= parser.evaluate(string || "0");
  string = "";
  input.value = "";
  status.innerText = `Memory: ${memory}`;
  break;

case 'MR':
  string = memory.toString();
  input.value = string;
  status.innerText = "Memory Recalled";
  break;

case 'MC':
  memory = 0;
  string = "";
  input.value = "";
  status.innerText = "Memory Cleared";
  break;

    default:
      string += value;
      input.value = string;
      status.innerText = "";
  }
}


function evaluate() {
  const expr = string.replace(/\*\*/g, '^');
const result = parser.evaluate(expr);

  try {
    const result = parser.evaluate(string);
    if (!isFinite(result) || isNaN(result)) throw new Error("Math Error");
    addToHistory(string, result);
    string = result.toString();
    input.value = string;
    status.innerText = "";
  } catch (err) {
    inputError(err.message);
  }
}

function applySqrt() {
  try {
    const result = Math.sqrt(parser.evaluate(string));
    if (!isFinite(result)) throw new Error("Invalid Square Root");
    string = result.toString();
    input.value = string;
    status.innerText = "Square Root";
  } catch (err) {
    inputError(err.message);
  }
}

function applyRelativePercent() {
  try {
    const m = string.match(/^(.+?)([+\-*/])(\d+(\.\d+)?)%$/);
    if (m) {
      const [_, left, op, pct] = m;
      const base = parser.evaluate(left);
      const pctVal = (base * parseFloat(pct)) / 100;
      string = `${left}${op}${pctVal}`;
    } else {
      const result = parser.evaluate(string) / 100;
      if (!isFinite(result)) throw new Error("Invalid Percentage");
      string = result.toString();
    }
    input.value = string;
    status.innerText = "Percent";
  } catch (err) {
    inputError(err.message);
  }
}

function inputError(message = "Invalid Expression") {
  input.value = "Error";
  string = "";
  status.innerText = message;
}

function playClickSound() {
  sound.currentTime = 0;
  sound.play();
}

toggleBtn.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  const isDark = document.body.classList.contains('dark-mode');
  toggleBtn.innerHTML = isDark
    ? '<i class="fa-solid fa-lightbulb"></i>'
    : '<i class="fa-regular fa-lightbulb"></i>';
});

function addToHistory(expression, result) {
  if (!historyContainer) return;
  const entry = document.createElement('div');
  entry.className = 'history-entry';
  entry.textContent = `${expression} = ${result}`;
  historyContainer.prepend(entry);
}
