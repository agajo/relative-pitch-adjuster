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
