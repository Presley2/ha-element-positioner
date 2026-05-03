## Element Positioner

Element Positioner is a visual editor for Home Assistant `picture-elements` dashboards.
It lets you move, resize, copy and edit dashboard elements directly on your floor plan.

### What it does

- Drag elements on a `picture-elements` floor plan and save the new `top` / `left` position back to Lovelace.
- Fine tune positions with arrow keys in 0.1 percent steps.
- Open a YAML editor for an element by double-clicking its crosshair.
- Copy elements between dashboard tabs.
- Use snap grid, undo/redo, multi-select, resize mode and format painter.
- Works with German or English UI text based on Home Assistant/browser language.

### Supported dashboards

Element Positioner is focused on Home Assistant dashboards that use `picture-elements`.
It also supports common wrappers such as `vertical-stack`, `horizontal-stack`, `grid`, `conditional`, `panel` and `sidebar` views when they contain `picture-elements` cards.

### Requirements

- Home Assistant 2023.9 or newer
- Lovelace dashboards in storage mode
- Admin user
- A dashboard with at least one `picture-elements` card

### Installation

Install through HACS as a custom repository:

1. HACS -> Integrations
2. Three-dot menu -> Custom repositories
3. Repository: `https://github.com/Presley2/ha-element-positioner`
4. Category: Integration
5. Download Element Positioner
6. Restart Home Assistant
7. Add the integration in Settings -> Devices & services

No manual `panel_custom` setup and no `/config/www` copy step is required.

### Notes

This is a personal Home Assistant tool built and tested around real floor-plan dashboards.
It is not an official Home Assistant integration, but it is packaged for HACS and includes a config flow, sidebar panel, Lovelace resource registration and cleanup on uninstall.

More details, screenshots and troubleshooting are available in the README on GitHub.
