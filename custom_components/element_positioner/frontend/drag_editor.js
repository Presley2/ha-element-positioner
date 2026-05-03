// HA Drag Editor 0.29.6 — YAML editor, Safari/iPad absolute overlay positioning
(function () {
  'use strict';
  if (window.__haDragEditorBooted) {
    console.warn('[HA-Drag-Editor] duplicate init prevented');
    return;
  }
  window.__haDragEditorBooted = true;
  console.log('%c[HA-Drag-Editor] 0.29.6 loaded — ' + new Date().toISOString(), 'background:#0a0;color:#fff;padding:2px 6px;border-radius:3px;font-weight:bold');

  var STORAGE_KEY = 'ha_drag_editor';
  var globalActive = null;
  var formatBuffer = null;
  var elementBuffer = null;  // Tab-übergreifend, wird bei cleanup NICHT gelöscht
  var currentWsPath = null;
  var state = { enabled: false, layer: null, bar: null, pasteBtn: null };

  var LANG = (function () {
    try {
      var ha = document.querySelector('home-assistant');
      var hass = ha && (ha.__data && ha.__data.hass || ha.hass);
      var lang = hass && hass.language || document.documentElement.lang || navigator.language || 'en';
      return String(lang).toLowerCase().indexOf('de') === 0 ? 'de' : 'en';
    } catch (e) {
      return (navigator.language || 'en').toLowerCase().indexOf('de') === 0 ? 'de' : 'en';
    }
  })();

  var I18N = {
    de: {
      dragToMove: 'Ziehen zum Verschieben',
      undoTitle: 'Ctrl+Z — Undo',
      redoTitle: 'Ctrl+Y — Redo',
      resizeTitle: 'Resize-Modus: Klick → Kreuz anklicken → Handles ziehen',
      snapTitle: 'Klick: Off → 1% → 3% → 5% → Off',
      connectionLost: 'Verbindung verloren',
      connectionLostRestart: 'Verbindung verloren — Editor neu starten',
      undoDoing: 'Rückgängig machen...',
      redoDoing: 'Wiederherstellen...',
      undoDone: 'Rückgängig',
      redoDone: 'Wiederhergestellt',
      error: 'Fehler',
      gridOff: 'Aus',
      elements: 'Elemente',
      filter: 'Filter',
      resizeOn: '✓ Resize aktiv — auf Element klicken',
      resizeOff: 'Resize deaktiviert',
      noStyle: '❌ Element hat kein style-Objekt',
      resizeClosed: 'Resize-Box geschlossen',
      savingScale: 'Speichere Skalierung...',
      noStyleShort: 'kein style',
      scaleSaved: '✓ Skalierung gespeichert: ',
      resizeBoxHint: '🔲 Resize-Box: an Eck-Handles ziehen',
      insert: 'einfügen',
      insertTitle: 'Element in dieses Tab einfügen',
      clearBuffer: 'Buffer leeren',
      bufferCleared: 'Buffer geleert',
      inserting: 'Füge ein...',
      noPictureElements: '❌ Kein picture-elements in diesem Tab',
      inserted: 'eingefügt',
      yamlReadOnly: 'YAML · read-only',
      yamlEditable: 'YAML · editierbar',
      edit: 'Bearbeiten',
      copied: '✓ Kopiert!',
      copyElement: '📋 Element kopieren',
      inBuffer: '✓ Im Buffer!',
      copiedSwitchPaste: 'kopiert — Tab wechseln und einfügen',
      save: 'Speichern',
      saving: 'Speichert...',
      saved: '✓ Gespeichert',
      yamlError: '❌ YAML-Fehler: ',
      delete: '🗑 Löschen',
      confirm: '⚠ Sicher?',
      deleting: 'Lösche...',
      deleted: 'gelöscht',
      close: 'Schließen',
      formatCopied: 'Format von [{name}] kopiert — Alt+Klick auf Ziel',
      transferringFormat: 'Übertrage Format → ',
      formatApplied: '✓ Format übertragen auf ',
      haConnNotFound: '❌ HA-Verbindung nicht gefunden',
      viewNotFound: '❌ View nicht gefunden',
      rootNotFoundAfterWait: '❌ #root nicht gefunden nach Wartezeit',
      loading: 'Lade...',
      loadingItem: 'Lade ',
      noPictureInView: 'kein picture-elements',
      unmarked: 'demarkiert',
      marked: 'markiert',
      active: 'aktiv',
      noRoot: '❌ Kein picture-elements Root gefunden',
      domNotFound: '❌ DOM-Element nicht gefunden (Tab-Wechsel? Neu laden)',
      saveNotConfirmed: '❌ Speichern nicht bestätigt für ',
      saveError: '❌ Save-Fehler ',
      defaultSuffix: 'Elemente  |  Dblclick=YAML  Alt=Format',
      allUnmarked: 'Alle demarkiert',
      arrowKey: 'Pfeiltaste'
    },
    en: {
      dragToMove: 'Drag to move',
      undoTitle: 'Ctrl+Z — Undo',
      redoTitle: 'Ctrl+Y — Redo',
      resizeTitle: 'Resize mode: click → select crosshair → drag handles',
      snapTitle: 'Click: Off → 1% → 3% → 5% → Off',
      connectionLost: 'Connection lost',
      connectionLostRestart: 'Connection lost — restart editor',
      undoDoing: 'Undoing...',
      redoDoing: 'Redoing...',
      undoDone: 'Undo',
      redoDone: 'Redone',
      error: 'Error',
      gridOff: 'Off',
      elements: 'elements',
      filter: 'filter',
      resizeOn: '✓ Resize active — click an element',
      resizeOff: 'Resize disabled',
      noStyle: '❌ Element has no style object',
      resizeClosed: 'Resize box closed',
      savingScale: 'Saving scale...',
      noStyleShort: 'no style',
      scaleSaved: '✓ Scale saved: ',
      resizeBoxHint: '🔲 Resize box: drag corner handles',
      insert: 'paste',
      insertTitle: 'Paste element into this tab',
      clearBuffer: 'Clear buffer',
      bufferCleared: 'Buffer cleared',
      inserting: 'Pasting...',
      noPictureElements: '❌ No picture-elements in this tab',
      inserted: 'pasted',
      yamlReadOnly: 'YAML · read-only',
      yamlEditable: 'YAML · editable',
      edit: 'Edit',
      copied: '✓ Copied!',
      copyElement: '📋 Copy element',
      inBuffer: '✓ In buffer!',
      copiedSwitchPaste: 'copied — switch tab and paste',
      save: 'Save',
      saving: 'Saving...',
      saved: '✓ Saved',
      yamlError: '❌ YAML error: ',
      delete: '🗑 Delete',
      confirm: '⚠ Sure?',
      deleting: 'Deleting...',
      deleted: 'deleted',
      close: 'Close',
      formatCopied: 'Format copied from [{name}] — Alt+click target',
      transferringFormat: 'Applying format → ',
      formatApplied: '✓ Format applied to ',
      haConnNotFound: '❌ HA connection not found',
      viewNotFound: '❌ View not found',
      rootNotFoundAfterWait: '❌ #root not found after waiting',
      loading: 'Loading...',
      loadingItem: 'Loading ',
      noPictureInView: 'no picture-elements',
      unmarked: 'unselected',
      marked: 'selected',
      active: 'active',
      noRoot: '❌ No picture-elements root found',
      domNotFound: '❌ DOM element not found (tab change? reload)',
      saveNotConfirmed: '❌ Save not confirmed for ',
      saveError: '❌ Save error ',
      defaultSuffix: 'elements  |  Dblclick=YAML  Alt=Format',
      allUnmarked: 'Selection cleared',
      arrowKey: 'arrow key'
    }
  };
  function t(key, vars) {
    var text = (I18N[LANG] && I18N[LANG][key]) || I18N.en[key] || key;
    if (vars) Object.keys(vars).forEach(function (k) { text = text.replace('{' + k + '}', vars[k]); });
    return text;
  }

  // Undo/Redo System
  var undoStack = [];
  var redoStack = [];
  var MAX_HISTORY = 20;

  // Snap Grid
  var snapGrid = localStorage.getItem('ha_drag_snap_grid') || 'off';
  var SNAP_OPTIONS = ['off', '1', '3', '5'];
  if (SNAP_OPTIONS.indexOf(snapGrid) === -1) snapGrid = 'off';

  // Bulk Operations
  var selectedElements = {};  // { idx: { t, l, h } }

  // Element Search
  var searchQuery = '';
  var allHandles = [];  // { idx, h, name }

  // Resize Mode
  var resizeMode = localStorage.getItem('ha_drag_resize_mode') === 'true';
  var resizeActive = null;

  // Pfeiltasten-Target: zuletzt angeklicktes Kreuz
  var lastArrowTarget = null;
  var arrowSaveTimer = null;  // einziger globaler Debounce-Timer für Pfeiltasten
  function setLastArrowTarget(t) {
    if (lastArrowTarget && lastArrowTarget.h && lastArrowTarget.h._ring) lastArrowTarget.h._ring.style.opacity = '0';
    lastArrowTarget = t;
    if (lastArrowTarget && lastArrowTarget.h && lastArrowTarget.h._ring) lastArrowTarget.h._ring.style.opacity = '1';
    if (!lastArrowTarget && state.defaultBarMsg) setBar(state.defaultBarMsg);
  }

  var FORMAT_SKIP = ['entity', 'style', 'conditions', 'type', 'name', 'label', 'elements', 'image'];

  // ── Shadow DOM Traversal ───────────────────────────────────────────────────

  function findEl(root, sel) {
    if (!root) return null;
    var f = root.querySelector && root.querySelector(sel);
    if (f) return f;
    var all = root.querySelectorAll ? root.querySelectorAll('*') : [];
    for (var i = 0; i < all.length; i++) {
      if (all[i].shadowRoot) { f = findEl(all[i].shadowRoot, sel); if (f) return f; }
    }
    return null;
  }

  function findAllRoots() {
    var results = [];
    function isVisibleInActiveView(node) {
      if (!node || !node.getBoundingClientRect) return false;
      var rect = node.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return false;

      var n = node;
      while (n && n !== document.documentElement) {
        if (n.nodeType === 1) {
          var cs = window.getComputedStyle(n);
          if (!cs || cs.display === 'none' || cs.visibility === 'hidden') return false;
          if (cs.opacity === '0') return false;
          if (n.hasAttribute && (n.hasAttribute('hidden') || n.getAttribute('aria-hidden') === 'true')) return false;
        }
        n = n.parentNode || (n.getRootNode && n.getRootNode().host);
      }

      var view = node.closest && node.closest('hui-view');
      if (view) {
        var vcs = window.getComputedStyle(view);
        if (!vcs || vcs.display === 'none' || vcs.visibility === 'hidden' || vcs.opacity === '0') return false;
        if (view.hasAttribute('hidden') || view.getAttribute('aria-hidden') === 'true') return false;
      }
      return true;
    }
    function search(root) {
      if (!root) return;
      var els = root.querySelectorAll ? root.querySelectorAll('*') : [];
      for (var i = 0; i < els.length; i++) {
        if (els[i].id === 'root' && isVisibleInActiveView(els[i])) results.push(els[i]);
        if (els[i].shadowRoot) search(els[i].shadowRoot);
      }
    }
    search(document);
    return results;
  }

  function getActiveRoot() {
    var roots = findAllRoots();
    if (!roots.length) return null;
    // 1. Bevorzuge explizit #root-Elemente aus hui-picture-elements-card Shadow-DOM
    //    (in sidebar/masonry Views können andere Komponenten ebenfalls #root haben)
    var peRoots = [];
    for (var k = 0; k < roots.length; k++) {
      try {
        var host = roots[k].getRootNode && roots[k].getRootNode().host;
        if (host && host.tagName && host.tagName.toLowerCase() === 'hui-picture-elements-card') {
          peRoots.push(roots[k]);
        }
      } catch (e) {}
    }
    var candidates = peRoots.length > 0 ? peRoots : roots;
    // 2. Unter den Kandidaten: nur viewport-sichtbare
    var vw = window.innerWidth, vh = window.innerHeight;
    var best = null, bestArea = 0;
    for (var i = 0; i < candidates.length; i++) {
      var r = candidates[i].getBoundingClientRect();
      if (r.right < 0 || r.bottom < 0 || r.left > vw || r.top > vh) continue;
      var area = r.width * r.height;
      if (area > bestArea) { bestArea = area; best = candidates[i]; }
    }
    if (best) return best;
    // 3. Fallback: größter Kandidat unabhängig von Sichtbarkeit
    for (var j = 0; j < candidates.length; j++) {
      var r2 = candidates[j].getBoundingClientRect();
      var area2 = r2.width * r2.height;
      if (area2 > bestArea) { bestArea = area2; best = candidates[j]; }
    }
    return best;
  }

  function getRect() {
    var root = getActiveRoot();
    return root ? root.getBoundingClientRect() : null;
  }

  // Findet das DOM-Element im picture-elements #root, das einer Position (top%/left%)
  // am nächsten kommt. Wird beim Drag-Start aufgerufen, damit das Element live mitwandert.
  function findDomElByPos(root, topPct, leftPct, opts) {
    opts = opts || {};
    if (!root) return null;
    var rr = root.getBoundingClientRect();
    var targetX = leftPct / 100 * rr.width;
    var targetY = topPct / 100 * rr.height;
    var children = root.children;
    var best = null, bestDist = Infinity;
    for (var i = 0; i < children.length; i++) {
      var c = children[i];
      // Skip background image (vollflächig)
      var cr = c.getBoundingClientRect();
      if (cr.width >= rr.width * 0.95 && cr.height >= rr.height * 0.95) continue;
      // Skip nicht-interaktive/overlay-artige Targets (führen sonst zu falscher Zuordnung)
      var cs = window.getComputedStyle(c);
      if (!cs) continue;
      if (cs.display === 'none' || cs.visibility === 'hidden' || cs.opacity === '0') continue;
      if (cs.pointerEvents === 'none') continue;
      // Sehr große Flächen (z. B. Glow-Conditionals) nicht als Drag-Target verwenden
      if (cr.width >= rr.width * 0.35 || cr.height >= rr.height * 0.35) continue;
      // Position relativ zum root
      var cx = (cr.left - rr.left) + cr.width / 2;
      var cy = (cr.top - rr.top) + cr.height / 2;
      var dx = cx - targetX, dy = cy - targetY;
      var d = dx * dx + dy * dy;
      if (opts.maxDistPct) {
        var maxPx = Math.max(rr.width, rr.height) * opts.maxDistPct / 100;
        if (d > maxPx * maxPx) continue;
      }
      if (d < bestDist) { bestDist = d; best = c; }
    }
    return best;
  }

  function getConn() {
    var ha = document.querySelector('home-assistant');
    var hass = ha && (ha.__data && ha.__data.hass || ha.hass);
    return hass && hass.connection;
  }

  function getCurrentLoc() {
    var parts = window.location.pathname.split('/').filter(Boolean);
    return { dash: parts[0] || 'lovelace', view: parts[1] || null };
  }

  function isLovelacePath() {
    var first = (window.location.pathname.split('/').filter(Boolean)[0] || '');
    return first === 'lovelace' || first.indexOf('lovelace-') === 0;
  }

  function isIgnorableConfigError(err) {
    var msg = String((err && (err.message || err.code || err.error)) || err || '').toLowerCase();
    return msg.indexOf('unknown config') !== -1 ||
           msg.indexOf('dashboard not found') !== -1 ||
           msg.indexOf('not found') !== -1;
  }

  function getViewIdx(cfg, viewPath) {
    if (viewPath == null) return 0;
    for (var i = 0; i < cfg.views.length; i++) {
      var v = cfg.views[i];
      if (String(i) === String(viewPath)) return i;
      if (v.path && v.path === viewPath) return i;
      if (v.title && v.title.toLowerCase() === String(viewPath).toLowerCase()) return i;
    }
    return 0;
  }

  function getPicElsCard(view) {
    function search(cards, path) {
      if (!cards) return null;
      for (var i = 0; i < cards.length; i++) {
        var c = cards[i];
        if (c.type === 'picture-elements') return { card: c, path: path.concat([i]) };
        // Verschachtelt in cards-Array (grid-card, layout-card, vertical-stack, ...)
        if (c.cards) {
          var found = search(c.cards, path.concat([i, 'cards']));
          if (found) return found;
        }
        // Verschachtelt in card-Singular (restriction-card, config-template-card, ...)
        if (c.card && typeof c.card === 'object') {
          var foundS = search([c.card], path.concat([i, 'card']));
          if (foundS) return foundS;
        }
      }
      return null;
    }
    if (!view || !view.cards) return null;
    return search(view.cards, []);
  }

  function getCardByPath(cfg, viewIdx, path) {
    // path kann gemischte Array-Indizes und 'cards'/'card'-Keys enthalten
    var node = cfg.views[viewIdx].cards;
    for (var i = 0; i < path.length; i++) {
      node = node[path[i]];
    }
    return node;
  }

  // Rekursiv tiefstes style-Objekt mit top/left finden (conditional-Verschachtelung)
  function unwrapElStyle(el) {
    if (!el) return null;
    if (el.style && el.style.top != null && el.style.top !== '') return el.style;
    if (el.elements && el.elements.length > 0) return unwrapElStyle(el.elements[0]);
    return null;
  }

  function getElInfo(el) {
    var s = unwrapElStyle(el);
    if (!s) return null;
    var t = parseFloat(s.top), l = parseFloat(s.left);
    if (isNaN(t) || isNaN(l)) return null;
    return { top: t, left: l };
  }

  function setElPosOnElement(el, t, l) {
    var s = unwrapElStyle(el);
    if (!s && !el.style) return false;
    // Niemals Infinity/NaN speichern → Element würde unsichtbar werden
    if (typeof t !== 'number' || !isFinite(t)) t = 50;
    if (typeof l !== 'number' || !isFinite(l)) l = 50;
    t = Math.max(0, Math.min(100, t));
    l = Math.max(0, Math.min(100, l));
    var topVal = t.toFixed(1) + '%';
    var leftVal = l.toFixed(1) + '%';
    // Direkt am Element schreiben, falls vorhanden
    if (el.style) {
      el.style.top = topVal;
      el.style.left = leftVal;
    }
    // Und zusätzlich auf das aufgelöste style-Objekt (z.B. conditional -> inner element)
    if (s) {
      s.top = topVal;
      s.left = leftVal;
    }
    return true;
  }

  function saveElPos(cfg, viewIdx, cardPath, elIdx, t, l) {
    var card = getCardByPath(cfg, viewIdx, cardPath);
    var el = card.elements[elIdx];
    return setElPosOnElement(el, t, l);
  }

  function readElPosFromCfg(cfg, viewIdx, cardPath, elIdx) {
    try {
      var card = getCardByPath(cfg, viewIdx, cardPath);
      return getElInfo(card.elements[elIdx]);
    } catch (e) {
      return null;
    }
  }


  function shortName(el, idx, info) {
    var e = el.entity || (el.card && el.card.entity)
          || (el.elements && el.elements[0] && el.elements[0].entity)
          || (el.conditions && el.conditions[0] && el.conditions[0].entity)
          || '';
    var n = e.replace(/sensor\.|switch\.|light\.|binary_sensor\./g, '')
             .replace(/rollo_\dog_/g, 'r_').replace(/_level$/, '').replace(/_state$/, '')
             .replace(/licht_\dog_/g, 'L_').replace(/kontakt_\dog_/g, 'k_');
    if (!n) {
      if (el.type === 'custom:mushroom-chips-card') {
        var chip0 = el.chips && el.chips[0] && el.chips[0].entity || '';
        n = 'chips:' + chip0.split('.').pop().replace(/_state$/, '') || ('el' + idx);
      } else {
        var img = el.image || (el.elements && el.elements[0] && el.elements[0].image) || '';
        n = img.split('/').pop().replace(/\.[^.]+$/, '') || ('el' + idx);
      }
    }
    if (el.type === 'conditional' && el.elements && el.elements[0] &&
        el.elements[0].type === 'custom:button-card' && !el.elements[0].entity) {
      n = '⬤ ' + n;
    }
    var typeTag = el.type || 'el';
    var posTag = info ? ('@' + info.top.toFixed(1) + '/' + info.left.toFixed(1)) : '';
    return '[' + idx + '] ' + typeTag + ' | ' + n + posTag;
  }

  // ── YAML Serializer ────────────────────────────────────────────────────────

  function toYaml(val, depth) {
    if (depth === undefined) depth = 0;
    var pad = '';
    for (var i = 0; i < depth; i++) pad += '  ';

    if (val === null || val === undefined) return 'null';
    if (typeof val === 'boolean') return val ? 'true' : 'false';
    if (typeof val === 'number') return String(val);
    if (typeof val === 'string') {
      if (val === '') return "''";
      if (/[:{}\[\],#&*?|<>=!%@`\n\r]/.test(val) ||
          /^\s|\s$/.test(val) ||
          val === 'true' || val === 'false' || val === 'null' ||
          val === 'yes' || val === 'no' || !isNaN(Number(val))) {
        return JSON.stringify(val);
      }
      return val;
    }
    if (Array.isArray(val)) {
      if (val.length === 0) return '[]';
      return val.map(function (item) {
        if (typeof item === 'object' && item !== null) {
          var inner = toYaml(item, depth + 1);
          var innerLines = inner.split('\n');
          // first key on same line as dash
          return pad + '- ' + innerLines[0].slice((depth + 1) * 2) +
            (innerLines.length > 1 ? '\n' + innerLines.slice(1).join('\n') : '');
        }
        return pad + '- ' + toYaml(item, 0);
      }).join('\n');
    }
    var keys = Object.keys(val);
    if (keys.length === 0) return '{}';
    return keys.map(function (k) {
      var v = val[k];
      if (typeof v === 'object' && v !== null) {
        if (Array.isArray(v) && v.length === 0) return pad + k + ': []';
        if (!Array.isArray(v) && Object.keys(v).length === 0) return pad + k + ': {}';
        return pad + k + ':\n' + toYaml(v, depth + 1);
      }
      return pad + k + ': ' + toYaml(v, 0);
    }).join('\n');
  }

  function parseYamlScalar(raw) {
    var s = String(raw == null ? '' : raw).trim();
    if (s === '' || s === "''") return '';
    if (s === 'null') return null;
    if (s === 'true') return true;
    if (s === 'false') return false;
    if (s === '[]') return [];
    if (s === '{}') return {};
    if ((s[0] === '"' && s[s.length - 1] === '"') || (s[0] === "'" && s[s.length - 1] === "'")) {
      if (s[0] === '"') return JSON.parse(s);
      return s.slice(1, -1).replace(/''/g, "'");
    }
    if (/^-?(?:0|[1-9]\d*)(?:\.\d+)?$/.test(s)) return Number(s);
    return s;
  }

  function splitYamlKeyVal(text) {
    var inS = false, inD = false;
    for (var i = 0; i < text.length; i++) {
      var ch = text[i];
      if (ch === "'" && !inD) inS = !inS;
      else if (ch === '"' && !inS && text[i - 1] !== '\\') inD = !inD;
      else if (ch === ':' && !inS && !inD && (i === text.length - 1 || /\s/.test(text[i + 1]))) {
        return [text.slice(0, i).trim(), text.slice(i + 1).trim()];
      }
    }
    return null;
  }

  function parseYaml(text) {
    var rawLines = String(text || '').replace(/\t/g, '  ').split(/\r?\n/);
    var lines = [];
    rawLines.forEach(function (line) {
      if (!line.trim() || line.trim().charAt(0) === '#') return;
      var m = line.match(/^ */);
      lines.push({ indent: m ? m[0].length : 0, text: line.trim() });
    });
    if (!lines.length) return {};

    function parseBlock(pos, indent) {
      if (pos >= lines.length) return { value: {}, pos: pos };
      if (lines[pos].indent < indent) return { value: {}, pos: pos };
      if (lines[pos].text.indexOf('- ') === 0 && lines[pos].indent === indent) return parseList(pos, indent);
      return parseMap(pos, indent);
    }

    function parseList(pos, indent) {
      var arr = [];
      while (pos < lines.length && lines[pos].indent === indent && lines[pos].text.indexOf('- ') === 0) {
        var rest = lines[pos].text.slice(2).trim();
        pos++;
        if (!rest) {
          var nested = parseBlock(pos, indent + 2);
          arr.push(nested.value);
          pos = nested.pos;
          continue;
        }
        var kv = splitYamlKeyVal(rest);
        if (kv) {
          var obj = {};
          if (!kv[0]) throw new Error('missing key');
          if (kv[1] === '') {
            var nestedVal = parseBlock(pos, indent + 2);
            obj[kv[0]] = nestedVal.value;
            pos = nestedVal.pos;
          } else {
            obj[kv[0]] = parseYamlScalar(kv[1]);
          }
          while (pos < lines.length && lines[pos].indent >= indent + 2) {
            if (lines[pos].indent === indent + 2 && lines[pos].text.indexOf('- ') !== 0) {
              var more = parseMap(pos, indent + 2);
              Object.keys(more.value).forEach(function (k) { obj[k] = more.value[k]; });
              pos = more.pos;
            } else {
              break;
            }
          }
          arr.push(obj);
        } else {
          arr.push(parseYamlScalar(rest));
        }
      }
      return { value: arr, pos: pos };
    }

    function parseMap(pos, indent) {
      var obj = {};
      while (pos < lines.length && lines[pos].indent === indent && lines[pos].text.indexOf('- ') !== 0) {
        var kv = splitYamlKeyVal(lines[pos].text);
        if (!kv || !kv[0]) throw new Error('line ' + (pos + 1) + ': expected key: value');
        pos++;
        if (kv[1] === '') {
          var nested = parseBlock(pos, indent + 2);
          obj[kv[0]] = nested.value;
          pos = nested.pos;
        } else {
          obj[kv[0]] = parseYamlScalar(kv[1]);
        }
      }
      return { value: obj, pos: pos };
    }

    var parsed = parseBlock(0, lines[0].indent);
    if (parsed.pos < lines.length) throw new Error('line ' + (parsed.pos + 1) + ': unexpected indentation');
    return parsed.value;
  }

  // ── Status-Bar ─────────────────────────────────────────────────────────────

  function ensureBar() {
    if (state.bar && document.documentElement.contains(state.bar)) return state.bar;
    var oldBars = document.querySelectorAll('#ha-drag-editor-bar');
    for (var obi = 0; obi < oldBars.length; obi++) oldBars[obi].remove();
    var bar = document.createElement('div');
    bar.id = 'ha-drag-editor-bar';
    // position:absolute + manuelles viewport-tracking → funktioniert auch in Safari
    // (position:fixed bricht in Safari innerhalb von HA's transform-Containern)
    bar.style.cssText = 'position:absolute;z-index:2147483647;width:min(1120px,calc(100vw - 24px));background:rgba(0,0,0,0.78);color:white;font:bold 11px monospace;border-radius:8px;pointer-events:all;user-select:none;box-shadow:0 4px 12px rgba(0,0,0,0.6);display:flex;align-items:center;gap:6px;padding:10px 14px;cursor:move;border:1px solid rgba(255,255,255,0.3);box-sizing:border-box;';

    var dragHandle = document.createElement('div');
    dragHandle.style.cssText = 'width:8px;height:8px;background:rgba(255,255,255,0.6);border-radius:50%;cursor:grab;flex-shrink:0;';
    dragHandle.title = t('dragToMove');
    bar.appendChild(dragHandle);

    // Position-Tracking: Bar relativ zum Viewport halten (default: bottom-right, 20px Abstand)
    // userPos: { rightOffset, bottomOffset } — wird bei manuellem Drag aktualisiert
    var userPos = null;
    var savedPos = localStorage.getItem('ha_drag_bar_pos');
    if (savedPos) {
      try { userPos = JSON.parse(savedPos); } catch (e) {}
    }

    var repositionScheduled = false;
    function reposition() {
      if (repositionScheduled) return;
      repositionScheduled = true;
      requestAnimationFrame(function () {
        repositionScheduled = false;
        if (!bar.parentNode) return;
        var w = bar.offsetWidth || 520;
        var h = bar.offsetHeight || 40;
        var vw = window.innerWidth;
        var vh = window.innerHeight;
        var sx = window.pageXOffset || document.documentElement.scrollLeft || 0;
        var sy = window.pageYOffset || document.documentElement.scrollTop || 0;
        var right = userPos && typeof userPos.right === 'number' ? userPos.right : 20;
        var bottom = userPos && typeof userPos.bottom === 'number' ? userPos.bottom : 20;
        right = Math.max(0, Math.min(right, vw - w));
        bottom = Math.max(0, Math.min(bottom, vh - h));
        bar.style.left = (sx + vw - w - right) + 'px';
        bar.style.top = (sy + vh - h - bottom) + 'px';
      });
    }

    var isDragging = false, startX = 0, startY = 0, startRight = 0, startBottom = 0;
    dragHandle.addEventListener('mousedown', function (e) {
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      startRight = userPos && typeof userPos.right === 'number' ? userPos.right : 20;
      startBottom = userPos && typeof userPos.bottom === 'number' ? userPos.bottom : 20;
      dragHandle.style.cursor = 'grabbing';
      e.preventDefault();
    });
    document.addEventListener('mousemove', function (e) {
      if (!isDragging) return;
      var dx = e.clientX - startX;
      var dy = e.clientY - startY;
      userPos = { right: startRight - dx, bottom: startBottom - dy };
      reposition();
    });
    document.addEventListener('mouseup', function () {
      if (!isDragging) return;
      isDragging = false;
      dragHandle.style.cursor = 'grab';
      if (userPos) localStorage.setItem('ha_drag_bar_pos', JSON.stringify(userPos));
    });

    // documentElement statt body — body kann transform haben, html nicht
    document.documentElement.appendChild(bar);

    // initiale Positionierung + tracking
    requestAnimationFrame(reposition);
    window.addEventListener('scroll', reposition, true);
    window.addEventListener('resize', reposition);
    state._barReposition = reposition;

    state.bar = bar;
    state.barUndoBtn = null;
    state.barRedoBtn = null;
    state.barSnapBtn = null;
    state.barMsg = null;
    return bar;
  }

  function updateBar(m) {
    if (!state.bar) ensureBar();
    if (!state.barUndoBtn) {
      var dragHandle = state.bar.querySelector('div');
      state.bar.innerHTML = '';
      state.bar.appendChild(dragHandle);

      // Search input
      var searchInput = document.createElement('input');
      searchInput.type = 'text';
      searchInput.placeholder = '🔍';
      searchInput.style.cssText = 'background:rgba(255,255,255,0.1);color:white;border:1px solid rgba(255,255,255,0.2);padding:3px 6px;border-radius:4px;font:10px monospace;width:80px;margin-right:4px;outline:none;';
      searchInput.addEventListener('input', function () { filterHandles(this.value); });
      searchInput.addEventListener('focus', function () { this.style.background = 'rgba(255,255,255,0.15)'; });
      searchInput.addEventListener('blur', function () { this.style.background = 'rgba(255,255,255,0.1)'; });
      state.bar.appendChild(searchInput);

      state.barUndoBtn = document.createElement('button');
      state.barUndoBtn.style.cssText = 'background:rgba(255,255,255,0.15);color:white;border:1px solid rgba(255,255,255,0.3);padding:4px 10px;border-radius:4px;font:bold 16px monospace;cursor:pointer;margin-right:2px;transition:all 0.2s;line-height:1;';
      state.barUndoBtn.textContent = '↶';
      state.barUndoBtn.title = t('undoTitle');
      state.barUndoBtn.addEventListener('mouseover', function () { this.style.background = 'rgba(255,255,255,0.25)'; });
      state.barUndoBtn.addEventListener('mouseout', function () { this.style.background = 'rgba(255,255,255,0.15)'; });
      state.barUndoBtn.addEventListener('click', function (e) { e.preventDefault(); performUndo(currentWsPath, function () { initEditor(); }); });
      state.bar.appendChild(state.barUndoBtn);

      state.barRedoBtn = document.createElement('button');
      state.barRedoBtn.style.cssText = 'background:rgba(255,255,255,0.15);color:white;border:1px solid rgba(255,255,255,0.3);padding:4px 10px;border-radius:4px;font:bold 16px monospace;cursor:pointer;margin-right:8px;transition:all 0.2s;line-height:1;';
      state.barRedoBtn.textContent = '↷';
      state.barRedoBtn.title = t('redoTitle');
      state.barRedoBtn.addEventListener('mouseover', function () { this.style.background = 'rgba(255,255,255,0.25)'; });
      state.barRedoBtn.addEventListener('mouseout', function () { this.style.background = 'rgba(255,255,255,0.15)'; });
      state.barRedoBtn.addEventListener('click', function (e) { e.preventDefault(); performRedo(currentWsPath, function () { initEditor(); }); });
      state.bar.appendChild(state.barRedoBtn);

      state.barMsg = document.createElement('span');
      state.barMsg.style.cssText = 'flex:1;min-width:0;color:rgba(255,255,255,0.95);font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:clip;';
      state.bar.appendChild(state.barMsg);

      state.barResizeBtn = document.createElement('button');
      state.barResizeBtn.style.cssText = 'background:rgba(255,255,255,0.15);color:white;border:1px solid rgba(255,255,255,0.3);padding:4px 8px;border-radius:4px;font:bold 11px monospace;cursor:pointer;margin-left:4px;transition:all 0.2s;';
      state.barResizeBtn.innerHTML = '<svg width="13" height="13" viewBox="0 0 13 13" fill="none" style="vertical-align:middle"><polyline points="1,5 1,1 5,1" stroke="white" stroke-width="1.5" stroke-linejoin="round" fill="none"/><polyline points="8,1 12,1 12,5" stroke="white" stroke-width="1.5" stroke-linejoin="round" fill="none"/><polyline points="12,8 12,12 8,12" stroke="white" stroke-width="1.5" stroke-linejoin="round" fill="none"/><polyline points="5,12 1,12 1,8" stroke="white" stroke-width="1.5" stroke-linejoin="round" fill="none"/></svg>';
      state.barResizeBtn.title = t('resizeTitle');
      state.barResizeBtn.addEventListener('mouseover', function () { this.style.background = 'rgba(255,255,255,0.25)'; });
      state.barResizeBtn.addEventListener('mouseout', function () { this.style.background = 'rgba(255,255,255,0.15)'; });
      state.barResizeBtn.addEventListener('click', toggleResizeMode);
      state.bar.appendChild(state.barResizeBtn);

      state.barSnapBtn = document.createElement('button');
      state.barSnapBtn.style.cssText = 'background:rgba(255,255,255,0.15);color:white;border:1px solid rgba(255,255,255,0.3);padding:4px 8px;border-radius:4px;font:bold 11px monospace;cursor:pointer;margin-left:4px;transition:all 0.2s;';
      state.barSnapBtn.title = t('snapTitle');
      state.barSnapBtn.addEventListener('mouseover', function () { this.style.background = 'rgba(255,255,255,0.25)'; });
      state.barSnapBtn.addEventListener('mouseout', function () { this.style.background = 'rgba(255,255,255,0.15)'; });
      state.barSnapBtn.addEventListener('click', toggleSnapGrid);
      state.bar.appendChild(state.barSnapBtn);
    }

    state.barResizeBtn.style.background = resizeMode ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.15)';

    state.barUndoBtn.disabled = undoStack.length === 0;
    state.barUndoBtn.style.opacity = undoStack.length === 0 ? '0.4' : '1';
    state.barRedoBtn.disabled = redoStack.length === 0;
    state.barRedoBtn.style.opacity = redoStack.length === 0 ? '0.4' : '1';

    var snapLbl = snapGrid === 'off' ? 'OFF' : snapGrid + '%';
    state.barSnapBtn.innerHTML = '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" style="vertical-align:middle;margin-right:3px"><line x1="4" y1="0" x2="4" y2="12" stroke="white" stroke-width="1"/><line x1="8" y1="0" x2="8" y2="12" stroke="white" stroke-width="1"/><line x1="0" y1="4" x2="12" y2="4" stroke="white" stroke-width="1"/><line x1="0" y1="8" x2="12" y2="8" stroke="white" stroke-width="1"/></svg>' + snapLbl;

    var txt = m;
    if (formatBuffer) txt = '🎨 ' + txt;
    state.barMsg.textContent = txt;
  }

  function setBar(m) {
    updateBar(m);
  }

  function pushUndoState(cfg, viewIdx, cardPath, elIdx, oldTop, oldLeft) {
    redoStack = [];
    undoStack.push({ cfg: JSON.parse(JSON.stringify(cfg)), viewIdx: viewIdx, cardPath: cardPath, elIdx: elIdx, top: oldTop, left: oldLeft });
    if (undoStack.length > MAX_HISTORY) undoStack.shift();
  }

  function performUndo(wsPath, onSuccess) {
    if (undoStack.length === 0) return;
    var st = undoStack.pop();
    var liveConn = getConn();
    if (!liveConn) { setBar('❌ ' + t('connectionLost')); undoStack.push(st); return; }
    setBar(t('undoDoing'));
    // Aktuelle Config holen → für Redo speichern; dann revert auf alten Snapshot
    liveConn.sendMessagePromise({ type: 'lovelace/config', url_path: wsPath, force: true })
      .then(function (currentCfg) {
        redoStack.push({ cfg: JSON.parse(JSON.stringify(currentCfg)) });
        return liveConn.sendMessagePromise({ type: 'lovelace/config/save', url_path: wsPath, config: st.cfg });
      })
      .then(function () { setBar('✓ ' + t('undoDone') + ' (Undo:' + undoStack.length + '  Redo:' + redoStack.length + ')'); onSuccess && onSuccess(); })
      .catch(function (err) { undoStack.push(st); setBar('❌ ' + (err.message || t('error'))); });
  }

  function performRedo(wsPath, onSuccess) {
    if (redoStack.length === 0) return;
    var st = redoStack.pop();
    var liveConn = getConn();
    if (!liveConn) { setBar('❌ ' + t('connectionLost')); redoStack.push(st); return; }
    setBar(t('redoDoing'));
    // Aktuelle Config in undoStack zurückschieben, damit man wieder undo machen kann
    liveConn.sendMessagePromise({ type: 'lovelace/config', url_path: wsPath, force: true })
      .then(function (currentCfg) {
        undoStack.push({ cfg: JSON.parse(JSON.stringify(currentCfg)) });
        if (undoStack.length > MAX_HISTORY) undoStack.shift();
        return liveConn.sendMessagePromise({ type: 'lovelace/config/save', url_path: wsPath, config: st.cfg });
      })
      .then(function () { setBar('✓ ' + t('redoDone') + ' (Undo:' + undoStack.length + '  Redo:' + redoStack.length + ')'); onSuccess && onSuccess(); })
      .catch(function (err) { redoStack.push(st); setBar('❌ ' + (err.message || t('error'))); });
  }

  function snapValue(val) {
    if (snapGrid === 'off') return val;
    var snap = parseInt(snapGrid);
    return Math.round(val / snap) * snap;
  }

  function toggleSnapGrid() {
    var idx = SNAP_OPTIONS.indexOf(snapGrid);
    snapGrid = SNAP_OPTIONS[(idx + 1) % SNAP_OPTIONS.length];
    localStorage.setItem('ha_drag_snap_grid', snapGrid);
    setBar('Grid: ' + (snapGrid === 'off' ? t('gridOff') : snapGrid + '%'));
  }

  function filterHandles(query) {
    searchQuery = query.toLowerCase();
    var matches = 0;
    allHandles.forEach(function (item) {
      var match = !query || item.name.toLowerCase().indexOf(searchQuery) !== -1;
      item.h.style.opacity = match ? '1' : '0.15';
      item.h.style.pointerEvents = match ? 'all' : 'none';
      if (match) matches++;
    });
    var txt = matches + '/' + allHandles.length + ' ' + t('elements');
    if (query) txt = '🔍 ' + txt + ' (' + t('filter') + ': "' + query + '")';
    setBar(txt);
  }

  function toggleResizeMode() {
    resizeMode = !resizeMode;
    localStorage.setItem('ha_drag_resize_mode', String(resizeMode));
    if (!resizeMode) hideResizeBox();
    setBar(resizeMode ? t('resizeOn') : t('resizeOff'));
  }

  // ── Resize-Box ─────────────────────────────────────────────────────────────

  function hideResizeBox() {
    if (state.resizeBox) { state.resizeBox.remove(); state.resizeBox = null; }
    resizeActive = null;
  }

  // Liest Größe eines Style-Objekts in % (Default 14%/15%) — picture-elements default
  function readSize(styleObj, dim, defaultPct) {
    var v = styleObj && styleObj[dim];
    if (v == null || v === '') return defaultPct;
    var p = parseFloat(v);
    return isNaN(p) ? defaultPct : p;
  }

  // Liest den scale-Faktor aus einem transform-String wie "translate(-50%,-50%) scale(0.72)".
  function parseScaleFromTransform(t) {
    if (!t) return 1;
    var m = String(t).match(/scale\(\s*([0-9.]+)\s*\)/);
    return m ? parseFloat(m[1]) : 1;
  }
  function setScaleInTransform(t, newScale) {
    var base = String(t || '').replace(/scale\([^)]*\)/g, '').trim();
    if (!base) base = 'translate(-50%, -50%)';
    return base + ' scale(' + newScale.toFixed(3) + ')';
  }

  function showResizeBox(domEl, elIdx, picInfo, viewIdx, cardPath, wsPath, cfg) {
    hideResizeBox();
    var root = getActiveRoot(); if (!root) return;
    var elCfg = picInfo.card.elements[elIdx];
    var styleObj = unwrapElStyle(elCfg);
    if (!styleObj) { setBar(t('noStyle')); return; }

    var topPct = parseFloat(styleObj.top);
    var leftPct = parseFloat(styleObj.left);
    // Aktueller scale aus transform; wenn keiner gesetzt → 1
    var scale = parseScaleFromTransform(styleObj.transform);
    // Snapshot der initialen DOM-Größe bei scale=1 (für Box-Anzeige)
    var er0 = domEl.getBoundingClientRect();
    var baseW = er0.width / scale;
    var baseH = er0.height / scale;

    var box = document.createElement('div');
    box.style.cssText = 'position:absolute;z-index:99998;border:2px dashed #FFD700;box-sizing:border-box;pointer-events:none;box-shadow:0 0 0 1px rgba(0,0,0,0.5);';
    document.documentElement.appendChild(box);
    state.resizeBox = box;

    function placeBox() {
      var w = baseW * scale;
      var h = baseH * scale;
      var er = domEl.getBoundingClientRect();
      var cx = er.left + er.width / 2;
      var cy = er.top  + er.height / 2;
      var sx = window.pageXOffset || document.documentElement.scrollLeft || 0;
      var sy = window.pageYOffset || document.documentElement.scrollTop  || 0;
      box.style.left = (sx + cx - w / 2) + 'px';
      box.style.top  = (sy + cy - h / 2) + 'px';
      box.style.width  = w + 'px';
      box.style.height = h + 'px';
    }
    placeBox();

    // 8 Resize-Handles (4 Ecken + 4 Kanten)
    var handles = [
      { id:'nw', cur:'nwse-resize', x:'0',    y:'0' },
      { id:'n',  cur:'ns-resize',   x:'50%',  y:'0' },
      { id:'ne', cur:'nesw-resize', x:'100%', y:'0' },
      { id:'e',  cur:'ew-resize',   x:'100%', y:'50%' },
      { id:'se', cur:'nwse-resize', x:'100%', y:'100%' },
      { id:'s',  cur:'ns-resize',   x:'50%',  y:'100%' },
      { id:'sw', cur:'nesw-resize', x:'0',    y:'100%' },
      { id:'w',  cur:'ew-resize',   x:'0',    y:'50%' }
    ];
    handles.forEach(function (hh) {
      var grip = document.createElement('div');
      grip.style.cssText = 'position:absolute;width:12px;height:12px;background:#FFD700;border:2px solid #000;border-radius:2px;left:' + hh.x + ';top:' + hh.y + ';transform:translate(-50%,-50%);cursor:' + hh.cur + ';pointer-events:all;';
      grip.addEventListener('mousedown', function (e) {
        e.preventDefault(); e.stopPropagation();
        resizeActive = {
          id: hh.id, sx: e.clientX, sy: e.clientY, sScale: scale
        };
      });
      box.appendChild(grip);
    });

    // Schließen-Button
    var closeBtn = document.createElement('div');
    closeBtn.style.cssText = 'position:absolute;top:-26px;right:-2px;background:#000;color:#fff;font:bold 11px monospace;padding:3px 8px;border-radius:4px;cursor:pointer;pointer-events:all;border:1px solid #FFD700;';
    closeBtn.textContent = '✕ Resize';
    closeBtn.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); hideResizeBox(); setBar(t('resizeClosed')); });
    box.appendChild(closeBtn);

    // Größen-Anzeige
    var label = document.createElement('div');
    label.style.cssText = 'position:absolute;bottom:-22px;left:0;background:#000;color:#FFD700;font:bold 10px monospace;padding:2px 6px;border-radius:3px;pointer-events:none;';
    box.appendChild(label);

    function updateLabel() {
      label.textContent = 'Scale: ' + (scale * 100).toFixed(0) + '%  (' + Math.round(baseW * scale) + '×' + Math.round(baseH * scale) + 'px)';
    }
    updateLabel();

    // Resize-Mausevents — proportionale Skalierung via transform:scale
    function onMove(e) {
      if (!resizeActive) return;
      var dx = e.clientX - resizeActive.sx;
      var dy = e.clientY - resizeActive.sy;
      var sign = 1;
      var id = resizeActive.id;
      // Diagonal-Skalierung anhand der Größe-Veränderung (positiv = größer)
      // Eckhandles: kombiniertes dx+dy. Kantenhandles: nur die relevante Achse.
      var delta = 0;
      if (id === 'se') delta = (dx + dy) / 2;
      else if (id === 'nw') delta = -(dx + dy) / 2;
      else if (id === 'ne') delta = (dx - dy) / 2;
      else if (id === 'sw') delta = (-dx + dy) / 2;
      else if (id === 'e') delta = dx;
      else if (id === 'w') delta = -dx;
      else if (id === 's') delta = dy;
      else if (id === 'n') delta = -dy;
      // Skalierungs-Sensitivität: 200px Bewegung = ×2
      var newScale = resizeActive.sScale * (1 + delta / 200);
      newScale = Math.max(0.05, Math.min(10, newScale));
      // Snap auf die aktuell gewählte Snap-Stufe (in % Schritten); für Scale halbiert
      if (snapGrid !== 'off') {
        var step = parseFloat(snapGrid) / 100;
        if (step > 0) newScale = Math.round(newScale / step) * step;
      }
      scale = newScale;
      // Live im DOM anwenden
      domEl.style.transform = setScaleInTransform(domEl.style.transform || styleObj.transform, scale);
      placeBox();
      updateLabel();
    }
    function onUp() {
      if (!resizeActive) return;
      resizeActive = null;
      // In Config speichern
      var liveConn = getConn();
      if (!liveConn) { setBar('❌ ' + t('connectionLost')); return; }
      setBar(t('savingScale'));
      liveConn.sendMessagePromise({ type: 'lovelace/config', url_path: wsPath, force: true })
        .then(function (freshCfg) {
          var freshCard = getCardByPath(freshCfg, viewIdx, cardPath);
          var freshEl = freshCard.elements[elIdx];
          var s = unwrapElStyle(freshEl);
          if (!s) throw new Error(t('noStyleShort'));
          if (typeof scale !== 'number' || !isFinite(scale)) scale = 1;
          s.transform = setScaleInTransform(s.transform, scale);
          return liveConn.sendMessagePromise({ type: 'lovelace/config/save', url_path: wsPath, config: freshCfg });
        })
        .then(function () { setBar(t('scaleSaved') + (scale * 100).toFixed(0) + '%'); })
        .catch(function (err) { setBar('❌ ' + (err.message || JSON.stringify(err))); });
    }
    document.addEventListener('mousemove', onMove, true);
    document.addEventListener('mouseup', onUp, true);

    // Repositionierung bei Resize/Scroll
    state._resizeBoxReposition = placeBox;
    window.addEventListener('resize', placeBox);
    window.addEventListener('scroll', placeBox, true);

    setBar(t('resizeBoxHint'));
  }

  // ── Element-Buffer Paste-Button ────────────────────────────────────────────

  function updatePasteBtn() {
    if (state.pasteBtn) { state.pasteBtn.remove(); state.pasteBtn = null; }
    if (state.cancelBtn) { state.cancelBtn.remove(); state.cancelBtn = null; }
    var oldPaste = document.querySelectorAll('#ha-drag-paste-btn, #ha-drag-paste-cancel');
    for (var opi = 0; opi < oldPaste.length; opi++) oldPaste[opi].remove();
    if (!elementBuffer || !state.enabled) return;

    var btn = document.createElement('div');
    btn.id = 'ha-drag-paste-btn';
    // position:absolute auf documentElement — Safari-fix (kein position:fixed in transform-Containern)
    btn.style.cssText = 'position:absolute;z-index:999999;background:rgba(0,0,0,0.7);color:#ccc;font:bold 12px monospace;padding:6px 18px;border-radius:8px;cursor:pointer;white-space:nowrap;box-shadow:0 2px 10px rgba(0,0,0,0.6);';
    btn.textContent = '📋 "' + elementBuffer._name + '" ' + t('insert');
    btn.title = t('insertTitle');
    btn.addEventListener('click', function () { pasteElement(); });

    var cancelBtn = document.createElement('div');
    cancelBtn.id = 'ha-drag-paste-cancel';
    cancelBtn.style.cssText = 'position:absolute;z-index:999999;background:#555;color:#ccc;font:bold 13px monospace;width:28px;height:28px;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,0.6);';
    cancelBtn.textContent = '✕';
    cancelBtn.title = t('clearBuffer');
    cancelBtn.addEventListener('click', function () {
      elementBuffer = null;
      updatePasteBtn();
      setBar(t('bufferCleared'));
    });

    document.documentElement.appendChild(btn);
    document.documentElement.appendChild(cancelBtn);
    state.pasteBtn = btn;
    state.cancelBtn = cancelBtn;

    function repositionPasteBtns() {
      if (!state.pasteBtn || !state.cancelBtn) return;
      var sx = window.pageXOffset || document.documentElement.scrollLeft || 0;
      var sy = window.pageYOffset || document.documentElement.scrollTop  || 0;
      var vw = window.innerWidth;
      var vh = window.innerHeight;
      var ph = btn.offsetHeight || 32;
      var pw = btn.offsetWidth  || 200;
      var bottomGap = 46;
      var bar = state.bar && document.documentElement.contains(state.bar) ? state.bar : document.getElementById('ha-drag-editor-bar');
      if (bar) {
        var br = bar.getBoundingClientRect();
        if (br.height > 0) bottomGap = Math.max(bottomGap, vh - br.top + 12);
      }
      var cy = sy + vh - ph - bottomGap;
      btn.style.left = (sx + vw / 2 - pw / 2) + 'px';
      btn.style.top  = cy + 'px';
      cancelBtn.style.left = (sx + vw / 2 + pw / 2 + 6) + 'px';
      cancelBtn.style.top  = (sy + vh - 28 - bottomGap) + 'px';
    }
    requestAnimationFrame(repositionPasteBtns);
    state._pasteBtnReposition = repositionPasteBtns;
  }

  function pasteElement() {
    if (!elementBuffer) return;
    var liveConn = getConn();
    if (!liveConn) { setBar('❌ ' + t('connectionLost')); return; }
    setBar(t('inserting'));
    liveConn.sendMessagePromise({ type: 'lovelace/config', url_path: currentWsPath, force: true })
      .then(function (freshCfg) {
        var loc = getCurrentLoc();
        var vIdx = getViewIdx(freshCfg, loc.view);
        var view = freshCfg.views[vIdx];
        var picInfo = getPicElsCard(view);
        if (!picInfo) { setBar(t('noPictureElements')); return Promise.reject(new Error('no pic-els')); }
        var card = getCardByPath(freshCfg, vIdx, picInfo.path);
        var newEl = JSON.parse(JSON.stringify(elementBuffer));
        delete newEl._name;
        card.elements.push(newEl);
        return liveConn.sendMessagePromise({ type: 'lovelace/config/save', url_path: currentWsPath, config: freshCfg });
      })
      .then(function () {
        var name = elementBuffer._name;
        elementBuffer = null;
        updatePasteBtn();
        setBar('✓ "' + name + '" ' + t('inserted'));
        setTimeout(initEditor, 600);
      })
      .catch(function (err) {
        if (err.message !== 'no pic-els') setBar('❌ ' + (err.message || JSON.stringify(err)));
      });
  }

  // ── YAML Popup ─────────────────────────────────────────────────────────────

  function showYamlPopup(elCfg, name, cfg, viewIdx, cardPath, elIdx, wsPath) {
    var existing = document.getElementById('ha-drag-yaml-popup');
    if (existing) existing.remove();

    var yaml = toYaml(elCfg, 0);

    var overlay = document.createElement('div');
    overlay.id = 'ha-drag-yaml-popup';
    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:9999999;background:rgba(0,0,0,0.75);display:flex;align-items:center;justify-content:center;';

    var box = document.createElement('div');
    box.style.cssText = 'background:#1a1a1a;border-radius:12px;padding:20px;width:min(680px,94vw);height:80vh;display:flex;flex-direction:column;gap:12px;box-shadow:0 6px 30px rgba(0,0,0,0.9);resize:both;overflow:hidden;min-height:300px;min-width:320px;';

    var header = document.createElement('div');
    header.style.cssText = 'display:flex;align-items:center;justify-content:space-between;gap:12px;';

    var title = document.createElement('div');
    title.style.cssText = 'color:#FF5733;font:bold 13px monospace;';
    title.textContent = '[ ' + name + ' ]';

    var modeLbl = document.createElement('div');
    modeLbl.style.cssText = 'color:#666;font:10px monospace;';
    modeLbl.textContent = t('yamlEditable');

    header.appendChild(title);
    header.appendChild(modeLbl);

    var yamlArea = document.createElement('textarea');
    yamlArea.value = yaml;
    yamlArea.style.cssText = 'color:#e0e0e0;font:11px/1.5 monospace;overflow:auto;flex:1;margin:0;white-space:pre;background:#111;padding:14px;border-radius:8px;width:100%;box-sizing:border-box;border:1px solid #FF5733;resize:none;outline:none;';
    yamlArea.spellcheck = false;

    var errMsg = document.createElement('div');
    errMsg.style.cssText = 'color:#ff4444;font:11px monospace;display:none;';

    var btns = document.createElement('div');
    btns.style.cssText = 'display:flex;gap:8px;justify-content:flex-end;align-items:center;';

    var copyBtn = document.createElement('button');
    copyBtn.style.cssText = 'background:#444;color:#ddd;border:none;padding:7px 14px;border-radius:6px;font:bold 11px monospace;cursor:pointer;';
    copyBtn.textContent = 'Copy YAML';
    copyBtn.addEventListener('click', function () {
      navigator.clipboard.writeText(yamlArea.value).then(function () {
        copyBtn.textContent = t('copied');
        setTimeout(function () { copyBtn.textContent = 'Copy YAML'; }, 2000);
      });
    });

    var copyElBtn = document.createElement('button');
    copyElBtn.style.cssText = 'background:#444;color:#ddd;border:none;padding:7px 14px;border-radius:6px;font:bold 11px monospace;cursor:pointer;';
    copyElBtn.textContent = t('copyElement');
    copyElBtn.addEventListener('click', function () {
      elementBuffer = JSON.parse(JSON.stringify(elCfg));
      elementBuffer._name = name.replace(/^\[.*?\]\s*/, '');
      updatePasteBtn();
      copyElBtn.textContent = t('inBuffer');
      setBar('📋 "' + elementBuffer._name + '" ' + t('copiedSwitchPaste'));
      setTimeout(function () { copyElBtn.textContent = t('copyElement'); overlay.remove(); }, 1200);
    });

    var saveBtn = document.createElement('button');
    saveBtn.style.cssText = 'background:#FF5733;color:white;border:none;padding:7px 18px;border-radius:6px;font:bold 11px monospace;cursor:pointer;';
    saveBtn.textContent = t('save');
    saveBtn.addEventListener('click', function () {
      errMsg.style.display = 'none';
      var edited;
      try { edited = parseYaml(yamlArea.value); }
      catch (e) {
        errMsg.textContent = t('yamlError') + e.message;
        errMsg.style.display = 'block';
        return;
      }
      var card = getCardByPath(cfg, viewIdx, cardPath);
      var el = card.elements[elIdx];
      Object.keys(el).forEach(function (k) { delete el[k]; });
      Object.keys(edited).forEach(function (k) { el[k] = edited[k]; });
      var liveConn = getConn();
      if (!liveConn) {
        errMsg.textContent = '❌ ' + t('connectionLost');
        errMsg.style.display = 'block';
        return;
      }
      saveBtn.textContent = t('saving');
      saveBtn.disabled = true;
      liveConn.sendMessagePromise({ type: 'lovelace/config/save', url_path: wsPath, config: cfg })
        .then(function () {
          saveBtn.textContent = t('saved');
          setBar('✓ [' + elIdx + '] ' + name + ' gespeichert');
          setTimeout(function () { overlay.remove(); }, 1200);
        })
        .catch(function (err) {
          saveBtn.textContent = t('save');
          saveBtn.disabled = false;
          errMsg.textContent = '❌ ' + (err.message || JSON.stringify(err));
          errMsg.style.display = 'block';
        });
    });

    var deleteBtn = document.createElement('button');
    deleteBtn.style.cssText = 'background:#7a1a1a;color:#ffaaaa;border:none;padding:7px 14px;border-radius:6px;font:bold 11px monospace;cursor:pointer;margin-right:auto;';
    deleteBtn.textContent = t('delete');
    deleteBtn.addEventListener('click', function () {
      if (deleteBtn.dataset.confirm !== '1') {
        deleteBtn.textContent = t('confirm');
        deleteBtn.dataset.confirm = '1';
        setTimeout(function () { if (deleteBtn.dataset.confirm === '1') { deleteBtn.textContent = t('delete'); deleteBtn.dataset.confirm = '0'; } }, 3000);
        return;
      }
      var liveConn = getConn();
      if (!liveConn) { errMsg.textContent = '❌ ' + t('connectionLost'); errMsg.style.display = 'block'; return; }
      deleteBtn.textContent = t('deleting');
      deleteBtn.disabled = true;
      liveConn.sendMessagePromise({ type: 'lovelace/config', url_path: wsPath, force: true })
        .then(function (freshCfg) {
          var card = getCardByPath(freshCfg, viewIdx, cardPath);
          card.elements.splice(elIdx, 1);
          return liveConn.sendMessagePromise({ type: 'lovelace/config/save', url_path: wsPath, config: freshCfg });
        })
        .then(function () {
          setBar('🗑 [' + elIdx + '] ' + name + ' ' + t('deleted'));
          overlay.remove();
          setTimeout(initEditor, 600);
        })
        .catch(function (err) {
          deleteBtn.textContent = t('delete');
          deleteBtn.disabled = false;
          deleteBtn.dataset.confirm = '0';
          errMsg.textContent = '❌ ' + (err.message || JSON.stringify(err));
          errMsg.style.display = 'block';
        });
    });

    var closeBtn = document.createElement('button');
    closeBtn.style.cssText = 'background:#333;color:#ccc;border:none;padding:7px 14px;border-radius:6px;font:bold 11px monospace;cursor:pointer;';
    closeBtn.textContent = t('close');
    closeBtn.addEventListener('click', function () { overlay.remove(); });

    overlay.addEventListener('click', function (e) { if (e.target === overlay) overlay.remove(); });
    document.addEventListener('keydown', function esc(e) {
      if (e.key === 'Escape') { overlay.remove(); document.removeEventListener('keydown', esc); }
    });

    btns.appendChild(deleteBtn);
    btns.appendChild(copyBtn);
    btns.appendChild(copyElBtn);
    btns.appendChild(saveBtn);
    btns.appendChild(closeBtn);
    box.appendChild(header);
    box.appendChild(yamlArea);
    box.appendChild(errMsg);
    box.appendChild(btns);
    overlay.appendChild(box);
    document.body.appendChild(overlay);
  }

  // ── Format Painter ─────────────────────────────────────────────────────────

  function copyFormat(elCfg, name) {
    formatBuffer = {};
    Object.keys(elCfg).forEach(function (k) {
      if (FORMAT_SKIP.indexOf(k) === -1) {
        formatBuffer[k] = JSON.parse(JSON.stringify(elCfg[k]));
      }
    });
    setBar(t('formatCopied', { name: name }));
  }

  function pasteFormat(cfg, viewIdx, cardPath, elIdx, name, wsPath) {
    if (!formatBuffer) return;
    var card = getCardByPath(cfg, viewIdx, cardPath);
    var el = card.elements[elIdx];
    Object.keys(el).forEach(function (k) {
      if (FORMAT_SKIP.indexOf(k) === -1) delete el[k];
    });
    Object.keys(formatBuffer).forEach(function (k) {
      el[k] = JSON.parse(JSON.stringify(formatBuffer[k]));
    });
    formatBuffer = null;

    var liveConn = getConn();
    if (!liveConn) { setBar('❌ ' + t('connectionLostRestart')); return; }
    setBar(t('transferringFormat') + '[' + elIdx + '] ' + name + '...');
    liveConn.sendMessagePromise({ type: 'lovelace/config/save', url_path: wsPath, config: cfg })
      .then(function () { setBar(t('formatApplied') + '[' + elIdx + '] ' + name); })
      .catch(function (err) { setBar('❌ ' + (err.message || JSON.stringify(err))); });
  }

  // ── Fadenkreuz ─────────────────────────────────────────────────────────────

  function makeCrosshair(name) {
    var h = document.createElement('div');
    h.style.cssText = 'position:absolute;width:28px;height:28px;cursor:crosshair;pointer-events:all;transform:translate(-50%,-50%);z-index:99998;user-select:none';
    var hl = document.createElement('div');
    hl.style.cssText = 'position:absolute;top:50%;left:0;width:100%;height:1px;background:rgba(255,87,51,0.95);transform:translateY(-50%);box-shadow:0 0 3px rgba(0,0,0,0.9);pointer-events:none';
    var vl = document.createElement('div');
    vl.style.cssText = 'position:absolute;left:50%;top:0;width:1px;height:100%;background:rgba(255,87,51,0.95);transform:translateX(-50%);box-shadow:0 0 3px rgba(0,0,0,0.9);pointer-events:none';
    var dot = document.createElement('div');
    dot.style.cssText = 'position:absolute;top:50%;left:50%;width:6px;height:6px;background:#FF5733;border:1.5px solid white;border-radius:50%;transform:translate(-50%,-50%);box-shadow:0 0 4px rgba(0,0,0,0.8);pointer-events:none;transition:transform 0.1s,background 0.1s';
    var ring = document.createElement('div');
    ring.style.cssText = 'position:absolute;top:50%;left:50%;width:20px;height:20px;border-radius:50%;transform:translate(-50%,-50%);pointer-events:none;opacity:0;transition:opacity 0.2s;border:2px solid #00eeff;box-shadow:0 0 8px #00eeff,0 0 2px rgba(0,238,255,0.4)';
    var lbl = document.createElement('div');
    lbl.style.cssText = 'position:absolute;top:14px;left:12px;background:rgba(0,0,0,0.9);color:#FF5733;font:bold 11px monospace;padding:3px 7px;border-radius:4px;white-space:nowrap;pointer-events:none;opacity:0;transition:opacity 0.15s;box-shadow:0 2px 6px rgba(0,0,0,0.8)';
    lbl.textContent = name;
    h.appendChild(hl); h.appendChild(vl); h.appendChild(ring); h.appendChild(dot); h.appendChild(lbl);
    h._dot = dot; h._ring = ring;
    h.addEventListener('mouseenter', function () { lbl.style.opacity = '0.85'; });
    h.addEventListener('mouseleave', function () { lbl.style.opacity = '0'; });
    return h;
  }

  // ── Cleanup ────────────────────────────────────────────────────────────────

  // Generation-Counter: invalidiert pending tryBuild-Callbacks beim Neuaufbau,
  // verhindert doppelte Kreuze bei schnellem Tab-Wechsel
  var generation = 0;

  function cleanup() {
    generation++;
    state.placeHandlers = [];
    if (state.layer) { state.layer.remove(); state.layer = null; }
    if (state._barInterval) { clearInterval(state._barInterval); state._barInterval = null; }
    if (state.bar) { state.bar.remove(); state.bar = null; }
    hideResizeBox();
    if (state.pasteBtn) { state.pasteBtn.remove(); state.pasteBtn = null; }
    if (state.cancelBtn) { state.cancelBtn.remove(); state.cancelBtn = null; }
    var popup = document.getElementById('ha-drag-yaml-popup');
    if (popup) popup.remove();
    globalActive = null;
    formatBuffer = null;
    undoStack = [];
    redoStack = [];
    selectedElements = {};
    lastArrowTarget = null;
    if (arrowSaveTimer) { clearTimeout(arrowSaveTimer); arrowSaveTimer = null; }
    // elementBuffer bleibt erhalten für Tab-übergreifendes Einfügen

    // Hard cleanup: alle alten Overlay-Reste entfernen (auch von früheren Instanzen)
    try {
      var stale = document.querySelectorAll('[id^="ha-drag-"], #ha-drag-editor-bar, #ha-drag-debug');
      for (var si = 0; si < stale.length; si++) {
        var node = stale[si];
        if (node && node.parentNode) node.parentNode.removeChild(node);
      }
    } catch (e) {}
  }

  // ── Editor init ────────────────────────────────────────────────────────────

  function initEditor() {
    cleanup();
    var myGen = generation;
    state._currentGen = myGen;
    if (!isLovelacePath()) return;
    var conn = getConn();
    if (!conn) { setBar(t('haConnNotFound')); return; }

    var loc = getCurrentLoc();
    var dashPath = loc.dash;
    var viewPath = loc.view;
    var wsPath = (dashPath === 'lovelace') ? null : dashPath;
    currentWsPath = wsPath;

    setBar(t('loading') + ' wsPath=' + (wsPath === null ? 'null(lovelace)' : wsPath) + ' view=' + String(viewPath));

    conn.sendMessagePromise({ type: 'lovelace/config', url_path: wsPath, force: true })
      .then(function (cfg) {
        var viewIdx = getViewIdx(cfg, viewPath);
        var view = cfg.views[viewIdx];
        var requestedView = viewPath == null ? null : String(viewPath);
        var exactView = requestedView == null || String(viewIdx) === requestedView ||
          (view && view.path === requestedView) ||
          (view && view.title && view.title.toLowerCase() === requestedView.toLowerCase());
        if (!view || !exactView) return;

        var picInfo = getPicElsCard(view);
        if (!picInfo) {
          setBar('ℹ️ [' + viewIdx + '] "' + (view.title || '?') + '" — ' + t('noPictureInView'));
          return;
        }

        function tryBuild(attempts) {
          if (myGen !== generation) return;  // abgebrochen durch erneuten cleanup/initEditor
          var rect = getRect();
          if ((!rect || rect.width <= 0) && attempts > 0) {
            setTimeout(function () { tryBuild(attempts - 1); }, 300);
            return;
          }
          if (!rect) { setBar(t('rootNotFoundAfterWait')); return; }
          if (state.layer) return;  // schon gebaut
          buildHandles(cfg, viewIdx, picInfo, wsPath);
        }
        tryBuild(10);
      })
      .catch(function (err) {
        if (isIgnorableConfigError(err)) return;
        setBar('❌ ' + (err.message || JSON.stringify(err)));
      });
  }

  function buildHandles(cfg, viewIdx, picInfo, wsPath) {
    var cardPath = picInfo.path;
    var elements = picInfo.card.elements;
    var seenHandleKeys = {};

    var layer = document.createElement('div');
    // position:absolute auf documentElement statt position:fixed auf body —
    // Safari bricht position:fixed in CSS-transform-Containern (HA-Seitenübergänge)
    layer.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:99997';
    document.documentElement.appendChild(layer);
    state.layer = layer;

    allHandles = [];
    var count = 0;
    var usedPos = {};
    elements.forEach(function (elCfg, idx) {
      // Hintergrundbild überspringen: vollflächige image ohne Entity
      if (elCfg.type === 'image' && !elCfg.entity && elCfg.style) {
        var bw = parseFloat(elCfg.style.width), bh = parseFloat(elCfg.style.height);
        if (bw >= 99 || bh >= 99) return;
      }

      var info = getElInfo(elCfg);
      if (!info) return;
      count++;

      var name = shortName(elCfg, idx, info);
      var tPct = info.top, lPct = info.left;
      var dedupeKey = [idx, tPct.toFixed(1), lPct.toFixed(1)].join('|');
      if (seenHandleKeys[dedupeKey]) return;
      seenHandleKeys[dedupeKey] = true;

      var posKey = Math.round(tPct) + '_' + Math.round(lPct);
      var stackIdx = usedPos[posKey] || 0;
      usedPos[posKey] = stackIdx + 1;
      var stackOffsetPx = stackIdx * 14;

      var isConditional = elCfg.type === 'conditional';
      var mappedDom = findDomElByPos(getActiveRoot(), tPct, lPct, isConditional ? { maxDistPct: 3 } : {});

      var h = makeCrosshair(name);
      layer.appendChild(h);
      allHandles.push({ idx: idx, h: h, name: name });
      h._targetDom = mappedDom || null;

      function placeHandle() {
        var r = getRect(); if (!r) return;
        var sx = window.pageXOffset || document.documentElement.scrollLeft || 0;
        var sy = window.pageYOffset || document.documentElement.scrollTop  || 0;
        if (h._targetDom && document.contains(h._targetDom)) {
          var dr = h._targetDom.getBoundingClientRect();
          h.style.left = (sx + dr.left + dr.width / 2 + stackOffsetPx) + 'px';
          h.style.top  = (sy + dr.top  + dr.height / 2 + stackOffsetPx) + 'px';
          return;
        }
        h.style.left = (sx + r.left + lPct / 100 * r.width + stackOffsetPx) + 'px';
        h.style.top  = (sy + r.top  + tPct / 100 * r.height + stackOffsetPx) + 'px';
      }
      placeHandle();
      if (!state.placeHandlers) state.placeHandlers = [];
      state.placeHandlers.push(placeHandle);

      // Doppelklick → frische Config holen → YAML-Popup
      h.addEventListener('dblclick', function (e) {
        e.preventDefault(); e.stopPropagation();
        if (e.stopImmediatePropagation) e.stopImmediatePropagation();
        var liveConn = getConn();
        if (!liveConn) { setBar('❌ ' + t('connectionLost')); return; }
        setBar(t('loadingItem') + '[' + idx + '] ' + name + '...');
        liveConn.sendMessagePromise({ type: 'lovelace/config', url_path: wsPath, force: true })
          .then(function (freshCfg) {
            var freshCard = getCardByPath(freshCfg, viewIdx, cardPath);
            var freshEl = freshCard.elements[idx];
            showYamlPopup(freshEl, '[' + idx + '] ' + name, freshCfg, viewIdx, cardPath, idx, wsPath);
          })
          .catch(function (err) { setBar('❌ ' + (err.message || JSON.stringify(err))); });
      }, true);

      h.addEventListener('mousedown', function (e) {
        e.preventDefault(); e.stopPropagation();
        if (e.detail > 1) return;

        // Shift+Klick → Element markieren/demarkieren
        if (e.shiftKey) {
          if (selectedElements[idx]) {
            delete selectedElements[idx];
            h._dot.style.background = '#FF5733';
            setBar('❌ [' + idx + '] ' + t('unmarked') + ' (' + Object.keys(selectedElements).length + ' ' + t('active') + ')');
          } else {
            selectedElements[idx] = { t: tPct, l: lPct, h: h };
            h._dot.style.background = '#FFD700';
            setBar('✓ [' + idx + '] ' + t('marked') + ' (' + (Object.keys(selectedElements).length) + ' ' + t('active') + ')');
          }
          return;
        }

        // Alt+Klick → Format kopieren / einfügen
        if (e.altKey) {
          if (!formatBuffer) {
            copyFormat(elCfg, name);
          } else {
            // Frische Config für Format-Paste
            var liveConnFmt = getConn();
            if (!liveConnFmt) { setBar('❌ ' + t('connectionLost')); return; }
            liveConnFmt.sendMessagePromise({ type: 'lovelace/config', url_path: wsPath, force: true })
              .then(function (freshCfg) { pasteFormat(freshCfg, viewIdx, cardPath, idx, name, wsPath); })
              .catch(function (err) { setBar('❌ ' + (err.message || JSON.stringify(err))); });
          }
          return;
        }

        // Resize-Modus → öffne Resize-Box statt Drag
        if (resizeMode) {
          var rRoot = getActiveRoot();
          if (!rRoot) { setBar(t('noRoot')); return; }
          var rDom = h._targetDom || findDomElByPos(rRoot, tPct, lPct);
          if (!rDom) { setBar(t('domNotFound')); return; }
          showResizeBox(rDom, idx, picInfo, viewIdx, cardPath, wsPath, cfg);
          return;
        }

        h._dot.style.transform = 'translate(-50%,-50%) scale(1.6)';
        h._dot.style.background = '#FFB347';

        // Pfeiltasten-Fokus: dieses Kreuz als aktives Ziel merken
        setLastArrowTarget({
          h: h,
          getPos: function () { return { t: tPct, l: lPct }; },
          applyMove: function (nt, nl) { tPct = nt; lPct = nl; placeHandle(); },
          save: function (nt, nl) {
            var lc = getConn(); if (!lc) return;
            lc.sendMessagePromise({ type: 'lovelace/config', url_path: wsPath, force: true })
              .then(function (freshCfg) {
                undoStack.push({ cfg: JSON.parse(JSON.stringify(freshCfg)) });
                if (undoStack.length > MAX_HISTORY) undoStack.shift();
                redoStack = [];
                var card = getCardByPath(freshCfg, viewIdx, cardPath);
                var el = card.elements[idx];
                var edited = JSON.parse(JSON.stringify(el));
                if (!setElPosOnElement(edited, nt, nl)) throw new Error('style not found for idx ' + idx);
                Object.keys(el).forEach(function (k) { delete el[k]; });
                Object.keys(edited).forEach(function (k) { el[k] = edited[k]; });
                return lc.sendMessagePromise({ type: 'lovelace/config/save', url_path: wsPath, config: freshCfg });
              })
              .then(function () { setBar('✓ [' + idx + '] ' + name + '  top:' + nt + '%  left:' + nl + '%'); })
              .catch(function (err) { setBar('❌ ' + (err.message || JSON.stringify(err))); });
          }
        });

        // Undo-State wird im d.save() selbst gepusht (mit der frischen Config vor dem Save)
        var bulkInitStates = {};
        Object.keys(selectedElements).forEach(function (selIdx) {
          if (String(selIdx) !== String(idx)) {
            var selEl = picInfo.card.elements[selIdx];
            var selInfo = getElInfo(selEl);
            if (selInfo) {
              var selDom = findDomElByPos(getActiveRoot(),  selInfo.top, selInfo.left);
              bulkInitStates[selIdx] = { t: selInfo.top, l: selInfo.left, dom: selDom };
            }
          }
        });

        var activeRoot = getActiveRoot();
        var activeDom = h._targetDom || findDomElByPos(activeRoot, tPct, lPct, isConditional ? { maxDistPct: 3 } : {});

        globalActive = {
          h: h, idx: idx, name: name, dom: activeDom,
          sx: e.clientX, sy: e.clientY, st: tPct, sl: lPct, moved: false,
          bulkInitStates: bulkInitStates,
          move: function (t, l) {
            var active = this;
            tPct = t; lPct = l; placeHandle();
            // Live-Drag: Element direkt im DOM verschieben
            if (active.dom) {
              active.dom.style.top = t + '%';
              active.dom.style.left = l + '%';
            }
            // Bulk move: alle markierten Elemente zusammen verschieben
            var dt = t - active.st, dl = l - active.sl;
            Object.keys(active.bulkInitStates).forEach(function (selIdx) {
              var init = active.bulkInitStates[selIdx];
              var newT = init.t + dt, newL = init.l + dl;
              newT = Math.max(0, Math.min(100, newT));
              newL = Math.max(0, Math.min(100, newL));
              selectedElements[selIdx].t = newT;
              selectedElements[selIdx].l = newL;
              if (init.dom) {
                init.dom.style.top = newT + '%';
                init.dom.style.left = newL + '%';
              }
              if (selectedElements[selIdx].h) {
                var rRect = getRect();
                if (rRect) {
                  var bsx = window.pageXOffset || document.documentElement.scrollLeft || 0;
                  var bsy = window.pageYOffset || document.documentElement.scrollTop  || 0;
                  selectedElements[selIdx].h.style.left = (bsx + rRect.left + newL / 100 * rRect.width) + 'px';
                  selectedElements[selIdx].h.style.top  = (bsy + rRect.top  + newT / 100 * rRect.height) + 'px';
                }
              }
            });
          },
          save: function (nt, nl) {
            var liveConn = getConn();
            if (!liveConn) { setBar('❌ ' + t('connectionLost')); return Promise.resolve(false); }
            // Closure-capture: globalActive ist hier bereits null (gesetzt im mouseup-Handler)
            var bulkStates = bulkInitStates;
            var bulkSnapshot = {};
            Object.keys(bulkStates).forEach(function (selIdx) {
              if (selectedElements[selIdx]) bulkSnapshot[selIdx] = { t: selectedElements[selIdx].t, l: selectedElements[selIdx].l };
            });
            return liveConn.sendMessagePromise({ type: 'lovelace/config', url_path: wsPath, force: true })
              .then(function (freshCfg) {
                undoStack.push({ cfg: JSON.parse(JSON.stringify(freshCfg)) });
                if (undoStack.length > MAX_HISTORY) undoStack.shift();
                redoStack = [];

                var card = getCardByPath(freshCfg, viewIdx, cardPath);
                var el = card.elements[idx];
                var edited = JSON.parse(JSON.stringify(el));
                if (!setElPosOnElement(edited, nt, nl)) throw new Error('style not found for idx ' + idx);
                Object.keys(el).forEach(function (k) { delete el[k]; });
                Object.keys(edited).forEach(function (k) { el[k] = edited[k]; });

                Object.keys(bulkSnapshot).forEach(function (selIdx) {
                  saveElPos(freshCfg, viewIdx, cardPath, selIdx, bulkSnapshot[selIdx].t, bulkSnapshot[selIdx].l);
                });

                return liveConn.sendMessagePromise({ type: 'lovelace/config/save', url_path: wsPath, config: freshCfg });
              })
              .then(function () {
                return liveConn.sendMessagePromise({ type: 'lovelace/config', url_path: wsPath, force: true });
              })
              .then(function (checkCfg) {
                var p = readElPosFromCfg(checkCfg, viewIdx, cardPath, idx);
                var ok = !!(p && p.top.toFixed(1) === nt.toFixed(1) && p.left.toFixed(1) === nl.toFixed(1));
                if (ok) {
                  setBar('✓ [' + idx + '] ' + name + '  top:' + nt.toFixed(1) + '%  left:' + nl.toFixed(1) + '%');
                  return true;
                }
                setBar(t('saveNotConfirmed') + '[' + idx + '] ' + name);
                return false;
              })
              .catch(function (err) {
                var msg = (err && (err.message || err.code || err.error)) ? (err.message || err.code || err.error) : JSON.stringify(err);
                setBar(t('saveError') + '[' + idx + ']: ' + msg);
                console.error('[HA-Drag-Editor] save:ERR', { wsPath: wsPath, idx: idx, err: err });
                return false;
              });
          }
        };
      }, true);
    });

    var view = cfg.views[viewIdx];
    state.defaultBarMsg = '✓ ' + (view.title || viewIdx) + ' — ' + count + ' ' + t('defaultSuffix');
    setBar(state.defaultBarMsg);
    updatePasteBtn();
  }

  // ── Globale Maus-Events ────────────────────────────────────────────────────

  function safePct(v, fallback) {
    if (typeof v !== 'number' || !isFinite(v)) return fallback;
    return Math.max(0, Math.min(100, v));
  }

  document.addEventListener('mousemove', function (e) {
    if (!globalActive) return;
    var dx = e.clientX - globalActive.sx;
    var dy = e.clientY - globalActive.sy;
    if (!globalActive.moved && (dx * dx + dy * dy) < 16) return;
    globalActive.moved = true;
    var r = getRect();
    if (!r || r.width <= 0 || r.height <= 0) return;
    var nl = safePct(+(globalActive.sl + (e.clientX - globalActive.sx) / r.width * 100).toFixed(1), globalActive.sl);
    var nt = safePct(+(globalActive.st + (e.clientY - globalActive.sy) / r.height * 100).toFixed(1), globalActive.st);
    nl = safePct(snapValue(nl), nl);
    nt = safePct(snapValue(nt), nt);
    globalActive.move(nt, nl);
    if (state._resizeBoxReposition) state._resizeBoxReposition();
    setBar('[' + globalActive.idx + '] ' + globalActive.name + '  top:' + nt + '%  left:' + nl + '%');
  }, true);

  document.addEventListener('mouseup', function (e) {
    if (!globalActive) return;
    var d = globalActive; globalActive = null;
    d.h._dot.style.transform = 'translate(-50%,-50%) scale(1)';
    d.h._dot.style.background = '#FF5733';
    var r = getRect();
    if (!r || r.width <= 0 || r.height <= 0) {
      setBar(t('noRoot'));
      return;
    }
    var nl = safePct(+(d.sl + (e.clientX - d.sx) / r.width * 100).toFixed(1), d.sl);
    var nt = safePct(+(d.st + (e.clientY - d.sy) / r.height * 100).toFixed(1), d.st);
    nl = safePct(snapValue(nl), nl);
    nt = safePct(snapValue(nt), nt);
    if (!d.moved) {
      setLastArrowTarget({
        h: d.h,
        getPos: function () { return { t: d.st, l: d.sl }; },
        applyMove: function (nt2, nl2) { d.move(nt2, nl2); },
        save: function (nt2, nl2) { return d.save(nt2, nl2); }
      });
      if (state.defaultBarMsg) setBar(state.defaultBarMsg);
      return;
    }
    d.move(nt, nl);
    d.save(nt, nl).then(function (ok) {
      if (ok) {
        setTimeout(function () {
          if (state.enabled && !document.getElementById('ha-drag-yaml-popup')) initEditor();
        }, 600);
      }
    });
  }, true);

  // ── Enable / Disable ───────────────────────────────────────────────────────

  function setEnabled(on) {
    state.enabled = on;
    localStorage.setItem(STORAGE_KEY, String(on));
    if (on) { initEditor(); } else { cleanup(); }
  }

  // Keyboard Shortcuts: Undo/Redo, Escape, Pfeiltasten
  document.addEventListener('keydown', function (e) {
    if (!state.enabled) return;
    if (e.key === 'Escape') {
      if (Object.keys(selectedElements).length > 0) {
        Object.keys(selectedElements).forEach(function (idx) {
          if (selectedElements[idx].h) selectedElements[idx].h._dot.style.background = '#FF5733';
        });
        selectedElements = {};
        setBar(t('allUnmarked'));
      }
      setLastArrowTarget(null);  // stellt defaultBarMsg wieder her
      return;
    }
    // Pfeiltasten — lastArrowTarget verschieben
    var arrows = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] };
    if (arrows[e.key] && lastArrowTarget && !globalActive) {
      e.preventDefault();
      // Schrittweite: Grid-aktiv = Grid-Wert, sonst 0.1% (feine Positionierung)
      var step = snapGrid !== 'off' ? parseFloat(snapGrid) : 0.1;
      var dir = arrows[e.key];
      var pos = lastArrowTarget.getPos();
      var nt = safePct(+(pos.t + dir[1] * step).toFixed(2), pos.t);
      var nl = safePct(+(pos.l + dir[0] * step).toFixed(2), pos.l);
      lastArrowTarget.applyMove(nt, nl);
      setBar('↦ ' + nt + '% / ' + nl + '%  (' + t('arrowKey') + ', ' + step + '%)');
      // Debounce save: 600ms nach letzter Taste — globaler Timer verhindert Race bei schnellem Klick
      if (arrowSaveTimer) clearTimeout(arrowSaveTimer);
      var cap = lastArrowTarget;
      arrowSaveTimer = setTimeout(function () {
        arrowSaveTimer = null;
        cap.save(cap.getPos().t, cap.getPos().l);
        // Kurz nach dem Save Default-Text wieder zeigen
        setTimeout(function () { if (state.defaultBarMsg && !globalActive) setBar(state.defaultBarMsg); }, 1200);
      }, 600);
      return;
    }
    var isUndo = (e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey;
    var isRedo = ((e.ctrlKey || e.metaKey) && e.key === 'y') || ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z');
    if (isUndo) { e.preventDefault(); performUndo(currentWsPath, function () { initEditor(); }); }
    else if (isRedo) { e.preventDefault(); performRedo(currentWsPath, function () { initEditor(); }); }
  }, true);

  // Single window-resize + scroll Handler — repositioniert alle Kreuze und Paste-Buttons
  function repositionAll() {
    if (state.placeHandlers) {
      for (var i = 0; i < state.placeHandlers.length; i++) {
        try { state.placeHandlers[i](); } catch (e) {}
      }
    }
    if (state._pasteBtnReposition) {
      try { state._pasteBtnReposition(); } catch (e) {}
    }
  }
  window.addEventListener('resize', repositionAll);
  window.addEventListener('scroll', repositionAll, true);

  window.addEventListener('ha-drag-editor', function (e) { setEnabled(e.detail.enabled); });

  var lastNavPath = window.location.pathname;
  var navHandler = function () {
    var newPath = window.location.pathname;
    if (newPath !== lastNavPath) {
      lastNavPath = newPath;
      if (state.enabled) setTimeout(initEditor, 500);
    }
  };
  window.addEventListener('popstate', navHandler);
  window.addEventListener('location-changed', navHandler);

  if (localStorage.getItem(STORAGE_KEY) === 'true') {
    setTimeout(function () { setEnabled(true); }, 2500);
  }

})();
