# ÆNIGMA Circles — Partner API (v1)

ÆNIGMA Circles lets a user keep a small circle of loved ones — parent & child
first, then partners and family — and receive a daily **emotional-weather
forecast** for each member: how that person is *likely* to be running today,
what tends to land well, and what to go gently on. Forecasts are computed
deterministically from the member's ÆNIGMA profile and personal cycles
(Personal Year / Month / Day).

This API is the integration surface for partner platforms (family-safety,
couples, and community apps — e.g. a Life360-style family platform adding an
emotional layer to its location layer: *you know where they are; now know how
they are*).

**Base URL:** `https://casaos-production-f40b.up.railway.app`

## The data-minimization contract

This is the heart of the offer, and it is contractual, not cosmetic:

- Partners receive **forecast outputs only** — a headline, a short outlook,
  a "lands well today" line, and a "go gently" line.
- **Never** birth dates, birth times/places, names beyond an opaque
  `memberRef`, raw profile values, or cycle internals.
- **Consent gates everything.** A member is forecastable only while their
  consent status is `managed` (a parent-managed child profile) or `accepted`
  (the member personally accepted, entering their own birth data — that entry
  *is* the consent step). Revocation — by the user or by the member — takes
  effect immediately: the forecast endpoint returns `403` from that moment.
- Every forecast carries its framing with it: a symbolic lens, likelihood
  language, never a diagnosis, a prediction of events, or a mental-health
  claim. Partners must not strip the `framing` field when rendering.

## Authentication

Each partner receives one API key (`aen_pk_…`), shown once at creation and
stored only as a SHA-256 hash on ÆNIGMA's side.

Send it on every request, either way:

```
Authorization: Bearer aen_pk_<key>
x-api-key: aen_pk_<key>
```

Missing/invalid keys → `401`. Keys carry scopes: `forecast:read`,
`status:read`; a key without the needed scope → `403`.

**Rate limit:** 120 requests per 5 minutes per key → `429`.

**Key management (ÆNIGMA side):** keys are minted with
`aenigma/scripts/seed-partner-key.js` or seeded via the `AENIGMA_PARTNER_KEYS`
environment variable (JSON array of `{name, keyHash, scopes}`). Keys are
loaded at app start — after seeding the data file, restart the app (env-var
keys are the recommended production path for exactly this reason).
Revocation sets `revokedAt`; revoked keys fail auth immediately on the next
app start (env-seeded revocations take effect on the next deploy/restart).

## Endpoints

### GET /api/partner/v1/forecast

Today's (or a given date's) forecast for one consented member.

| Query param | Required | Notes |
|---|---|---|
| `memberRef` | yes | Opaque member reference issued by ÆNIGMA |
| `date` | no | `YYYY-MM-DD`; defaults to today (UTC) |

**200**
```json
{
  "memberRef": "mref_9f2c…",
  "date": "2026-10-21",
  "headline": "Deep water, quiet surface",
  "outlook": "Alex is likely turned inward today — reflective, observant, needing more quiet than company. Inside a personal month of reflection, that thinks before it speaks.",
  "landsWell": "Space without interrogation — be nearby, not probing.",
  "goGently": "Don't read quiet as a problem to fix or a mood to punish.",
  "framing": "A symbolic read through the ÆNIGMA lens. Grant's BFN framework is a proposed framework, and personal cycles are a language for reflection — likelihood, not certainty; a lens, not a diagnosis. A person is not their pattern."
}
```

**Errors**

| Status | Body | Meaning |
|---|---|---|
| 401 | `{"error":"partner api key required"}` / `"invalid partner api key"` | No key, bad key, or revoked key |
| 403 | `{"error":"missing scope: forecast:read"}` | Key lacks the scope |
| 403 | `{"error":"consent_not_active","consentStatus":"revoked"}` | Member is not currently sharing |
| 404 | `{"error":"member not found"}` | Unknown `memberRef` |
| 400 | `{"error":"date must be YYYY-MM-DD"}` | Malformed date |
| 429 | `{"error":"rate limit — 120 requests per 5 minutes per key"}` | Slow down |

### GET /api/partner/v1/members/:memberRef/status

Consent status only — the minimum a partner needs to render or hide a
member's forecast card.

**200**
```json
{ "memberRef": "mref_9f2c…", "consentStatus": "accepted" }
```

`consentStatus` is one of: `managed` · `invited` (not yet forecastable) ·
`accepted` · `revoked`. Unknown ref → `404`.

## Consent semantics (for partner product teams)

- **Parent & child (lead use case):** a parent creates a *managed* profile
  for their child inside ÆNIGMA — forecasts flow. The child receives a claim
  link; claiming moves the profile to `accepted` under the child's own
  control, and the child can revoke from that same link at any time. The
  parent is told plainly in-product that the profile is parent-managed.
- **Partners & adult family:** invite-only. The member opens the invite,
  sees exactly what will be shared (forecast text only), enters *their own*
  birth date, and taps Accept. Nothing is forecastable before that tap.
- **Revocation is symmetric and instant.** Either side can end sharing; the
  API reflects it on the next request. There is no grace window and no
  cached-consent mode.
- **Minors:** child profiles exist only as parent-managed or self-claimed
  inside a parent & child circle. Partner integrations receive forecast
  text for a child member only under the same consent rules as adults.

## What a forecast is — and is not

A forecast is a **symbolic, reflective read**: deterministic arithmetic on a
person's birth-date cycles, phrased as likelihood ("likely", "tends to").
It is not a mood measurement, a psychological assessment, a prediction of
behavior, or a diagnostic signal, and it must not be presented to end users
as one. The `framing` field ships with every response so the lens travels
with the text.

## Roadmap (not in v1)

- Push delivery of the morning forecast (in-app only in v1).
- Member-facing mobile claim/revoke pages beyond the link flow.
- Per-partner member provisioning webhooks (consent-change events).
- Ask ÆNIGMA reaction queries (`POST` — how would this member likely react
  to X?) under a `ask:read` scope.
