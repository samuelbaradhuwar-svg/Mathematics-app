# Judah's Maths Tutor: Claude artifact build

The whole app as ONE Claude artifact page (`page.html`), published at
https://claude.ai/artifact/Uo7MxZQy6xwHCBAAEQH3qZ

- `src/`    the Floot app's curriculum, question generators, marking, mastery logic and screens (unchanged).
- `app/`    what replaces the Floot server inside the page: `localApi.ts` (same request/response shapes as the old
            endpoints), `store.ts` (saves to the viewer's private `db` area, or this device only), `ai.ts` (Claude via
            the artifact `sample` capability, no API key).
- `kit/`, `shim/`  small stand-ins for Floot's UI kit, auth, helmet and toast.
- `build.mjs` bundles with esbuild; `assemble.py` writes `dist/page.html`.

Build: `npm i` (esbuild, react, react-dom, react-router-dom@6.28.0, @tanstack/react-query@5.62.0, lucide-react@0.468.0),
copy `kit/*` into `src/components/`, then `node build.mjs && python3 assemble.py`.
Capabilities to declare when publishing: `{db: {}, user: {}, sample: {images: true}}`.
