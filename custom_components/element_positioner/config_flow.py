"""Config Flow für Element Positioner."""
from homeassistant import config_entries
from homeassistant.core import callback

from .const import DOMAIN


class ElementPositionerConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Ein-Klick-Setup: keine Eingaben nötig."""

    VERSION = 1

    async def async_step_user(self, user_input=None):
        # Nur eine Instanz erlaubt
        await self.async_set_unique_id(DOMAIN)
        self._abort_if_unique_id_configured()

        if user_input is not None:
            return self.async_create_entry(title="Element Positioner", data={})

        return self.async_show_form(step_id="user")
