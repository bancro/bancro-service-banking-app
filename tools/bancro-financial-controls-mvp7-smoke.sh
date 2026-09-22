#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SVC="$ROOT/src/app/operations/operations.service.ts"
COMP="$ROOT/src/app/operations/operations.component.ts"
HTML="$ROOT/src/app/operations/operations.component.html"
TELLER="$ROOT/src/app/teller-workstation/teller-workstation.component.ts"
for f in "$SVC" "$COMP" "$HTML" "$TELLER"; do test -f "$f"; done
grep -q "financialControlsBase = '/bancro/financial-controls'" "$SVC"
grep -q 'accountingChanges' "$SVC"
grep -q 'postFeeJournal' "$SVC"
grep -q 'varianceOverrides' "$SVC"
grep -q 'closeBranch' "$SVC"
grep -q 'MVP7 Financial Controls' "$HTML"
grep -q 'Accounting Mapping Maker / Checker' "$HTML"
grep -q 'Balanced Fee / Tax GL Posting' "$HTML"
grep -q 'Teller Variance Supervisor Overrides' "$HTML"
grep -q 'Unresolved NIP funds' "$HTML"
grep -q 'separate supervisor variance override has been approved' "$TELLER"
! grep -q 'allowVariance' "$TELLER"
echo 'Bancro frontend Financial Controls MVP7 smoke: PASS'
