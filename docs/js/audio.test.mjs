import test from 'node:test';
import assert from 'node:assert/strict';

function createStorage(initial = {}) {
  const store = new Map(Object.entries(initial));
  return {
    getItem(key) {
      return store.has(key) ? store.get(key) : null;
    },
    setItem(key, value) {
      store.set(key, String(value));
    }
  };
}

async function importFreshAudioModule() {
  const cacheBust = `?t=${Date.now()}-${Math.random()}`;
  return import(`./audio.js${cacheBust}`);
}

test('default timbre is 4. FM Soft when no storage exists', async () => {
  global.window = { localStorage: createStorage() };

  const mod = await importFreshAudioModule();

  assert.equal(mod.getCurrentTimbre(), 'fm-soft');
  assert.equal(mod.getTimbrePresets()['fm-soft'].name, '4. FM Soft');
});

test('loads persisted timbre from localStorage on module load', async () => {
  global.window = {
    localStorage: createStorage({ 'relative-pitch-adjuster.timbre': 'triangle' })
  };

  const mod = await importFreshAudioModule();

  assert.equal(mod.getCurrentTimbre(), 'triangle');
});

test('setTimbre persists selected timbre to localStorage', async () => {
  const storage = createStorage();
  global.window = { localStorage: storage };

  const mod = await importFreshAudioModule();
  mod.setTimbre('fm-electric');

  assert.equal(mod.getCurrentTimbre(), 'fm-electric');
  assert.equal(storage.getItem('relative-pitch-adjuster.timbre'), 'fm-electric');
});
