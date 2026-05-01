# Element Positioner

<img src="https://raw.githubusercontent.com/Presley2/ha-element-positioner/main/brand/icon.png" width="120" align="left" style="margin-right:16px"/>

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg?style=flat-square)](https://github.com/hacs/integration)
[![GitHub release](https://img.shields.io/github/v/release/Presley2/ha-element-positioner?style=flat-square)](https://github.com/Presley2/ha-element-positioner/releases)
[![GitHub downloads](https://img.shields.io/github/downloads/Presley2/ha-element-positioner/total?style=flat-square)](https://github.com/Presley2/ha-element-positioner/releases)
[![License](https://img.shields.io/github/license/Presley2/ha-element-positioner?style=flat-square)](LICENSE)

**Visueller Drag & Drop Editor für Home Assistant `picture-elements` Dashboards.**  
Positioniere Elemente direkt auf deinem Grundriss — ohne Code zu schreiben.

<br clear="left"/>

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

- Home Assistant `2023.9` oder neuer
- `picture-elements` Card auf einem Dashboard
- Lovelace im **Speicher-Modus** (nicht YAML-Modus)
- Admin-Rechte

---

## Installation

### HACS (empfohlen)

1. HACS öffnen → **Integrationen**
2. Drei-Punkte-Menü → **Benutzerdefinierte Repositories**
3. URL: `https://github.com/Presley2/ha-element-positioner` — Kategorie: **Integration**
4. **Element Positioner** in der Liste suchen → **Herunterladen**
5. HA neu starten

### Integration einrichten

Nach dem Neustart:

1. **Einstellungen → Integrationen → Integration hinzufügen**
2. **„Element Positioner"** suchen → auswählen → **Senden**
3. Fertig — Sidebar-Panel erscheint automatisch ✅

### Manuelle Installation (ohne HACS)

<details>
<summary>Schritte anzeigen</summary>

1. Den Ordner `custom_components/element_positioner/` aus dem [neuesten Release](https://github.com/Presley2/ha-element-positioner/releases/latest) herunterladen
2. In `/config/custom_components/element_positioner/` kopieren
3. HA neu starten
4. **Einstellungen → Integrationen → Integration hinzufügen → Element Positioner**

</details>

---

## Quickstart

1. Sidebar → **Element Positioner** → Toggle **An**
2. Zum gewünschten Dashboard-Tab wechseln → Fadenkreuze erscheinen auf allen Elementen
3. Element **ziehen** → Position wird sofort gespeichert
4. **Doppelklick** auf Kreuz → YAML/JSON Editor öffnet sich

Alle Shortcuts und Funktionen sind direkt im Sidebar-Panel dokumentiert.

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
→ Admin-Rechte und Lovelace-Speicher-Modus erforderlich

**Integration erscheint nicht in der Liste**  
→ HA nach HACS-Installation neu gestartet? Dann erneut suchen.

---

## Lizenz

MIT License — siehe [LICENSE](LICENSE)
