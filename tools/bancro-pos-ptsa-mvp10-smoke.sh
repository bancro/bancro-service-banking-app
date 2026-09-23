#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OPS="$ROOT/src/app/operations/operations.component.ts"
HTML="$ROOT/src/app/operations/operations.component.html"
SERVICE="$ROOT/src/app/operations/operations.service.ts"
LOGIN="$ROOT/src/app/login/login.component.ts"
NAV="$ROOT/src/app/core/shell/sidenav/sidenav.component.html"
for f in "$OPS" "$HTML" "$SERVICE" "$LOGIN" "$NAV"; do test -s "$f"; done
grep -q 'Bancro Administration & Operations' "$HTML"
grep -q 'Teller Login & Access Readiness' "$HTML"
grep -q 'MVP10 POS / PTSA / ISO 8583 Administration' "$HTML"
grep -q 'Merchant / Terminal / PTSA Configuration' "$HTML"
grep -q 'POS Settlement / Reconciliation Preparation' "$HTML"
grep -q 'posStatus()' "$SERVICE"
grep -q 'posAuthorize' "$SERVICE"
grep -q 'tellerAccess' "$SERVICE"
grep -q "'/teller-workstation'" "$LOGIN"
grep -q 'READ_BANCRO_TELLER_WORKSTATION' "$LOGIN"
grep -q 'Bancro Administration' "$NAV"
echo 'Bancro POS/PTSA MVP10 frontend smoke: PASS'
