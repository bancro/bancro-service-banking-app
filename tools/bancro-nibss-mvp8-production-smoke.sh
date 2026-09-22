#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SVC="$ROOT/src/app/operations/operations.service.ts"
COMP="$ROOT/src/app/operations/operations.component.ts"
HTML="$ROOT/src/app/operations/operations.component.html"
for f in "$SVC" "$COMP" "$HTML"; do test -f "$f"; done
grep -q 'nibssStatus' "$SVC"
grep -q 'nibssHealth' "$SVC"
grep -q 'nibssExchanges' "$SVC"
grep -q 'nibssCertification' "$SVC"
grep -q 'recordNibssCertification' "$SVC"
grep -q 'customerFeeDebitEnabled' "$COMP"
grep -q 'customerFeeChargeId' "$COMP"
grep -q 'MVP8 NIBSS / NIP Production Certification' "$HTML"
grep -q 'Recent Provider Exchanges' "$HTML"
grep -q "recordCertification(c,'PASSED')" "$HTML"
grep -q 'Debit customer fees with Fineract savings charges' "$HTML"
grep -q 'Fineract Savings Charge ID' "$HTML"
grep -q 'customer fee debit' "$HTML"
grep -q 'customer_fee_debit_enabled' "$HTML"
grep -q 'nibssLiveReady' "$HTML"
echo 'Bancro frontend NIBSS/NIP MVP8 production integration smoke: PASS'
