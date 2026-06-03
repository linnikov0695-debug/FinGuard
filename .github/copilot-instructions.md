# FinGuard Copilot Instructions

## Project snapshot

- Node.js + Express API using ES modules (`"type": "module"` in `package.json`).
- Current implemented domain is auth; other domains are scaffolds (`alerts`, `blacklist`, `cases`, `risk`, `transactions`).
- Runtime entry is `src/server.js` → app wiring is in `src/app.js`.

## Architecture and data flow

- Layering pattern is **route → validate middleware → controller → service → DB**.
  - Route example: `src/modules/auth/auth.routes.js`
  - Validation middleware: `src/middleware/validate.js`
  - Controller example: `src/modules/auth/auth.controller.js`
  - Service + SQL example: `src/modules/auth/auth.service.js`
- Validation uses Zod and stores parsed payload on `req.validated`; controllers are expected to use `req.validated` (not raw `req.body`).
- Services throw structured error objects (`{ status, name, message }`); `src/middleware/errorHandler.js` normalizes response shape.
- PostgreSQL access is centralized through `pool` from `src/config/db.js`; SQL is currently inline in services (no ORM/repository layer).

## Security and auth conventions

- App-level middleware in `src/app.js`: `helmet`, `cors`, and `express.json({ limit: "1mb" })`.
- Auth module behavior:
  - `registerUser()` checks existing email, hashes password with bcrypt, inserts user.
  - `loginUser()` verifies password and returns JWT signed with `env.JWT_SECRET` and `env.JWT_EXPIRES_IN`.
- Required env vars are enforced at startup in `src/config/env.js` (`DATABASE_URL`, `JWT_SECRET`).

## Workflows (current, as discovered)

- Install deps: `npm install`
- Dev server: `npm run dev` (nodemon on `src/server.js`)
- Prod-like run: `npm start`
- Tests: `npm test`
  - Current script is `jest -- runInBand`, which Jest interprets as a test pattern; this exits non-zero with “No tests found”.
  - `tests/api.test.js` exists but is empty.
- DB scripts are declared (`npm run migrate`, `npm run seed`) but `scripts/` is currently empty.

## Codebase-specific gotchas for agents

- Keep file-extension imports (`.js`) in all local ESM imports.
- Respect the existing error contract (`status`, `name`, `message`) when adding service/controller logic.
- Preserve module boundaries: keep SQL/business logic in `*.service.js`, keep controllers thin.
- There is an existing filename typo in transactions (`transactions.contriller.js`) and related import mismatches; verify exact filenames before editing.
- `src/app.js` currently mounts only `/auth`; new modules require explicit route mounting.

## When adding a new module

- Mirror auth structure: `*.schema.js`, `*.routes.js`, `*.controller.js`, `*.service.js`.
- Add Zod schema first, then route with `validate(schema)`, then controller using `req.validated`.
- Throw structured errors from services so `errorHandler` can return consistent JSON.
- Mount router in `src/app.js` and confirm `/health` still returns `{ ok: true, message }`.
