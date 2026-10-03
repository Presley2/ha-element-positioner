import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const source = readFileSync(new URL('../custom_components/element_positioner/frontend/drag_editor.js', import.meta.url), 'utf8');
const start = source.indexOf('  function getPicElsCard(view) {');
const end = source.indexOf('  // Rekursiv tiefstes style-Objekt', start);
assert.ok(start >= 0 && end > start, 'card lookup functions are present');

function lookupFor(matches) {
  const window = { matchMedia: (query) => ({ matches: matches.includes(query) }) };
  return new Function('window', `${source.slice(start, end)}; return { getPicElsCard, getCardByPath, visibleCardPathChanged };`)(window);
}

test('finds the visible picture-elements card inside a sections view', () => {
  const mobile = { type: 'picture-elements', image: '/local/mobile.png', elements: [] };
  const desktop = { type: 'picture-elements', image: '/local/desktop.png', elements: [] };
  const view = {
    type: 'sections',
    sections: [
      { visibility: [{ condition: 'screen', media_query: '(min-aspect-ratio: 601/1000)' }], cards: [desktop] },
      { visibility: [{ condition: 'screen', media_query: '(max-aspect-ratio: 3/5)' }], cards: [mobile] },
    ],
  };
  const { getPicElsCard, getCardByPath } = lookupFor(['(max-aspect-ratio: 3/5)']);
  const found = getPicElsCard(view);

  assert.equal(found.card, mobile);
  assert.equal(getCardByPath({ views: [view] }, 0, found.path), mobile);

  const landscapeLookup = lookupFor(['(min-aspect-ratio: 601/1000)']);
  const landscape = landscapeLookup.getPicElsCard(view);
  assert.equal(landscape.card, desktop);
  assert.equal(landscapeLookup.getCardByPath({ views: [view] }, 0, landscape.path), desktop);
});

test('detects a visible section change after the aspect ratio changes', () => {
  let portrait = false;
  const window = { matchMedia: (query) => ({ matches: query.includes('max-') ? portrait : !portrait }) };
  const { getPicElsCard, visibleCardPathChanged } = new Function('window',
    `${source.slice(start, end)}; return { getPicElsCard, visibleCardPathChanged };`)(window);
  const view = { sections: [
    { visibility: [{ condition: 'screen', media_query: '(min-aspect-ratio: 601/1000)' }], cards: [{ type: 'picture-elements' }] },
    { visibility: [{ condition: 'screen', media_query: '(max-aspect-ratio: 3/5)' }], cards: [{ type: 'picture-elements' }] },
  ] };
  const initialPath = getPicElsCard(view).path.join('/');
  assert.equal(visibleCardPathChanged(view, initialPath), false);
  portrait = true;
  assert.equal(visibleCardPathChanged(view, initialPath), true);
});

test('keeps legacy nested cards working', () => {
  const picture = { type: 'picture-elements', elements: [] };
  const view = { cards: [{ type: 'vertical-stack', cards: [picture] }] };
  const { getPicElsCard, getCardByPath } = lookupFor([]);
  const found = getPicElsCard(view);

  assert.equal(found.card, picture);
  assert.equal(getCardByPath({ views: [view] }, 0, found.path), picture);
});

test('resolves a conditional wrapper inside a visible section', () => {
  const picture = { type: 'picture-elements', elements: [] };
  const view = { type: 'sections', sections: [{ cards: [{ type: 'conditional', card: picture }] }] };
  const { getPicElsCard, getCardByPath } = lookupFor([]);
  const found = getPicElsCard(view);

  assert.equal(found.card, picture);
  assert.equal(getCardByPath({ views: [view] }, 0, found.path), picture);
});
