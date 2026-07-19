# CLAUDE.md

Guidance for AI assistants working in this repository.

## What this repository is

This repo contains **two independent applications** that live side by side. Know
which one you're touching before you make changes — they use different
languages, build systems, and deploy targets.

1. **CasaOS** — the original project: a Go backend for a self-hosted personal
   cloud OS ("Your Personal Cloud"). This is the bulk of the codebase (`main.go`
   plus `route/`, `service/`, `pkg/`, `model/`, `drivers/`, etc.). It builds to a
   single `casaos` binary that runs as a systemd service on Linux and serves a
   web UI (the `UI/` git submodule) and a REST API.

2. **ÆNIGMA** — a self-contained Node.js/Express web app added at the repo root
   (`package.json`, `aenigma/`, `marketing/`). It has **no dependency on the Go
   code**. The `Dockerfile` and `railway.json` deploy *this* app, not CasaOS —
   see the Dockerfile comment: "explicit Docker build so Railway ignores the
   legacy Go code."

When a task mentions Docker/Railway deploys, chat, reflections, archetypes, or
"the field," it's ÆNIGMA. When it mentions storage, files, shares, ZeroTier,
system stats, or the CasaOS gateway/message bus, it's the Go backend.

---

## CasaOS (Go backend)

### Architecture

CasaOS is one of several microservices in the wider IceWhale/CasaOS ecosystem.
It does **not** listen on a public port directly. Instead:

- On startup it binds to a random localhost port (`main.go`).
- It registers its route prefixes with an external **Gateway** service
  (`CasaOS-Gateway`) via `service.MyService.Gateway().CreateRoute(...)`, which
  reverse-proxies public traffic to it.
- It registers event types with an external **Message Bus** service
  (`CasaOS-MessageBus`) for pub/sub.
- Shared code (gateway client, JWT, logger, constants, models) comes from the
  `github.com/IceWhaleTech/CasaOS-Common` module.

The HTTP surface is multiplexed by path prefix in `main.go` via
`util_http.HandlerMultiplexer`:

| Prefix | Router | Location |
|--------|--------|----------|
| `v1`   | legacy Gin/handler API | `route/v1.go`, `route/v1/*.go` |
| `v2`   | OpenAPI-generated Echo API | `route/v2.go`, `route/v2/*.go` |
| `v3`   | file service | `route.InitFile()` |
| `doc`  | Swagger UI + spec | `route/v2.go` (`InitV2DocRouter`) |

### Layout

```
main.go              # entrypoint: config, DB, service wiring, router mux, gateway/bus registration
common/              # version + shared constants (VERSION lives in common/constants.go)
route/               # HTTP routing
  init.go            # startup hooks (network mounts, base info)
  periodical.go      # cron-driven tasks (e.g. hardware status over websocket, every 5s)
  v1.go, v1/         # v1 API handlers
  v2.go, v2/         # v2 API handlers (OpenAPI/Echo)
service/             # business logic; MyService is the central Repository interface (service/service.go)
  model/             # service-layer models
model/               # domain models mapped from config sections and DB
pkg/                 # reusable packages: config, sqlite, cache, fs, samba, ddns, sign, github, gredis, utils
drivers/             # cloud storage drivers: dropbox, google_drive, onedrive (+ base)
internal/            # internal-only: conf, driver, op, sign
api/                 # OpenAPI spec (api/casaos/openapi.yaml) + Swagger index.html
codegen/             # GENERATED code from OpenAPI specs — do not edit by hand
cmd/                 # auxiliary commands: migration-tool, message-bus-docgen
build/               # packaging: systemd units, install/migration/cleanup scripts, sysroot, casaos.conf.sample
conf/                # config sample
types/               # shared type definitions
interfaces/          # migration tooling interfaces
```

### Service layer pattern

All business logic hangs off the global `service.MyService`, a `Repository`
interface (`service/service.go`) exposing sub-services: `Casa()`,
`Connections()`, `Gateway()`, `Health()`, `Notify()`, `Rely()`, `Shares()`,
`System()`, `Storage()`, `MessageBus()`, `Peer()`, `Other()`. To add
functionality, add a method to the relevant sub-service interface and its
implementation under `service/`, then call it from a route handler. `MyService`
is constructed once in `main.go`'s `init()` via `service.NewService(db, runtimePath)`.

### Configuration

- Config is INI-based, loaded by `pkg/config` from `casaos.conf`. The canonical
  sample is `build/sysroot/etc/casaos/casaos.conf.sample` (embedded into the
  binary via `//go:embed` in `main.go` and written out if no config exists).
- Sections `[app]`, `[server]`, `[system]` map onto structs in `model/`
  (`AppInfo`, `ServerInfo`, `SystemConfigInfo`) via `pkg/config`.
- Default runtime paths (DB, logs, runtime) come from
  `CasaOS-Common/utils/constants` — e.g. DB at `/var/lib/casaos`, logs at
  `/var/log/casaos`.
- Persistence is SQLite (via GORM), initialized in `main.go` (`pkg/sqlite`).

### Version

The version string is `common.VERSION` in `common/constants.go`. Bump it there.
(The release CI historically read it from `types/system.go`; that file no longer
exists, so `common/constants.go` is authoritative.)

### Code generation

Two `//go:generate` directives at the top of `main.go` regenerate API code from
OpenAPI specs using `oapi-codegen` v1.12.4:

```
go generate ./...
```

This produces `codegen/casaos_api.go` (from `api/casaos/openapi.yaml`) and
`codegen/message_bus/api.go` (from the remote MessageBus spec). Never edit files
under `codegen/` by hand — regenerate instead. When you change the API contract,
edit `api/casaos/openapi.yaml` then regenerate.

### Build & run

Prerequisites: Go ≥ 1.21 (go.mod), plus `node`/`yarn` for the UI submodule, and
`upx` for the release build.

```bash
# Full build (UI submodule + backend) — see Makefile
make build

# Backend only, quick local build
go build -o casaos main.go

# Run against a specific config / db
./casaos -c /path/to/casaos.conf -db /path/to/db

# Version
./casaos -v
```

Clone with submodules (the UI lives in the `UI/` submodule → `CasaOS-UI`):

```bash
git clone --recurse-submodules --remote-submodules <url>
```

The `Makefile` `build-ui` target expects a `CasaOS-UI/` directory; the
`.gitmodules` submodule path is `UI`. See `DEVELOPING.md` for the fork-based dev
setup.

### Testing

Go tests live next to their code as `*_test.go` (e.g. `service/file_test.go`,
`service/health_test.go`, `route/v1/samba_test.go`). Mocks use
`github.com/golang/mock`. Run:

```bash
go test ./...
go test ./service/...   # a single package
```

### Conventions

- Standard Go formatting: run `gofmt`/`goimports` before committing.
- Structured logging via `CasaOS-Common/utils/logger` (Zap) — use
  `logger.Info/Error(...)` with `zap` fields, not `fmt.Println`.
- Route handlers stay thin: parse/validate, delegate to `service.MyService`,
  serialize the response.
- Keep v1 and v2 separate. Prefer adding new endpoints to the v2 OpenAPI API.
- Import path for this module is `github.com/IceWhaleTech/CasaOS`.

---

## ÆNIGMA (Node.js app)

A single-dependency Express app — "a mirror for your consciousness" — that is
what the repo's `Dockerfile`/`railway.json` actually deploy.

### Layout

```
package.json            # repo root: start script + express (+ @anthropic-ai/sdk)
Dockerfile              # node:22-alpine image that runs aenigma/server.js
railway.json            # Railway deploy config (healthcheck /api/health)
aenigma/
  server.js             # Express server + deterministic "field" engine + Claude-backed reflect/chat
  knowledge/            # codex.md + corpus/*.txt retrieval material for the chat agent
  public/               # static SPA (index.html, style.css, app.js)
marketing/              # brand guide, campaign, launch copy, assets (not code)
```

### Endpoints (`aenigma/server.js`)

- `GET  /api/health` — health check (used by Railway).
- `GET  /api/field` — the daily deterministic, date-seeded "resonance field."
- `POST /api/reflect` — a personalized read; Claude-powered when
  `ANTHROPIC_API_KEY` is set, otherwise a local templated fallback.
- `POST /api/chat` — conversational agent grounded in the `knowledge/` corpus.
- `GET  *` — serves the static SPA from `aenigma/public/`.

### Run & deploy

```bash
npm install
npm start          # node aenigma/server.js, listens on PORT (default 3000)
```

- Design goals: no database, no required API keys. Reflections are stored in the
  visitor's browser `localStorage`. The daily field is seeded from the UTC date
  so every visitor sees the same field and it advances at 00:00 UTC.
- Claude features (`/api/reflect`, `/api/chat`) activate only when
  `ANTHROPIC_API_KEY` is present in the environment; the app runs fully without
  it via local fallbacks.
- Deploy is via the `Dockerfile` (Railway uses it per `railway.json`).

---

## CI / workflows

GitHub Actions live in `.github/workflows/`:

- `casa.yml` — builds CasaOS (UI + xgo cross-compile for linux amd64/arm64/arm-7)
  and cuts a prerelease. Manually triggered (`workflow_dispatch`).
- `release.yml`, `sync_openapi.yml`, `codecov.yml`, `publish_npm.yaml`,
  `demo.yml`, `push_test_server.yml`, `push_events_to_discord.yml`, and issue
  automation.

Release packaging config: `.goreleaser.yaml` / `.goreleaser.debug.yaml`.

---

## Working guidelines for AI assistants

- **Identify the app first.** A change to `aenigma/`, `package.json`,
  `Dockerfile`, or `railway.json` is ÆNIGMA. A change under `route/`, `service/`,
  `pkg/`, `model/`, `drivers/`, or `main.go` is the Go backend. Don't cross the
  streams — e.g. don't add Go build steps to the Node deploy.
- **Never hand-edit `codegen/`.** Change the OpenAPI spec and run `go generate`.
- **Match surrounding style** in each language (idiomatic Go vs. the existing
  Node style in `server.js`).
- Run `go build ./...` and `go test ./...` for Go changes; `npm start` /
  exercise the endpoints for ÆNIGMA changes.
- The upstream project is `github.com/IceWhaleTech/CasaOS`; import paths and the
  wider ecosystem (Gateway, MessageBus, Common, UI) reference that org.
