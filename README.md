# Element Positioner

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/hacs/integration)
[![GitHub release](https://img.shields.io/github/release/Presley2/ha-element-positioner.svg)](https://github.com/Presley2/ha-element-positioner/releases)

Drag & Drop Editor für Home Assistant `picture-elements` Dashboards.  
Positioniere Elemente visuell auf deinem Grundriss — ohne Code zu schreiben.

---

## Features

- **Drag & Drop** — Elemente ziehen, Position wird sofort in HA gespeichert
- **Pfeiltasten** — Feinpositionierung mit 0,1 % Schritten (Klick → Element fokussieren → Pfeiltasten)
- **Mehrfachauswahl** — Shift+Klick markiert mehrere Elemente, gemeinsames Verschieben
- **YAML/JSON Editor** — Doppelklick auf Element → Config live bearbeiten
- **Element kopieren** — Elemente zwischen Dashboard-Tabs übertragen
- **Format-Painter** — Design (Farbe, Größe, Style) von einem Element auf ein anderes übertragen
- **Element löschen** — Direkt aus dem Editor (2× bestätigen)
- **Undo/Redo** — Bis zu 20 Schritte (Ctrl+Z / Ctrl+Y)
- **Snap-Grid** — OFF / 1 % / 3 % / 5 % — Drag und Pfeiltasten rasten ein
- **Resize-Modus** — Elemente skalieren via `transform: scale()`
- **Suche** — Elemente nach Name filtern
- **Live-Labels** — Element-Namen bei Hover sichtbar
- **Safari/iPad kompatibel** — korrekte Darstellung auch auf Mobile

---

## Installation via HACS

1. HACS öffnen → **Frontend** → Drei-Punkte-Menü → **Benutzerdefinierte Repositories**
2. URL eintragen: `https://github.com/Presley2/ha-element-positioner`  
   Kategorie: **Lovelace**
3. **Element Positioner** in HACS suchen und installieren
4. Browser Hard Refresh: `Ctrl+Shift+R`

---

## Sidebar-Panel einrichten (manuell)

Die Sidebar-Panel-Datei muss einmalig manuell eingerichtet werden:

1. `drag_editor_panel.js` aus dem Release in `/config/www/` kopieren

2. In `configuration.yaml` hinzufügen:

```yaml
panel_custom:
  - name: drag-editor-panel
    sidebar_title: Element Positioner
    sidebar_icon: mdi:pencil-ruler
    url_path: drag-editor
    module_url: /local/drag_editor_panel.js
```

3. HA neu starten oder: **Entwicklerwerkzeuge → YAML → Konfiguration neu laden → Panel Custom**

---

## Manuelle Installation (ohne HACS)

1. `drag_editor.js` und `drag_editor_panel.js` in `/config/www/` kopieren
2. Lovelace-Ressource hinzufügen: **Einstellungen → Dashboards → Ressourcen**  
   URL: `/local/drag_editor.js` — Typ: JavaScript-Modul
3. `panel_custom` wie oben in `configuration.yaml` eintragen
4. HA neu starten → Hard Refresh

---

## Quickstart

1. Sidebar → **Element Positioner** → Toggle **An**
2. Zum gewünschten Dashboard-Tab wechseln → Fadenkreuze erscheinen
3. Element **ziehen** → Position wird sofort gespeichert
4. **Doppelklick** auf Kreuz → YAML/JSON Editor

Alle Shortcuts und Funktionen sind direkt im Sidebar-Panel dokumentiert.

---

## Voraussetzungen

- Home Assistant mit `picture-elements` Card
- Lovelace im **Speicher-Modus** (nicht YAML-Modus)
- Admin-Rechte (zum Speichern der Config)

## Browser-Unterstützung

Chrome, Firefox, Safari, Edge, iPad Safari (alle aktuellen Versionen)

---

## Lizenz

MIT License — siehe [LICENSE](LICENSE)
