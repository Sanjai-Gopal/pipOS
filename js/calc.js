/* calc.js: Pip's Starlight Scientific & Nursery Calculator (starlight-calc.exe)
   A retro LCD scientific calculator featuring standard arithmetic, trigonometry,
   logarithms, memory registers, sheep counter Easter egg, and pentatonic audio chime feedback. */
(function () {
  'use strict';

  var PIP = (typeof window !== 'undefined' && window.PIP) ? window.PIP : {};
  var $ = PIP.$ || function () { return null; };
  var $$ = PIP.$$ || function () { return []; };
  var audio = PIP.audio || { isOn: function () { return false; }, note: function () {}, pop: function () {}, SCALE: [523, 587, 659, 784, 880, 1046, 1175, 1318] };
  var toast = PIP.toast || function () {};

  var state = {
    display: '0',
    expression: '',
    memory: 0,
    hasMemory: false,
    isRadian: false,
    sheepCount: 0,
    resetNext: false
  };

  function playKeyTone(key) {
    if (!audio.isOn()) return;
    if (typeof key === 'number' || /^[0-9]$/.test(key)) {
      var noteIdx = parseInt(key, 10) % (audio.SCALE.length || 8);
      audio.note(audio.SCALE[noteIdx], { dur: 0.25, gain: 0.12 });
    } else if (key === '=') {
      audio.note(audio.SCALE[0], { dur: 0.5, gain: 0.15 });
      audio.note(audio.SCALE[4], { dur: 0.7, gain: 0.15, when: 0.08 });
      audio.note(audio.SCALE[7], { dur: 0.9, gain: 0.18, when: 0.16 });
    } else if (key === 'C' || key === 'AC') {
      audio.pop();
    } else {
      audio.note(audio.SCALE[2], { dur: 0.3, gain: 0.10 });
    }
  }

  function factorial(n) {
    if (n < 0 || n > 170 || Math.floor(n) !== n) return NaN;
    if (n === 0 || n === 1) return 1;
    var res = 1;
    for (var i = 2; i <= n; i++) res *= i;
    return res;
  }

  function inputDigit(digit) {
    playKeyTone(digit);
    if (state.display === '0' || state.display === 'Error' || state.resetNext) {
      state.display = String(digit);
      state.resetNext = false;
    } else {
      if (state.display.length < 16) {
        state.display += String(digit);
      }
    }
    render();
  }

  function inputDecimal() {
    playKeyTone('.');
    if (state.resetNext || state.display === 'Error') {
      state.display = '0.';
      state.resetNext = false;
    } else if (state.display.indexOf('.') === -1) {
      state.display += '.';
    }
    render();
  }

  function inputOperator(op) {
    playKeyTone(op);
    if (state.display === 'Error') return;
    state.expression = state.display + ' ' + op + ' ';
    state.resetNext = true;
    render();
  }

  function clearAll() {
    playKeyTone('AC');
    state.display = '0';
    state.expression = '';
    state.resetNext = false;
    render();
  }

  function backspace() {
    playKeyTone('BS');
    if (state.resetNext || state.display === 'Error') {
      state.display = '0';
      state.resetNext = false;
    } else {
      state.display = state.display.slice(0, -1);
      if (state.display === '' || state.display === '-') {
        state.display = '0';
      }
    }
    render();
  }

  function calculate() {
    if (!state.expression || state.display === 'Error') return;
    playKeyTone('=');

    var fullExpr = state.expression + state.display;
    var parts = fullExpr.trim().split(/\s+/);
    if (parts.length < 3) return;

    var num1 = parseFloat(parts[0]);
    var op = parts[1];
    var num2 = parseFloat(parts[2]);
    var res = 0;

    if (isNaN(num1) || isNaN(num2)) {
      state.display = 'Error';
      render();
      return;
    }

    switch (op) {
      case '+': res = num1 + num2; break;
      case '-': res = num1 - num2; break;
      case '×':
      case '*': res = num1 * num2; break;
      case '÷':
      case '/':
        if (num2 === 0) {
          state.display = 'Error (÷ 0)';
          state.expression = '';
          state.resetNext = true;
          render();
          return;
        }
        res = num1 / num2;
        break;
      case '%': res = num1 % num2; break;
      case '^': res = Math.pow(num1, num2); break;
      default: res = num2;
    }

    state.expression = fullExpr + ' =';
    if (isNaN(res) || !isFinite(res)) {
      state.display = 'Error';
    } else {
      // Clean float rounding
      state.display = String(parseFloat(res.toPrecision(12)));
    }
    state.resetNext = true;
    render();
  }

  function scientificOp(type) {
    if (state.display === 'Error') return;
    playKeyTone(type);
    var val = parseFloat(state.display);
    var res = 0;

    switch (type) {
      case 'sin':
        var radSin = state.isRadian ? val : (val * Math.PI / 180);
        res = Math.sin(radSin);
        break;
      case 'cos':
        var radCos = state.isRadian ? val : (val * Math.PI / 180);
        res = Math.cos(radCos);
        break;
      case 'tan':
        var radTan = state.isRadian ? val : (val * Math.PI / 180);
        res = Math.tan(radTan);
        break;
      case 'sqrt':
        if (val < 0) { res = NaN; } else { res = Math.sqrt(val); }
        break;
      case 'cbrt':
        res = Math.cbrt(val);
        break;
      case 'log':
        if (val <= 0) { res = NaN; } else { res = Math.log10(val); }
        break;
      case 'ln':
        if (val <= 0) { res = NaN; } else { res = Math.log(val); }
        break;
      case 'fact':
        res = factorial(val);
        break;
      case 'recip':
        if (val === 0) { res = NaN; } else { res = 1 / val; }
        break;
      case 'abs':
        res = Math.abs(val);
        break;
      case 'neg':
        res = -val;
        break;
      case 'pi':
        res = Math.PI;
        break;
      case 'e':
        res = Math.E;
        break;
      default:
        return;
    }

    if (isNaN(res) || !isFinite(res)) {
      state.display = 'Error';
    } else {
      state.display = String(parseFloat(res.toPrecision(12)));
    }
    state.resetNext = true;
    render();
  }

  function memoryOp(type) {
    playKeyTone('MEM');
    var val = parseFloat(state.display) || 0;
    switch (type) {
      case 'MC':
        state.memory = 0;
        state.hasMemory = false;
        toast('Memory cleared');
        break;
      case 'MR':
        if (state.hasMemory) {
          state.display = String(state.memory);
          state.resetNext = true;
        }
        break;
      case 'M+':
        state.memory += val;
        state.hasMemory = true;
        toast('Added to memory (M = ' + state.memory + ')');
        break;
      case 'M-':
        state.memory -= val;
        state.hasMemory = true;
        toast('Subtracted from memory');
        break;
    }
    render();
  }

  function countSheep() {
    state.sheepCount++;
    state.display = state.sheepCount + ' 🐑';
    state.expression = 'Counting sheep to fall asleep...';
    state.resetNext = true;

    if (audio.isOn()) {
      audio.note(audio.SCALE[state.sheepCount % audio.SCALE.length], { dur: 0.4, gain: 0.16 });
    }
    if (state.sheepCount >= 10) {
      toast('💤 ' + state.sheepCount + ' sheep counted! Pip is drifting off to dreamland.');
    }
    render();
  }

  function toggleAngleMode() {
    state.isRadian = !state.isRadian;
    var btn = $('#calcAngleMode');
    if (btn) btn.textContent = state.isRadian ? 'RAD' : 'DEG';
    toast(state.isRadian ? 'Trig Mode: Radians' : 'Trig Mode: Degrees');
  }

  function render() {
    var dEl = $('#calcDisplay');
    var eEl = $('#calcExpr');
    var mEl = $('#calcMemFlag');

    if (dEl) dEl.textContent = state.display;
    if (eEl) eEl.textContent = state.expression;
    if (mEl) mEl.classList.toggle('is-active', state.hasMemory);
  }

  function initCalc() {
    var win = $('#calc');
    if (!win) return;

    var keysWrap = $('#calcKeys');
    if (!keysWrap) return;

    // Delegate click events
    keysWrap.addEventListener('click', function (e) {
      var btn = e.target.closest('button[data-act]');
      if (!btn) return;

      var act = btn.getAttribute('data-act');
      var val = btn.getAttribute('data-val');

      switch (act) {
        case 'num': inputDigit(parseInt(val, 10)); break;
        case 'dot': inputDecimal(); break;
        case 'op': inputOperator(val); break;
        case 'eq': calculate(); break;
        case 'clear': clearAll(); break;
        case 'back': backspace(); break;
        case 'sci': scientificOp(val); break;
        case 'mem': memoryOp(val); break;
        case 'sheep': countSheep(); break;
        case 'mode': toggleAngleMode(); break;
      }
    });

    // Keyboard support when calculator is focused or active
    document.addEventListener('keydown', function (e) {
      var t = e.target;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA')) return;
      if (!win.contains(document.activeElement) && document.activeElement !== win) return;

      if (e.key >= '0' && e.key <= '9') {
        e.preventDefault();
        inputDigit(parseInt(e.key, 10));
      } else if (e.key === '.') {
        e.preventDefault();
        inputDecimal();
      } else if (['+', '-', '*', '/'].includes(e.key)) {
        e.preventDefault();
        var op = e.key === '*' ? '×' : (e.key === '/' ? '÷' : e.key);
        inputOperator(op);
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        calculate();
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        backspace();
      } else if (e.key === 'Escape' || e.key.toLowerCase() === 'c') {
        e.preventDefault();
        clearAll();
      }
    });

    render();
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initCalc);
    } else {
      initCalc();
    }
  }

  var calcAPI = {
    init: initCalc,
    getState: function () { return state; },
    inputDigit: inputDigit,
    inputDecimal: inputDecimal,
    inputOperator: inputOperator,
    calculate: calculate,
    scientificOp: scientificOp,
    memoryOp: memoryOp,
    clearAll: clearAll,
    countSheep: countSheep,
    factorial: factorial
  };

  PIP.calc = calcAPI;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = calcAPI;
  }
})();
