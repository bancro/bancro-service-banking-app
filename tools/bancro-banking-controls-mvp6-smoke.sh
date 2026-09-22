#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TELLER="$ROOT/src/app/teller-workstation/teller-workstation.component.ts"
TSVC="$ROOT/src/app/teller-workstation/teller-workstation.service.ts"
ACT="$ROOT/src/app/activity-trail/activity-trail.component.ts"
APP="$ROOT/src/app/app.module.ts"
NAV="$ROOT/src/app/core/shell/sidenav/sidenav.component.html"
OPS="$ROOT/src/app/operations/operations.component.html"
for f in "$TELLER" "$TSVC" "$ACT" "$APP" "$NAV" "$OPS"; do test -f "$f"; done
grep -q "submitCommand(operation" "$TELLER"
grep -q "commands/{" "$ROOT/src/app/teller-workstation/teller-workstation.service.ts" || grep -q 'commands/${' "$ROOT/src/app/teller-workstation/teller-workstation.service.ts"
grep -q 'requestCashControl' "$TELLER"
grep -q 'decideCashControl' "$TELLER"
grep -q 'printReceipt' "$TELLER"
grep -q 'ActivityTrailModule' "$APP"
grep -q 'Current Activity Trail' "$NAV"
grep -q 'formControlName="action"' "$ROOT/src/app/activity-trail/activity-trail.component.html"
grep -q 'formControlName="entityId"' "$ROOT/src/app/activity-trail/activity-trail.component.html"
grep -q 'formControlName="username"' "$ROOT/src/app/activity-trail/activity-trail.component.html"
grep -q 'value="OPERATIONS"' "$ROOT/src/app/activity-trail/activity-trail.component.html"
grep -q 'VELOCITY' "$OPS"
grep -q 'DAILY_AMOUNT' "$OPS"
echo 'Bancro frontend Banking Controls MVP6 smoke: PASS'
