# Harbor Bridge Terminal 2.1.0-cubby.2

This release is the remediation build derived from the Cubby Mobile Edition technical expository review.

## Closed findings

- **Release integrity (P0):** the bridge release manifest is regenerated from the intended tree; verification now fails on missing, mismatched **or unlisted** files and on version drift.
- **Benchmark correctness (P0):** the W3 fixture raises `maxConnectionsPerPrincipal` with `BENCH_SESSIONS`, so the default eight same-principal clients no longer contradict gateway policy.
- **Test robustness (P1):** the default release test launcher is cross-platform and serial; timing-sensitive `input.ack` assertions use condition-based waiting. Parallel execution remains available as a stress mode.
- **RAM-limit oracle (P1):** the heap-cap test accepts the canonical bounded-failure surfaces rather than two wording-specific diagnostics.
- **Thread telemetry (P1):** workers report isolate heap/external/ArrayBuffer counters. Per-thread RSS is intentionally `null`; process workers may report child-process RSS.
- **Protocol benchmark metadata (P1):** v2 bulk-output accounting reports exact 7-byte application framing overhead, removing the stale v1 base64/JSON 1.333x annotation.
- **Mobile host compatibility:** Harbor no longer selects bundled Windows `brctl.exe` as runnable on Linux/macOS. Projection status reports host incompatibility explicitly and APDU proxy requests return service-unavailable semantics.
- **External-product portability (P1):** user-specific absolute QVM/JA21 and Cubby-mobile product paths were removed from the distributable. Environment-driven QVM, JA21, Bottle Rocket, iOS-LCTL, Linear-Android-LCTL and RODEO bindings plus a machine-readable dependency manifest/checker are included.

## Deliberately not converted into false closure

The archive still does not bundle the full external QVM product or JA21 portable tree; their payload hashes therefore cannot be invented. `fleet/EXTERNAL_DEPENDENCIES.json` records the expected versions and sentinels, and `scripts/check-external-products.cmd` reports availability. A clean-room containership gate and expanded multi-host R28 repetitions remain environment/experiment work rather than source-code defects.

## Release gate

On Windows:

```bat
VERIFY_HARBOR_RELEASE.cmd
```

To regenerate the bridge seal after intentional source changes:

```bat
SEAL_HARBOR_RELEASE.cmd
```

The seal operation runs syntax + deterministic serial tests before rewriting `bridge-terminal/release/manifest.json`, then requires strict verification to pass.
## Fresh release-candidate verification

Performed against the regenerated `2.1.0-cubby.2` tree on 2026-09-25:

- JavaScript syntax gate: **95/95 files passed**.
- Targeted core regression gate: **64 passed, 0 failed, 6 skipped**; the skips are the DF-fabric cases whose external containers are not bundled.
- Chaos lifecycle gate: **11/11 passed**, including thread and process catastrophic-RegExp containment.
- Slow-consumer/security/RAM-ledger group: **24/24 passed**.
- RAM v2 end-to-end group: **7/7 passed** across thread/process vertical slices and heap-cap admission behavior.
- Cubby/mobile unit gate: **4/4 passed**.
- WebSocket conformance: **15/15 passed** when executed as two deterministic name-filtered groups; the monolithic invocation is slow because several negative-frame cases intentionally wait for protocol deadlines.
- Default load benchmark: **8/8 sessions admitted**. W1 p50/p95/p99 were 0.767/2.099/3.846 ms on this review host; W2 delivered 3.90 MiB/s with exact Harbor v2 application-frame expansion of 1.000917; W3 reported 8 thread-isolate heap samples (mean 7.28 MiB) and gateway RSS 114.8→157.7 MiB. These are loopback review-host measurements, not deployment SLOs.
- Strict bridge release seal: regenerated from the current tree and verified with **0 hash failures, 0 unlisted files, 0 version drift**.

Test-side Cubby/auth evidence is disabled by default in the generic gateway test helper so release verification does not mutate `fleet/CUBBIES.json`, auth queues, or verification logs. Dedicated mobile integration runs can opt in explicitly.

