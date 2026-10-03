const fs = require('fs');
const vm = require('vm');
const assert = require('assert');
const src = fs.readFileSync(require('path').join(__dirname, '../custom_components/element_positioner/frontend/drag_editor.js'), 'utf8');
const listeners = new Map();
function target() { return {
 addEventListener(k, f) { if (!listeners.has(k)) listeners.set(k, new Set()); listeners.get(k).add(f); },
 removeEventListener(k, f) { listeners.get(k)?.delete(f); }
}; }
function element() { return {style:{}, children:[], contains(e){return this===e || this.children.includes(e);}, appendChild(e){this.children.push(e);}, remove(){}, addEventListener(k,f){this[k]=f;}}; }
let rect = {left:0,top:0,width:1000,height:500};
const root = {isConnected:true, getBoundingClientRect(){return rect;}};
let activeRoot = root;
let saved = [];
let current;
const context = {state:{}, Number, Math, isNaN, resizeActive:null,
 document:{...target(), documentElement:{...element(),scrollLeft:0,scrollTop:0},createElement:element},
 window:{...target(),pageXOffset:0,pageYOffset:0},
 getActiveRoot:()=>activeRoot, unwrapElStyle:e=>e.elements[0].style,
 setBar:()=>{},t:s=>s,
 getCardByPath:cfg=>cfg,
 getConn:()=>({sendMessagePromise:async msg=>{if(msg.type==='lovelace/config') return current; saved.push(JSON.parse(JSON.stringify(msg.config)));}})
};
vm.createContext(context);
vm.runInContext(src.slice(src.indexOf('  function hideResizeBox() {'),src.indexOf('  // ── Element-Buffer Paste-Button')),context);
function info(){return {card:{elements:[{elements:[{style:{left:'50%',top:'50%',width:'20%',height:'20%'}}]}]}};}
function open(){const i=info();current=i.card;context.showResizeBox(null,0,i,0,[], 'test',{});return context.state.resizeBox;}
function fire(k,e={}){for(const f of [...(listeners.get(k)||[])]) f(e);}
const mouse={clientX:650,clientY:250,preventDefault(){},stopPropagation(){}};
(async()=>{
 open();const box=open();
 assert.equal(listeners.get('mousemove').size,1,'old resize handler must be removed');
 box.children[3].mousedown(mouse);fire('mousemove',mouse);fire('mouseup');
 await new Promise(r=>setImmediate(r));
 assert.equal(saved.length,1);
 const s=saved[0].elements[0].elements[0].style;
 assert.equal(s.left,'52.500%');assert.equal(s.width,'25%');assert.equal(s.top,'50.000%');assert.equal(s.height,'20%');
 assert.equal(parseFloat(s.left)-parseFloat(s.width)/2,40,'opposite edge stays fixed');
 root.isConnected=false;
 activeRoot={isConnected:true,getBoundingClientRect(){return rect;}};
 box.children[3].mousedown(mouse);fire('mousemove',{...mouse,clientX:700});fire('mouseup');
 await new Promise(r=>setImmediate(r));
 assert.equal(saved.length,2,'second resize must work after HA replaces the root');
 const zero=open();zero.children[3].mousedown(mouse);rect={...rect,width:0,height:0};fire('mousemove',mouse);fire('mouseup');
 await new Promise(r=>setImmediate(r));assert.equal(saved.length,2,'zero-size root must never save');
 context.hideResizeBox();assert.equal(listeners.get('mousemove').size,0);assert.equal(listeners.get('mouseup').size,0);
 rect={...rect,width:1000,height:500};
 const selected=open();
 fire('pointerdown',{target:selected.children[3],composedPath:()=>[selected.children[3],selected]});
 assert.equal(context.state.resizeBox,selected,'resize handle preserves selection');
 fire('pointerdown',{target:element(),composedPath:()=>[]});
 assert.equal(context.state.resizeBox,null,'empty-space click deselects');
 assert.equal(listeners.get('pointerdown').size,0,'outside-click handler cleaned up');
 console.log('PASS: repeated conditional selection, independent edge resize, zero-size guard, listener cleanup');
})().catch(e=>{console.error(e);process.exitCode=1;});
