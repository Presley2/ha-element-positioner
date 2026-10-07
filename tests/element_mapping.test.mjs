import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { test } from 'node:test';
const source = readFileSync(new URL('../custom_components/element_positioner/frontend/drag_editor.js', import.meta.url), 'utf8');
const start = source.indexOf('  function findDomElByPos(');
const end = source.indexOf('  // Bei conditional-Elementen', start);
const lookup = new Function('window', source.slice(start, end) + '; return findDomElByPos;')({ getComputedStyle: () => ({ display: 'block', visibility: 'visible', opacity: '1', pointerEvents: 'auto' }) });
const rect = {left: 0, top: 0, width: 1000, height: 1400};
function node(top, left, bounds) { return {style: {top, left}, getBoundingClientRect: () => bounds}; }
test('rotated text uses its own anchor even with a large bounding box', () => {
 const text = node('60%', '26%', {left: 240, top: 560, width: 40, height: 560});
 const nearby = node('59%', '27%', {left: 250, top: 820, width: 20, height: 20});
 assert.equal(lookup({children:[nearby,text],getBoundingClientRect:()=>rect},60,26),text);
});
test('missing conditional does not resolve to a distant neighbour', () => {
 const unrelated = node('20%', '20%', {left:190,top:270,width:20,height:20});
 assert.equal(lookup({children:[unrelated],getBoundingClientRect:()=>rect},80,80),null);
});
