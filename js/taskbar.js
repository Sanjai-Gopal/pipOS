/* taskbar.js: Pip OS Start Menu & Taskbar Enhancements
   Provides an interactive vintage desktop Start Menu, quick application launcher,
   fullscreen control, keyboard navigation, and responsive taskbar management. */
(function () {
  'use strict';

  var PIP = (typeof window !== 'undefined' && window.PIP) ? window.PIP : {};
  var $ = PIP.$ || function () { return null; };
  var $$ = PIP.$$ || function () { return []; };
  var audio = PIP.audio || { isOn: function () { return false; }, note: function () {}, pop: function () {}, SCALE: [523, 659, 784] };

  var isOpen = false;

  function openMenu() {
    var menu = $('#startMenu');
    var btn = $('.start');
    if (!menu || !btn) return;

    isOpen = true;
    menu.hidden = false;
    btn.setAttribute('aria-expanded', 'true');
    menu.classList.add('is-open');

    if (audio.isOn()) {
      audio.note(audio.SCALE[4], { dur: 0.35, gain: 0.14 });
      audio.note(audio.SCALE[6], { dur: 0.45, gain: 0.16, when: 0.06 });
    }

    var firstItem = menu.querySelector('a, button');
    if (firstItem) firstItem.focus();
  }

  function closeMenu() {
    var menu = $('#startMenu');
    var btn = $('.start');
    if (!menu || !btn) return;

    isOpen = false;
    menu.hidden = true;
    btn.setAttribute('aria-expanded', 'false');
    menu.classList.remove('is-open');

    if (audio.isOn()) {
      audio.pop();
    }
  }

  function toggleMenu() {
    if (isOpen) closeMenu();
    else openMenu();
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(function () {});
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(function () {});
      }
    }
  }

  function initTaskbar() {
    var startBtn = $('.start');
    var menu = $('#startMenu');
    if (!startBtn || !menu) return;

    startBtn.setAttribute('aria-haspopup', 'true');
    startBtn.setAttribute('aria-expanded', 'false');

    startBtn.addEventListener('click', function (e) {
      e.preventDefault();
      toggleMenu();
    });

    // Close on outside click
    document.addEventListener('click', function (e) {
      if (!isOpen) return;
      if (!menu.contains(e.target) && !startBtn.contains(e.target)) {
        closeMenu();
      }
    });

    // Keyboard navigation
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        closeMenu();
        startBtn.focus();
      }
    });

    // Action handlers inside start menu
    menu.addEventListener('click', function (e) {
      var item = e.target.closest('[data-start-act]');
      if (!item) return;

      var act = item.getAttribute('data-start-act');
      if (act === 'fullscreen') {
        toggleFullscreen();
        closeMenu();
      } else if (act === 'close') {
        closeMenu();
      }
    });

    // When clicking any link inside start menu, close menu and smooth scroll
    var links = menu.querySelectorAll('a[href^="#"]');
    links.forEach(function (link) {
      link.addEventListener('click', function () {
        closeMenu();
      });
    });
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initTaskbar);
    } else {
      initTaskbar();
    }
  }

  var taskbarAPI = {
    init: initTaskbar,
    openMenu: openMenu,
    closeMenu: closeMenu,
    toggleMenu: toggleMenu,
    toggleFullscreen: toggleFullscreen,
    isOpen: function () { return isOpen; }
  };

  PIP.taskbar = taskbarAPI;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = taskbarAPI;
  }
})();
