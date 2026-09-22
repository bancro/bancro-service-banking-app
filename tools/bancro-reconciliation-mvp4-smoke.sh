#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
grep -q 'ReconciliationModule' "$ROOT/src/app/app.module.ts"
grep -q "READ_BANCRO_RECONCILIATION" "$ROOT/src/app/core/shell/sidenav/sidenav.component.html"
grep -q "path: 'reconciliation'" "$ROOT/src/app/reconciliation/reconciliation-routing.module.ts"
grep -q 'generateSimulatorBatch' "$ROOT/src/app/reconciliation/reconciliation.service.ts"
grep -q 'AMOUNT_MISMATCH' "$ROOT/src/app/reconciliation/reconciliation.component.html"
grep -q 'Open exceptions' "$ROOT/src/app/reconciliation/reconciliation.component.html"
grep -q 'settlementStatus' "$ROOT/src/app/payments/payments.component.html"
echo 'Bancro Reconciliation MVP4 frontend source smoke checks passed.'
