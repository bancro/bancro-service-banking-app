#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OPS="$ROOT/src/app/operations/operations.component.ts"
HTML="$ROOT/src/app/operations/operations.component.html"
SERVICE="$ROOT/src/app/operations/operations.service.ts"
for f in "$OPS" "$HTML" "$SERVICE"; do test -s "$f"; done
grep -q 'MVP11 Card Processor / Scheme / HSM Administration' "$HTML"
grep -q 'Card Lifecycle Maker / Checker' "$HTML"
grep -q 'HSM Key Ceremony Evidence' "$HTML"
grep -q 'Card Processor / Scheme Reconciliation' "$HTML"
grep -q 'Legacy Card Simulator (UAT only)' "$HTML"
grep -q 'READ_BANCRO_CARDS' "$HTML"
grep -q 'cardProgramStatus()' "$SERVICE"
grep -q 'saveCardProcessorProfile' "$SERVICE"
grep -q 'requestCardLifecycle' "$SERVICE"
grep -q 'recordCardCertification' "$SERVICE"
grep -q 'recordKeyCeremony' "$SERVICE"
grep -q 'cardReconciliationPreview' "$SERVICE"
grep -q 'decideCardLifecycle' "$OPS"
grep -q 'No clear key material was accepted' "$OPS"
echo 'Bancro Cards/HSM MVP11 frontend smoke: PASS'
