# Harbor Bridge Terminal 2.1.0-cubby.2 — Windows-Safe Package

This package removes the path-length problem found in `2.1.0-cubby.1` by using a short `HBT` root and shortening redundant packaging-wrapper directories under the containership edge inventory. The component source below those wrappers is preserved. See `WINDOWS_PATH_MAP.json` for the exact mapping.

**Recommended location:** `D:\HBT` or `C:\HBT`.

Run `WINDOWS_PATH_PREFLIGHT.cmd` after extraction. A result at or below 240 characters is treated as Windows-safe with margin below the legacy 260-character MAX_PATH ceiling.
