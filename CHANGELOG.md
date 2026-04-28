# Changelog

## [0.24] - 2026-04-28

### Fixed
- Safari/iPad: Kreise und Resize-Box wurden in CSS-Transform-Containern verzerrt dargestellt
- Alle Editor-Overlays (Layer, Crosshairs, Resize-Box, Paste-Buttons) verwenden jetzt `position:absolute` auf `document.documentElement` statt `position:fixed` — Safari-kompatibel auch während HA-Seitenübergängen

## [0.23] - 2026-04-27

### Fixed
- Speichern in Tabs vom Typ `sidebar` (z.B. `lovelace-tablet/0`) funktionierte nicht
- `getActiveRoot()` filtert jetzt zuerst nach `hui-picture-elements-card` Shadow-Hosts bevor der größte sichtbare Root gewählt wird

### Changed
- Arrow-Key-Schrittweite auf 0,1 % reduziert (statt 0,5 %)
- Status-Bar zeigt wieder Standard-Text wenn Fokus vom Element entfernt wird
- Undo/Redo-Icons vergrößert

## [0.22] - 2026-04-26

### Added
- Snap-Grid: OFF / 1 % / 3 % / 5 % — Drag und Pfeiltasten rasten ein
- Resize-Modus: Elemente via `transform: scale()` skalieren
- Suche: Elemente nach Name filtern
- Mehrfachauswahl: Shift+Klick markiert mehrere Elemente, gemeinsames Verschieben
- Pfeiltasten-Navigation nach Klick auf Element (Fokus-Ring sichtbar)
- Undo/Redo bis 20 Schritte (Ctrl+Z / Ctrl+Y)

### Fixed
- `conditional`-verschachtelte Elemente werden korrekt erkannt (`unwrapElStyle()`)
- `picture-elements` in Wrapper-Cards (`vertical-stack`, `horizontal-stack`) werden gefunden
- Resize-Box folgt dem Element während Drag
- Globaler Arrow-Key-Timer verhindert Race Conditions bei schnellem Klick

## [0.21] - 2026-04-25

### Added
- Format-Painter: Alt+Klick kopiert Style von Element zu Element
- Element-Buffer: Elemente zwischen Dashboard-Tabs übertragen
- YAML/JSON Editor: Elemente direkt im Popup bearbeiten und speichern
- Element löschen (2× bestätigen)

## [0.20] - 2026-04-24

### Added
- Erster öffentlicher Release
- Drag & Drop Positionierung mit sofortigem Speichern in HA
- YAML-Popup per Doppelklick
- Status-Bar mit Undo/Redo, Snap-Grid und Resize-Button
- Sidebar-Panel mit vollständiger Bedienungsanleitung
