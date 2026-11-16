const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const ROOT_DIR = path.resolve(__dirname, '..');
const HTML_PATH = path.join(ROOT_DIR, 'index.html');
const TASKBAR_JS_PATH = path.join(ROOT_DIR, 'js', 'taskbar.js');
const CSS_PATH = path.join(ROOT_DIR, 'css', 'style.css');

test('js/taskbar.js exports valid taskbar API with menu lifecycle methods', () => {
  assert.ok(fs.existsSync(TASKBAR_JS_PATH), 'js/taskbar.js must exist');
  const taskbar = require(TASKBAR_JS_PATH);

  assert.strictEqual(typeof taskbar.openMenu, 'function', 'openMenu must be a function');
  assert.strictEqual(typeof taskbar.closeMenu, 'function', 'closeMenu must be a function');
  assert.strictEqual(typeof taskbar.toggleMenu, 'function', 'toggleMenu must be a function');
  assert.strictEqual(typeof taskbar.toggleFullscreen, 'function', 'toggleFullscreen must be a function');
  assert.strictEqual(typeof taskbar.isOpen, 'function', 'isOpen must be a function');
});

test('index.html contains #startMenu component with accessible navigation items', () => {
  assert.ok(fs.existsSync(HTML_PATH), 'index.html must exist');
  const html = fs.readFileSync(HTML_PATH, 'utf8');

  assert.match(html, /id=["']startMenu["']/i, '#startMenu container must exist in index.html');
  assert.match(html, /role=["']menu["']/i, '#startMenu must declare role="menu"');

  // Verify key items
  assert.match(html, /href=["']#lab["']/i, 'Start menu must link to Lullaby Lab');
  assert.match(html, /href=["']#lights["']/i, 'Start menu must link to Nightlights');
  assert.match(html, /href=["']#blocks["']/i, 'Start menu must link to Blocks');
  assert.match(html, /href=["']#story["']/i, 'Start menu must link to Storybook');
  assert.match(html, /data-start-act=["']fullscreen["']/i, 'Start menu must provide fullscreen action');
});

test('css/style.css defines styling for start menu, items, and mobile drawer', () => {
  assert.ok(fs.existsSync(CSS_PATH), 'css/style.css must exist');
  const css = fs.readFileSync(CSS_PATH, 'utf8');

  assert.match(css, /\.start-menu/, 'Must define .start-menu styling');
  assert.match(css, /\.start-menu-head/, 'Must define .start-menu-head');
  assert.match(css, /\.start-menu-list/, 'Must define .start-menu-list');
  assert.match(css, /\.start-item/, 'Must define .start-item styling');
});
