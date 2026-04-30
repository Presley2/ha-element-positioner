"""Element Positioner — Drag & Drop Editor für HA picture-elements."""
import logging
import uuid
from pathlib import Path

from homeassistant.components.frontend import async_register_built_in_panel
from homeassistant.components.http import StaticPathConfig
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store

from .const import DOMAIN, STATIC_PATH, PANEL_URL_PATH

_LOGGER = logging.getLogger(__name__)

FRONTEND_DIR = Path(__file__).parent / "frontend"
LOVELACE_RESOURCES_KEY = "lovelace_resources"


async def async_setup(hass: HomeAssistant, config: dict) -> bool:
    return True


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Panel + Lovelace-Resource beim Start registrieren."""

    await hass.http.async_register_static_paths([
        StaticPathConfig(STATIC_PATH, str(FRONTEND_DIR), cache_headers=False)
    ])

    await _async_ensure_lovelace_resource(hass, f"{STATIC_PATH}/drag_editor.js")

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


async def _async_ensure_lovelace_resource(hass: HomeAssistant, url: str) -> None:
    """JS als Lovelace-Resource registrieren falls noch nicht vorhanden."""

    # Versuch 1: LovelaceData.resources (moderne HA-API, hass.data["lovelace"]
    # ist in HA 2023.9+ ein LovelaceData-Objekt, kein Dict mehr)
    try:
        lovelace = hass.data.get("lovelace")
        if lovelace is not None:
            res_col = getattr(lovelace, "resources", None)
            if res_col is not None and hasattr(res_col, "async_create_item"):
                await res_col.async_load()
                current_urls = {item.get("url", "") for item in res_col.async_items()}
                if url not in current_urls:
                    await res_col.async_create_item({"res_type": "module", "url": url})
                    _LOGGER.info("Lovelace-Resource registriert (live): %s", url)
                else:
                    _LOGGER.debug("Lovelace-Resource bereits vorhanden: %s", url)
                return
    except Exception as exc:
        _LOGGER.debug("Live-Registrierung fehlgeschlagen (%s), versuche Storage", exc)

    # Versuch 2: Storage direkt schreiben (wirkt ohne Neustart wenn HA storage-mode nutzt)
    try:
        store = Store(hass, 1, LOVELACE_RESOURCES_KEY)
        data = await store.async_load() or {"items": []}
        items = data.setdefault("items", [])
        if not any(url in item.get("url", "") for item in items):
            items.append({"url": url, "res_type": "module", "id": uuid.uuid4().hex})
            await store.async_save(data)
            _LOGGER.info("Lovelace-Resource in Storage geschrieben: %s", url)
        else:
            _LOGGER.debug("Lovelace-Resource bereits im Storage: %s", url)
    except Exception as exc:
        _LOGGER.warning("Lovelace-Resource konnte nicht registriert werden: %s", exc)


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    return True


async def async_remove_entry(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Lovelace-Resource beim Löschen der Integration entfernen."""
    url = f"{STATIC_PATH}/drag_editor.js"

    # Versuch 1: LovelaceData.resources
    try:
        lovelace = hass.data.get("lovelace")
        if lovelace is not None:
            res_col = getattr(lovelace, "resources", None)
            if res_col is not None and hasattr(res_col, "async_delete_item"):
                await res_col.async_load()
                for item in res_col.async_items():
                    if url in item.get("url", ""):
                        await res_col.async_delete_item(item["id"])
                        _LOGGER.info("Lovelace-Resource entfernt: %s", url)
                        return
    except Exception as exc:
        _LOGGER.debug("Live-Cleanup fehlgeschlagen: %s", exc)

    # Versuch 2: Storage bereinigen
    try:
        store = Store(hass, 1, LOVELACE_RESOURCES_KEY)
        data = await store.async_load() or {"items": []}
        data["items"] = [i for i in data.get("items", []) if url not in i.get("url", "")]
        await store.async_save(data)
        _LOGGER.info("Lovelace-Resource aus Storage entfernt: %s", url)
    except Exception as exc:
        _LOGGER.warning("Cleanup fehlgeschlagen: %s", exc)
