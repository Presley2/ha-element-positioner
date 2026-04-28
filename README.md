# Element Positioner

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg?style=flat-square)](https://github.com/hacs/integration)
[![GitHub release](https://img.shields.io/github/v/release/Presley2/ha-element-positioner?style=flat-square)](https://github.com/Presley2/ha-element-positioner/releases)
[![GitHub downloads](https://img.shields.io/github/downloads/Presley2/ha-element-positioner/total?style=flat-square)](https://github.com/Presley2/ha-element-positioner/releases)
[![License](https://img.shields.io/github/license/Presley2/ha-element-positioner?style=flat-square)](LICENSE)

**Visueller Drag & Drop Editor für Home Assistant `picture-elements` Dashboards.**  
Positioniere Elemente direkt auf deinem Grundriss — ohne Code zu schreiben.

---

## Features

| Feature | Beschreibung |
|---|---|
| 🖱️ **Drag & Drop** | Elemente ziehen — Position wird sofort in HA gespeichert |
| ⌨️ **Pfeiltasten** | Feinpositionierung 0,1 % pro Schritt (Klick → Fokus → ↑↓←→) |
| 🔲 **Mehrfachauswahl** | Shift+Klick markiert mehrere Elemente für gemeinsames Verschieben |
| 📝 **YAML/JSON Editor** | Doppelklick → Element-Config live bearbeiten |
| 📋 **Element kopieren** | Elemente zwischen Dashboard-Tabs übertragen |
| 🎨 **Format-Painter** | Style von einem Element auf ein anderes übertragen |
| ↶ **Undo/Redo** | Bis zu 20 Schritte (Ctrl+Z / Ctrl+Y, Mac: ⌘) |
| ⊞ **Snap-Grid** | OFF / 1 % / 3 % / 5 % — Drag und Pfeiltasten rasten ein |
| ⤡ **Resize-Modus** | Elemente skalieren via `transform: scale()` |
| 🔍 **Suche** | Elemente nach Name filtern |
| 🗑️ **Löschen** | Element entfernen (2× bestätigen) |

---

## Voraussetzungen

- Home Assistant `2023.6` oder neuer
- `picture-elements` Card auf einem Dashboard
- Lovelace im **Speicher-Modus** (nicht YAML-Modus)
- Admin-Rechte

---

## Installation

### HACS (empfohlen)

1. HACS öffnen → **Frontend**
2. Drei-Punkte-Menü → **Benutzerdefinierte Repositories**
3. URL: `https://github.com/Presley2/ha-element-positioner` — Kategorie: **Lovelace**
4. Repository erscheint in der Liste → **Herunterladen**
5. Browser Hard Refresh: `Ctrl+Shift+R`

### Sidebar-Panel (manuell, einmalig)

HACS installiert nur die Lovelace-Ressource. Das Sidebar-Panel muss einmalig manuell eingerichtet werden:

1. `drag_editor_panel.js` aus dem [neuesten Release](https://github.com/Presley2/ha-element-positioner/releases/latest) herunterladen und in `/config/www/` kopieren

2. In `configuration.yaml` eintragen:

```yaml
panel_custom:
  - name: drag-editor-panel
    sidebar_title: Element Positioner
    sidebar_icon: mdi:pencil-ruler
    url_path: drag-editor
    module_url: /local/drag_editor_panel.js
```

3. HA neu starten — oder **Entwicklerwerkzeuge → YAML → Konfiguration neu laden → Panel Custom**

### Manuelle Installation (ohne HACS)

<details>
<summary>Schritte anzeigen</summary>

1. `drag_editor.js` und `drag_editor_panel.js` aus dem [neuesten Release](https://github.com/Presley2/ha-element-positioner/releases/latest) herunterladen
2. Beide Dateien in `/config/www/` kopieren
3. In HA: **Einstellungen → Dashboards → Ressourcen** → Ressource hinzufügen:
   - URL: `/local/drag_editor.js`
   - Typ: JavaScript-Modul
4. `panel_custom` wie oben in `configuration.yaml` eintragen
5. HA neu starten → `Ctrl+Shift+R`

</details>

---

## Quickstart

1. Sidebar → **Element Positioner** → Toggle **An**
2. Zum gewünschten Dashboard-Tab wechseln → Fadenkreuze erscheinen auf allen Elementen
3. Element **ziehen** → Position wird sofort gespeichert
4. **Doppelklick** auf Kreuz → YAML/JSON Editor öffnet sich

Alle Shortcuts und Funktionen sind direkt im Sidebar-Panel unter **Element Positioner** dokumentiert.

---

## Kompatibilität

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

---

## Troubleshooting

**Kreise erscheinen nicht**  
→ Hard Refresh: `Ctrl+Shift+R` im Browser

**Position speichert nicht**  
→ HA-Verbindung prüfen: `F12 → Console` auf Fehler prüfen  
→ Admin-Rechte im Lovelace-Speicher-Modus erforderlich

**Darstellung verzerrt auf Safari/iPad**  
→ Ab v0.24 behoben — Hard Refresh und ggf. Safari-Cache leeren

**Editor lädt nicht nach Tab-Wechsel**  
→ Toggle kurz aus- und wieder einschalten

---

## Lizenz

MIT License — siehe [LICENSE](LICENSE)
