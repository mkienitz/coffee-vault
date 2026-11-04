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

Build with `npm run build`; no database path or deployment origin is needed.
Start the production server with `npm start`, setting both variables at runtime:

```sh
COFFEE_VAULT_DB_PATH=/var/lib/coffee-vault/db.sqlite \
COFFEE_VAULT_ORIGIN=https://coffee.example.com \
npm start
```

`COFFEE_VAULT_ORIGIN` must be an HTTP(S) origin, without credentials, a path,
query or fragment. The startup entry point (`server.mjs`) supplies this origin
to adapter-node before SvelteKit checks form and remote-function requests.
Use `npm start` or `node server.mjs` rather than `node build` so this runtime
configuration is applied. Deploy `server.mjs` alongside `build` and `node_modules`.
The adapter's `HOST`, `PORT`, socket activation and shutdown settings still apply.

The NixOS module sets the origin from `services.coffee-vault.domain` in the
service environment. Changing the domain requires a restart, not a package rebuild.
Development with `npm run dev` continues to use the local request origin.
