"""Element Positioner — Drag & Drop Editor für HA picture-elements."""
import logging
from pathlib import Path

from homeassistant.components.frontend import async_register_built_in_panel, add_extra_js_url
from homeassistant.components.http import StaticPathConfig
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

from .const import DOMAIN, STATIC_PATH, PANEL_URL_PATH

_LOGGER = logging.getLogger(__name__)

FRONTEND_DIR = Path(__file__).parent / "frontend"


async def async_setup(hass: HomeAssistant, config: dict) -> bool:
    return True


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Panel + Lovelace-Resource beim Start registrieren."""

    # Statische Dateien aus dem custom_component-Verzeichnis ausliefern
    await hass.http.async_register_static_paths([
        StaticPathConfig(STATIC_PATH, str(FRONTEND_DIR), cache_headers=False)
    ])

    # drag_editor.js auf allen Dashboard-Seiten laden (wie card-mod, browser_mod)
    add_extra_js_url(hass, f"{STATIC_PATH}/drag_editor.js")

    # Sidebar-Panel registrieren — kein panel_custom in configuration.yaml nötig
    async_register_built_in_panel(
        hass,
        component_name="custom",
        sidebar_title="Element Positioner",
        sidebar_icon="mdi:pencil-ruler",
        frontend_url_path=PANEL_URL_PATH,
        config={
            "_panel_custom": {
                "name": "drag-editor-panel",
                "module_url": f"{STATIC_PATH}/drag_editor_panel.js",
                "embed_iframe": False,
                "trust_external": False,
            }
        },
        require_admin=True,
    )

    _LOGGER.info("Element Positioner geladen")
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Panel bleibt bis zum nächsten HA-Neustart registriert."""
    return True
