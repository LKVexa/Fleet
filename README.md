# Fleet

**Fleet** is the Windows-safe **Harbor Bridge Terminal (HBT) 2.1.0-cubby.2** package: containership yard + HERMIT/SPIRAL bridge + Qnode/DF/mobile **cubbies**, projected in-browser on loopback (no VM download).

Copyright (c) 2026 **RUSSELL PHILIP SMITHSON** — see [`COPYRIGHT`](COPYRIGHT) and [`LICENSE`](LICENSE) (Product Preview Tester License).

> Product Preview (evaluation / tester feedback only). Not a production or OSI open-source grant.

## What this package is

| Surface | Role |
|---------|------|
| `containership/` | Unikernel Containership UC-2.8.0 (edge atoms / berths) |
| `bridge-terminal/` | HERMIT / SPIRAL virtual terminal + RAMWS gateway on `127.0.0.1` |
| `qnodes/` + `fleet/` | 50 QVM Qnode cubbies + DF fabric slots + mobile `MC-*` cubbies |
| `optical-desktop/` | VB-JA21 portable optical desktop (junction; rematerialize locally) |
| `mobile-platform/` | Bottle Rocket VM + iOS/Android LCTL nodes; `brctl serve` APDU proxy |

**Version:** see [`VERSION`](VERSION) (`2.1.0-cubby.2`). This tree is the **WinSafe** repack: short `HBT` root and shortened containership wrapper paths so Windows stays under legacy `MAX_PATH`. See [`README_WINDOWS_SAFE.md`](README_WINDOWS_SAFE.md) and [`WINDOWS_SAFE_RELEASE_NOTES.md`](WINDOWS_SAFE_RELEASE_NOTES.md).

Related development tree: [LKVexa/Harbor-Bridge-Terminal](https://github.com/LKVexa/Harbor-Bridge-Terminal).

## License

**Product Preview Tester License** (root [`LICENSE`](LICENSE)). Copyright notice: **RUSSELL PHILIP SMITHSON** ([`COPYRIGHT`](COPYRIGHT)). Component trees keep their own notices (`containership/LICENSE`, `bridge-terminal/LICENSE`, JA21 when linked).

## Windows-safe notes

- Prefer extracting or cloning to a **short root** such as `C:\HBT` or `D:\HBT` (see `INSTALL_WINDOWS_SAFE.cmd`).
- After extract: run `WINDOWS_PATH_PREFLIGHT.cmd` (target ceiling ~240 characters absolute).
- Enable Git long paths when cloning: `git config core.longpaths true`.
- Do **not** commit bulky junctions (`optical-desktop/portable/`, `mobile-platform/**/product/`, Qnode product copies, compiler `out/` / sessions). They are gitignored; rematerialize with `scripts\link-*.cmd` / `materialize-qnode-copies.cmd`.
- Never commit `ACCESS_TOKEN.txt`, `.env`, or principal/credential files (gitignored).

## How to run

1. Clone or extract this package to a short path (`C:\HBT` recommended).
2. Install **Node.js** (for the bridge gateway) and ensure Python is available if you rematerialize QVM/containership tooling.
3. Optional junctions (warn-only if missing):
   - `scripts\link-qvm.cmd`
   - `scripts\link-optical-desktop.cmd`
   - `scripts\link-mobile-platform.cmd`
4. Launch:

```bat
START_HARBOR.cmd
```

This starts the HERMIT gateway on `http://127.0.0.1:10000/` (or the next free port) and, when linked, opens **VB-JA21** with that URL (not the system browser).

Gateway only (no JA21):

```bat
START_HARBOR.cmd --no-browser
```

Browser against an already-running gateway:

```bat
START_HARBOR_BROWSER.cmd
```

Sign-in uses a **local** loopback token minted into `ACCESS_TOKEN.txt` (gitignored). Paste it into the SPIRAL sign-in box.

Seal / verify helpers: `SEAL_HARBOR_RELEASE.cmd`, `VERIFY_HARBOR_RELEASE.cmd`.

## Layout (short)

```
Fleet / HBT/
  containership/     UC edge atoms + berths
  bridge-terminal/   HERMIT/SPIRAL + RAMWS gateway
  optical-desktop/   JA21 PRODUCT_LINK (+ portable junction, gitignored)
  mobile-platform/   Bottle Rocket + LCTL nodes + cubby compiler
  qvm/               QVM PRODUCT_LINK (+ product junction, gitignored)
  qnodes/            QN-01..QN-50 Harbor metadata (product trees gitignored)
  fleet/             CUBBIES / HARBOR_FLEET / MOBILE_PLATFORM JSON
  scripts/           link / materialize / audit helpers
  docs/              technical note + verification evidence
  START_HARBOR.cmd
  LICENSE / COPYRIGHT / VERSION
```

## Docs

- [`docs/Harbor-Bridge-Terminal-Technical-Note.md`](docs/Harbor-Bridge-Terminal-Technical-Note.md) — platform monograph
- [`README_WINDOWS_SAFE.md`](README_WINDOWS_SAFE.md) — WinSafe package notes
- [`WINDOWS_PATH_MAP.json`](WINDOWS_PATH_MAP.json) — wrapper path remapping

## Security hygiene

This public repo must not contain live access tokens, private keys, or principal stores. Patterns such as `ACCESS_TOKEN.txt`, `.env*`, `**/principals/`, and `*.pem` are gitignored. Public release-signing PEMs under containership cargo (if present) may still be excluded by `*.pem`; rematerialize from your sealed release process if needed.
