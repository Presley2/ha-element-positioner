// HA Drag Editor — Sidebar Panel
class HaDragEditorPanel extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._enabled = localStorage.getItem('ha_drag_editor') === 'true';
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._rendered) { this._rendered = true; this._render(); }
  }

  set panel(panel) { this._panel = panel; }

  _toggle() {
    this._enabled = !this._enabled;
    localStorage.setItem('ha_drag_editor', String(this._enabled));
    window.dispatchEvent(new CustomEvent('ha-drag-editor', { detail: { enabled: this._enabled } }));
    this._rendered = false;
    this._render();
  }

  _render() {
    var on = this._enabled;
    this.shadowRoot.innerHTML = `
      <style>
        :host { display:block; padding:20px 14px; }
        * { box-sizing:border-box; }
        .card {
          background:var(--ha-card-background,var(--card-background-color,#fff));
          border-radius:12px; padding:18px;
          box-shadow:var(--ha-card-box-shadow,0 2px 8px rgba(0,0,0,0.1));
        }
        h2 {
          color:var(--primary-text-color);
          margin:0 0 2px; font-size:19px; font-weight:500;
          display:flex; align-items:center; gap:10px;
        }
        .subtitle { color:var(--secondary-text-color); font-size:12px; margin-bottom:14px; }
        .row {
          display:flex; align-items:center;
          justify-content:space-between;
          padding:14px 0;
          border-top:1px solid var(--divider-color,rgba(0,0,0,0.1));
        }
        .label { color:var(--primary-text-color); font-size:15px; font-weight:500; }
        .sub { color:var(--secondary-text-color); font-size:12px; margin-top:3px; }
        .switch { position:relative; width:50px; height:28px; cursor:pointer; flex-shrink:0; }
        .track {
          position:absolute; inset:0;
          background:${on ? '#FF5733' : 'var(--disabled-color,#bbb)'};
          border-radius:14px; transition:background 0.25s;
        }
        .thumb {
          position:absolute; width:22px; height:22px; top:3px;
          left:${on ? '25px' : '3px'};
          background:white; border-radius:50%;
          box-shadow:0 1px 4px rgba(0,0,0,0.3); transition:left 0.25s;
        }
        .status-badge {
          display:inline-flex; align-items:center; gap:5px;
          padding:4px 10px; border-radius:12px; font-size:12px; font-weight:600;
          background:${on ? 'rgba(255,87,51,0.12)' : 'rgba(0,0,0,0.06)'};
          color:${on ? '#FF5733' : 'var(--secondary-text-color)'};
        }
        .dot {
          width:7px; height:7px; border-radius:50%;
          background:${on ? '#FF5733' : '#aaa'};
          ${on ? 'animation:pulse 1.5s ease-in-out infinite' : ''};
        }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        .info {
          margin-top:12px; padding:12px;
          background:var(--secondary-background-color,rgba(0,0,0,0.04));
          border-radius:8px; font-size:12px;
          color:var(--secondary-text-color); line-height:1.6;
        }
        .section-title {
          font-size:10px; font-weight:700; letter-spacing:0.08em;
          text-transform:uppercase; color:var(--secondary-text-color);
          margin-top:14px; margin-bottom:5px;
          border-top:1px solid var(--divider-color,rgba(0,0,0,0.1));
          padding-top:10px;
        }
        .cmd-list { display:flex; flex-direction:column; gap:5px; }
        .cmd {
          display:flex; align-items:flex-start; gap:8px;
          font-size:12px; color:var(--primary-text-color); line-height:1.4;
        }
        .key {
          flex-shrink:0;
          background:var(--secondary-background-color,rgba(0,0,0,0.06));
          border:1px solid var(--divider-color,rgba(0,0,0,0.15));
          border-radius:4px; padding:2px 6px; font-size:11px;
          font-family:monospace; white-space:nowrap;
          color:var(--primary-text-color);
        }
        .key.accent { color:#FF5733; border-color:rgba(255,87,51,0.4); background:rgba(255,87,51,0.06); }
        .key.del { color:#cc4444; border-color:#cc4444; background:rgba(204,68,68,0.07); }
        .hint {
          margin-top:12px; padding:10px 12px;
          border-left:3px solid ${on ? '#FF5733' : '#ddd'};
          font-size:11px; color:var(--secondary-text-color); line-height:1.6;
        }
        code { font-size:10px; background:rgba(0,0,0,0.06); padding:1px 4px; border-radius:3px; }
        b { color:var(--primary-text-color); }
      </style>
      <div class="card">
        <h2>
          <svg style="width:22px;height:22px;fill:#FF5733" viewBox="0 0 24 24">
            <path d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z"/>
          </svg>
          Element Positioner
        </h2>
        <div class="subtitle">Drag &amp; Drop Editor für picture-elements</div>

        <div class="row">
          <div>
            <div class="label">Editor</div>
            <div class="sub">
              <span class="status-badge">
                <span class="dot"></span>
                ${on ? 'Aktiv' : 'Inaktiv'}
              </span>
            </div>
          </div>
          <div class="switch" id="sw">
            <div class="track"></div>
            <div class="thumb"></div>
          </div>
        </div>

        <div class="info">
          ${on
            ? '🟠 <b>Aktiv</b> — Tab wechseln, Fadenkreuze erscheinen auf allen Elementen. Änderungen werden sofort gespeichert.'
            : '⚪ Toggle aktivieren, dann zum gewünschten Dashboard-Tab wechseln.'
          }
        </div>

        <!-- VERSCHIEBEN -->
        <div class="section-title">Verschieben</div>
        <div class="cmd-list">
          <div class="cmd">
            <span class="key">Ziehen</span>
            <span>Element verschieben — Position sofort in HA gespeichert</span>
          </div>
          <div class="cmd">
            <span class="key">Klick → Pfeiltasten</span>
            <span>Element erst anklicken (cyan Ring), dann mit <b>↑ ↓ ← →</b> feinpositionieren. Schrittweite = aktives Snap-Grid (oder 0,5 %)</span>
          </div>
          <div class="cmd">
            <span class="key">Shift + Klick</span>
            <span>Element zur Mehrfach­auswahl hinzufügen (goldener Punkt). Alle markierten Elemente bewegen sich gemeinsam beim Ziehen</span>
          </div>
          <div class="cmd">
            <span class="key">Esc</span>
            <span>Mehrfachauswahl aufheben &amp; Pfeiltasten-Fokus entfernen</span>
          </div>
        </div>

        <!-- YAML / JSON POPUP -->
        <div class="section-title">YAML / JSON Popup</div>
        <div class="cmd-list">
          <div class="cmd">
            <span class="key">Doppelklick</span>
            <span>Öffnet YAML-Ansicht des Elements</span>
          </div>
          <div class="cmd">
            <span class="key">Bearbeiten</span>
            <span>Schaltet in JSON-Bearbeitungsmodus — direkt im Textfeld ändern, dann <b>Speichern</b></span>
          </div>
          <div class="cmd">
            <span class="key">Copy YAML</span>
            <span>YAML in die Zwischenablage kopieren</span>
          </div>
          <div class="cmd">
            <span class="key accent">📋 Element kopieren</span>
            <span>Element in Buffer legen — Tab wechseln, orangen <b>Einfügen</b>-Button klicken. Am Ende der Liste eingefügt, dann per Drag positionieren</span>
          </div>
          <div class="cmd">
            <span class="key del">🗑 Löschen</span>
            <span>Element entfernen — 2× klicken zur Bestätigung</span>
          </div>
        </div>

        <!-- FORMAT PAINTER -->
        <div class="section-title">Format-Painter</div>
        <div class="cmd-list">
          <div class="cmd">
            <span class="key">Alt + Klick (Quelle)</span>
            <span>Design (Farbe, Größe, Style) von diesem Element kopieren — <b>🎨</b> erscheint in der Leiste</span>
          </div>
          <div class="cmd">
            <span class="key">Alt + Klick (Ziel)</span>
            <span>Kopierten Style auf dieses Element übertragen — Entity &amp; Position bleiben erhalten</span>
          </div>
        </div>

        <!-- LEISTEN-BUTTONS -->
        <div class="section-title">Leiste (unten im Dashboard)</div>
        <div class="cmd-list">
          <div class="cmd">
            <span class="key">↶ / ↷</span>
            <span><b>Rückgängig / Wiederholen</b> — bis zu 20 Schritte. Auch: <b>Ctrl+Z</b> / <b>Ctrl+Y</b> (Mac: ⌘)</span>
          </div>
          <div class="cmd">
            <span class="key">⊞ Grid-Symbol</span>
            <span><b>Snap-Grid</b> umschalten: OFF → 1 % → 3 % → 5 % → OFF. Bei aktivem Grid rastet Drag &amp; Pfeiltasten auf das Raster</span>
          </div>
          <div class="cmd">
            <span class="key">Resize-Symbol</span>
            <span><b>Resize-Modus</b>: aktivieren → auf Kreuz klicken → goldene Boundary-Box erscheint → Ecken/Kanten ziehen zum Skalieren. Speichert <code>transform: scale()</code></span>
          </div>
          <div class="cmd">
            <span class="key">Suche</span>
            <span>Elemente nach Name filtern — nicht gefundene werden ausgeblendet</span>
          </div>
        </div>

        <div class="hint">
          <b>Status-Leiste:</b> ✓ grün = OK &nbsp;|&nbsp; ❌ rot = Fehler &nbsp;|&nbsp; 🎨 = Format-Buffer aktiv &nbsp;|&nbsp; 📋 = Element-Buffer aktiv<br><br>
          <b>Nicht sichtbar?</b> Hard Refresh: <code>Ctrl+Shift+R</code><br>
          <b>Entfernen:</b> HA → Dashboards → Ressourcen → <code>drag_editor.js</code> löschen
        </div>
      </div>
    `;

    this.shadowRoot.getElementById('sw').addEventListener('click', () => this._toggle());
  }
}

if (!customElements.get('drag-editor-panel')) {
  customElements.define('drag-editor-panel', HaDragEditorPanel);
}
