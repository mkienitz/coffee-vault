# Coffee Vault ☕

This is an inventory management system/digital twin for keeping track of my coffee freezer - this might sound weird.
The freezer organizer is 3D-printed and stores up to 88 (11 drawers with 8 slots each) NFC-tagged tubes with frozen single-doses.

## Why?

There is already a great and free app called [Beanconqueror](https://github.com/graphefruit/Beanconqueror) but I wanted something more tuned to my personal workflow and preferences.
Data entry on a full keyboard and a careful subset of metadata I want to actually track.

## Features

- Catalog coffees with **only** the information I care about, and nothing else. Avoids data-tracking fatigue.
- Just tap a tube to a smartphone before brewing to mark it as consumed
- Log brews with date and weight so I always know what's left
- QR code labels for managing free-form (usually vacuum-sealed) one-off doses
- Dark mode, toasts, some visual candy

Built on Svelte 5 + SvelteKit 3 (remote functions), Drizzle + SQLite, Tailwind 4 + DaisyUI, Valibot.

## Deployment

Set `COFFEE_VAULT_DB_PATH` at runtime to the SQLite database path.
For deployments behind a reverse proxy, set `COFFEE_VAULT_ORIGIN` to the public
origin (for example, `https://coffee.example.com`) **when running `npm run build`**.
This configures SvelteKit's `paths.origin`; adapter-node 6 no longer uses the
runtime `ORIGIN` variable. The NixOS module supplies this build-time value from
`services.coffee-vault.domain`. Without an explicit origin, SvelteKit derives it
from the incoming request.
