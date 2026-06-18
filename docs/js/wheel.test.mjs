import test from 'node:test';
import assert from 'node:assert/strict';

import {
  clampWheelIndex,
  momentumTargetIndex,
  scrollIndexForDrag,
  selectedIndexForScroll
} from './wheel.js';
import { WheelConfig } from './constants.js';


test('one wheel tick is one cent with an 8px drag distance', () => {
  const start = WheelConfig.CENTER_INDEX;

  assert.equal(WheelConfig.ITEM_EXTENT, 8);
  assert.equal(scrollIndexForDrag(start, -WheelConfig.ITEM_EXTENT), start + 1);
  assert.equal(scrollIndexForDrag(start, WheelConfig.ITEM_EXTENT), start - 1);
});

test('drag position remains fractional until the picker reaches the next item', () => {
  const start = WheelConfig.CENTER_INDEX;

  assert.equal(scrollIndexForDrag(start, -2), start + 0.25);
  assert.equal(selectedIndexForScroll(start + 0.49), start);
  assert.equal(selectedIndexForScroll(start + 0.5), start + 1);
});

test('dragging downward moves toward lower cents and clamps at the limits', () => {
  const start = WheelConfig.CENTER_INDEX;

  assert.equal(scrollIndexForDrag(start, WheelConfig.ITEM_EXTENT * 2), start - 2);
  assert.equal(scrollIndexForDrag(0, WheelConfig.ITEM_EXTENT), 0);
  assert.equal(scrollIndexForDrag(WheelConfig.ITEM_COUNT - 1, -WheelConfig.ITEM_EXTENT), WheelConfig.ITEM_COUNT - 1);
});

test('momentum target snaps to a whole item in the direction of travel', () => {
  const start = WheelConfig.CENTER_INDEX + 0.25;

  assert.equal(momentumTargetIndex(start, 0), WheelConfig.CENTER_INDEX);
  assert.ok(momentumTargetIndex(start, 0.1) > WheelConfig.CENTER_INDEX);
  assert.ok(momentumTargetIndex(start, -0.1) < WheelConfig.CENTER_INDEX);
  assert.equal(Number.isInteger(momentumTargetIndex(start, 0.1)), true);
});

test('momentum target cannot leave the available cent range', () => {
  assert.equal(momentumTargetIndex(0, -10), 0);
  assert.equal(momentumTargetIndex(WheelConfig.ITEM_COUNT - 1, 10), WheelConfig.ITEM_COUNT - 1);
  assert.equal(clampWheelIndex(-1), 0);
  assert.equal(clampWheelIndex(WheelConfig.ITEM_COUNT), WheelConfig.ITEM_COUNT - 1);
});
