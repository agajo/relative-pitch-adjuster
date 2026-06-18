import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const css = await readFile(new URL('./styles.css', import.meta.url), 'utf8');

test('page overscroll is disabled to prevent mobile pull-to-refresh during gameplay', () => {
  assert.match(
    css,
    /html, body \{[^}]*overscroll-behavior-y:\s*none;/s
  );
  assert.match(
    css,
    /main \{[^}]*overscroll-behavior-y:\s*contain;/s
  );
});

test('wheel gestures are contained within the picker control', () => {
  assert.match(
    css,
    /\.wheel-container \{[^}]*touch-action:\s*none;[^}]*overscroll-behavior:\s*contain;/s
  );
});


test('wheel tick marks stay compact and light for the 8px item extent', () => {
  assert.match(
    css,
    /\.wheel-item \{[^}]*height:\s*8px;[^}]*margin-top:\s*-4px;/s
  );
  assert.match(
    css,
    /\.wheel-item__bar \{[^}]*height:\s*2px;[^}]*opacity:\s*0\.52;/s
  );
  assert.match(
    css,
    /\.wheel-item--selected \.wheel-item__bar \{[^}]*height:\s*3px;[^}]*opacity:\s*0\.95;/s
  );
});
