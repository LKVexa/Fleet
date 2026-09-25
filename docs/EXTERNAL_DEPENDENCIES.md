# External Product Materialization

Harbor 2.1.0-cubby.2 intentionally does not embed the full QVM 8.1.0-alpha or JA21 Portable Desktop 9.8.7 product trees.

Configure them without editing source code:

```bat
set QVM_PRODUCT_ROOT=D:\Products\QVM_Quantum_VM_v8.1.0-alpha
set JA21_PORTABLE_ROOT=D:\Products\JA21-Portable-Desktop-9.8.7
scripts\check-external-products.cmd --strict
scripts\link-qvm.cmd
scripts\link-optical-desktop.cmd
```

`fleet/EXTERNAL_DEPENDENCIES.json` is the machine-readable contract. The checker validates expected sentinel files. Payload SHA-256 values are intentionally `null` until an actual dependency bundle is supplied; this release does not fabricate hashes for files it does not contain.
