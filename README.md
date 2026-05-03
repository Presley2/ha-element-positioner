# Element Positioner

Visual Drag & Drop editor for Home Assistant `picture-elements` dashboards.
Move, resize, copy and edit Lovelace floor-plan elements directly in the browser, with automatic saving back to Home Assistant.

Element Positioner adds a sidebar panel, registers its Lovelace frontend resource automatically, and is packaged as a HACS custom integration.

<img src="https://raw.githubusercontent.com/Presley2/ha-element-positioner/main/brand/icon.png" width="120" align="left" style="margin-right:16px"/>

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg?style=flat-square)](https://github.com/hacs/integration)
[![GitHub release](https://img.shields.io/github/v/release/Presley2/ha-element-positioner?style=flat-square)](https://github.com/Presley2/ha-element-positioner/releases)
[![GitHub downloads](https://img.shields.io/github/downloads/Presley2/ha-element-positioner/total?style=flat-square)](https://github.com/Presley2/ha-element-positioner/releases)
[![License](https://img.shields.io/github/license/Presley2/ha-element-positioner?style=flat-square)](LICENSE)

**[🇩🇪 Deutsch](#deutsch) · [🇬🇧 English](#english)**

<br clear="left"/>

---

<a name="deutsch"></a>
## 🇩🇪 Deutsch

**Visueller Drag & Drop Editor für Home Assistant `picture-elements` Dashboards.**  
Positioniere Elemente direkt auf deinem Grundriss — ohne Code zu schreiben.

### Screenshots

![Editor mit Fadenkreuzen auf dem Grundriss](https://raw.githubusercontent.com/Presley2/ha-element-positioner/main/docs/screenshot_editor.png)

*Fadenkreuze auf allen picture-elements — einfach ziehen um zu positionieren*

![Toolbar](https://raw.githubusercontent.com/Presley2/ha-element-positioner/main/docs/screenshot_toolbar.png)

*Statusbar mit Suche, Undo/Redo, Snap-Grid und Resize-Modus*

### Features

| Feature | Beschreibung |
|---|---|
| 🖱️ **Drag & Drop** | Elemente ziehen — Position wird sofort in HA gespeichert |
| ⌨️ **Pfeiltasten** | Feinpositionierung 0,1 % pro Schritt (Klick → Fokus → ↑↓←→) |
| 🔲 **Mehrfachauswahl** | Shift+Klick markiert mehrere Elemente für gemeinsames Verschieben |
| 📝 **YAML Editor** | Doppelklick → Element-Config live bearbeiten |
| 📋 **Element kopieren** | Elemente zwischen Dashboard-Tabs übertragen |
| 🎨 **Format-Painter** | Style von einem Element auf ein anderes übertragen |
| ↶ **Undo/Redo** | Bis zu 20 Schritte (Ctrl+Z / Ctrl+Y, Mac: ⌘) |
| ⊞ **Snap-Grid** | OFF / 1 % / 3 % / 5 % — Drag und Pfeiltasten rasten ein |
| ⤡ **Resize-Modus** | Elemente skalieren via `transform: scale()` |
| 🔍 **Suche** | Elemente nach Name filtern |
| 🗑️ **Löschen** | Element entfernen (2× bestätigen) |
| 🌐 **Zweisprachig** | UI automatisch auf Deutsch oder Englisch (via Browser-Sprache) |

### Voraussetzungen

- Home Assistant `2023.9` oder neuer
- `picture-elements` Card auf einem Dashboard
- Lovelace im **Speicher-Modus** (nicht YAML-Modus)
- Admin-Rechte

### Installation

#### HACS (empfohlen)

1. HACS öffnen → **Integrationen**
2. Drei-Punkte-Menü → **Benutzerdefinierte Repositories**
3. URL: `https://github.com/Presley2/ha-element-positioner` — Kategorie: **Integration**
4. **Element Positioner** in der Liste suchen → **Herunterladen**
5. HA neu starten

#### Integration einrichten

Nach dem Neustart:

1. **Einstellungen → Integrationen → Integration hinzufügen**
2. **„Element Positioner"** suchen → auswählen → **Senden**
3. Fertig — Sidebar-Panel erscheint automatisch ✅

#### Manuelle Installation (ohne HACS)

<details>
<summary>Schritte anzeigen</summary>

1. Den Ordner `custom_components/element_positioner/` aus dem [neuesten Release](https://github.com/Presley2/ha-element-positioner/releases/latest) herunterladen
2. In `/config/custom_components/element_positioner/` kopieren
3. HA neu starten
4. **Einstellungen → Integrationen → Integration hinzufügen → Element Positioner**

</details>

### Quickstart

1. Sidebar → **Element Positioner** → Toggle **An**
2. Zum gewünschten Dashboard-Tab wechseln → Fadenkreuze erscheinen auf allen Elementen
3. Element **ziehen** → Position wird sofort gespeichert
4. **Doppelklick** auf Kreuz → YAML Editor öffnet sich

Alle Shortcuts und Funktionen sind direkt im Sidebar-Panel dokumentiert.

### Kompatibilität

| Card-Typ | Unterstützt |
|---|---|
| `picture-elements` | ✅ Vollständig |
| `vertical-stack` / `horizontal-stack` mit picture-elements | ✅ |
| `conditional` um picture-elements | ✅ |
| `grid` mit picture-elements | ✅ |
| `sidebar`-Views | ✅ |
| `panel`-Views | ✅ |
| `sections`-Views | — (kein picture-elements) |

**Browser:** Chrome, Firefox, Safari, Edge, iPad Safari (alle aktuellen Versionen)

### Troubleshooting

**Kreise erscheinen nicht**  
→ Hard Refresh: `Ctrl+Shift+R` im Browser

**Position speichert nicht**  
→ HA-Verbindung prüfen: `F12 → Console` auf Fehler prüfen  
→ Admin-Rechte und Lovelace-Speicher-Modus erforderlich

**Integration erscheint nicht in der Liste**  
→ HA nach HACS-Installation neu gestartet? Dann erneut suchen.

### Hinweis

Ich hab dieses Tool für mich selbst entwickelt — zusammen mit [Claude Code](https://claude.ai/code) und zugeschnitten auf mein eigenes Setup, meine installierten Integrationen und meine Dashboards. Es funktioniert bei mir zuverlässig, aber ich kann nicht garantieren, dass es in jeder Umgebung läuft. Keine offizielle HA-Integration, kein Support-Versprechen — einfach ein Projekt das mir den Alltag erleichtert und vielleicht auch dir hilft. 🙂

---

<a name="english"></a>
## 🇬🇧 English

**Visual Drag & Drop editor for Home Assistant `picture-elements` dashboards.**  
Position elements directly on your floor plan — no coding required.

### Screenshots

![Editor with crosshairs on floor plan](https://raw.githubusercontent.com/Presley2/ha-element-positioner/main/docs/screenshot_editor.png)

*Crosshairs on all picture-elements — just drag to reposition*

![Toolbar](https://raw.githubusercontent.com/Presley2/ha-element-positioner/main/docs/screenshot_toolbar.png)

*Status bar with search, undo/redo, snap grid and resize mode*

### Features

| Feature | Description |
|---|---|
| 🖱️ **Drag & Drop** | Drag elements — position is saved to HA instantly |
| ⌨️ **Arrow keys** | Fine positioning at 0.1 % per step (click → focus → ↑↓←→) |
| 🔲 **Multi-select** | Shift+click selects multiple elements for group move |
| 📝 **YAML Editor** | Double-click → edit element config live |
| 📋 **Copy element** | Transfer elements between dashboard tabs |
| 🎨 **Format Painter** | Copy style from one element to another |
| ↶ **Undo/Redo** | Up to 20 steps (Ctrl+Z / Ctrl+Y, Mac: ⌘) |
| ⊞ **Snap Grid** | OFF / 1 % / 3 % / 5 % — drag and arrow keys snap to grid |
| ⤡ **Resize mode** | Scale elements via `transform: scale()` |
| 🔍 **Search** | Filter elements by name |
| 🗑️ **Delete** | Remove element (confirm twice) |
| 🌐 **Bilingual** | UI automatically in German or English (via browser language) |

### Requirements

- Home Assistant `2023.9` or newer
- `picture-elements` card on a dashboard
- Lovelace in **storage mode** (not YAML mode)
- Admin rights

### Installation

#### HACS (recommended)

1. Open HACS → **Integrations**
2. Three-dot menu → **Custom Repositories**
3. URL: `https://github.com/Presley2/ha-element-positioner` — Category: **Integration**
4. Search for **Element Positioner** → **Download**
5. Restart HA

#### Set up the integration

After restart:

1. **Settings → Integrations → Add Integration**
2. Search for **"Element Positioner"** → select → **Submit**
3. Done — sidebar panel appears automatically ✅

#### Manual installation (without HACS)

<details>
<summary>Show steps</summary>

1. Download the `custom_components/element_positioner/` folder from the [latest release](https://github.com/Presley2/ha-element-positioner/releases/latest)
2. Copy to `/config/custom_components/element_positioner/`
3. Restart HA
4. **Settings → Integrations → Add Integration → Element Positioner**

</details>

### Quickstart

1. Sidebar → **Element Positioner** → toggle **On**
2. Navigate to the desired dashboard tab → crosshairs appear on all elements
3. **Drag** an element → position is saved immediately
4. **Double-click** a crosshair → YAML editor opens

All shortcuts and features are documented directly in the sidebar panel.

### Compatibility

| Card type | Supported |
|---|---|
| `picture-elements` | ✅ Full support |
| `vertical-stack` / `horizontal-stack` with picture-elements | ✅ |
| `conditional` wrapping picture-elements | ✅ |
| `grid` with picture-elements | ✅ |
| `sidebar` views | ✅ |
| `panel` views | ✅ |
| `sections` views | — (no picture-elements) |

**Browsers:** Chrome, Firefox, Safari, Edge, iPad Safari (all current versions)

### Troubleshooting

**Crosshairs don't appear**  
→ Hard refresh: `Ctrl+Shift+R` in the browser

**Position doesn't save**  
→ Check HA connection: `F12 → Console` for errors  
→ Admin rights and Lovelace storage mode are required

**Integration doesn't show in the list**  
→ Did you restart HA after the HACS install? Then search again.

### Note

I built this tool for myself — together with [Claude Code](https://claude.ai/code), tailored to my own setup, my installed integrations, and my dashboards. It works reliably for me, but I can't guarantee it runs in every environment. Not an official HA integration, no support promise — just a project that makes my daily life easier and might help you too. 🙂

---

## License

MIT License — see [LICENSE](LICENSE)
