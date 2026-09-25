# Harbor Bridge Terminal 2.1.0-cubby.2 — Windows-Safe Repack

## Purpose

This release fixes the Windows **path too long** extraction failure observed with 2.1.0-cubby.1. The previous archive contained a 232-character internal path before Windows added the user's extraction directory.

## Path remediation

- Top-level archive directory shortened to `HBT`.
- Redundant containership edge wrapper directories shortened to stable component IDs such as `inv31`, `gap06`, `sch01`, and versioned variant IDs such as `inv66v430`.
- Single redundant nested wrapper directories are represented as `pkg`.
- Exact old-to-new mappings are recorded in `WINDOWS_PATH_MAP.json`.
- No original wrapper-path references remain outside that mapping file.
- Longest archive-relative file path: **153 characters**, reduced from **232**.
- `WINDOWS_PATH_PREFLIGHT.cmd` checks the actual extracted absolute paths against a conservative 240-character ceiling.
- `INSTALL_WINDOWS_SAFE.cmd` can relocate an already extracted copy to `D:\HBT` or `C:\HBT`.

## Integrity

- Bridge syntax: **95/95 PASS**.
- Bridge sealed manifest: **295 files, 0 hash failures, 0 unlisted, version aligned**.
- Cubby/mobile unit checks: **4/4 PASS**.
- Containership checksum inventory: **20,164 bound files PASS; 0 bad, missing, unbound, or malformed records**.
- The containership full quick battery exceeded the available execution window and is intentionally not claimed as a pass.

## Compatibility

The path changes are packaging-wrapper normalization. Harbor protocol/API behavior is intentionally unchanged from 2.1.0-cubby.1. Component contents below the renamed wrappers are preserved, and the containership was resealed against the new physical inventory.
