#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PAY_TS="$ROOT/src/app/payments/payments.component.ts"
PAY_HTML="$ROOT/src/app/payments/payments.component.html"
PAY_SVC="$ROOT/src/app/payments/payments.service.ts"
TELLER_TS="$ROOT/src/app/teller-workstation/teller-workstation.component.ts"
TELLER_HTML="$ROOT/src/app/teller-workstation/teller-workstation.component.html"
OPS_TS="$ROOT/src/app/operations/operations.component.ts"
OPS_HTML="$ROOT/src/app/operations/operations.component.html"
OPS_SVC="$ROOT/src/app/operations/operations.service.ts"
REC_TS="$ROOT/src/app/reconciliation/reconciliation.component.ts"
REC_HTML="$ROOT/src/app/reconciliation/reconciliation.component.html"
REC_SVC="$ROOT/src/app/reconciliation/reconciliation.service.ts"
for f in "$PAY_TS" "$PAY_HTML" "$PAY_SVC" "$TELLER_TS" "$TELLER_HTML" "$OPS_TS" "$OPS_HTML" "$OPS_SVC" "$REC_TS" "$REC_HTML" "$REC_SVC"; do test -f "$f"; done

grep -q 'npsStatus' "$PAY_SVC"
grep -q 'npsParticipants' "$PAY_SVC"
grep -q 'previewNpsIso' "$PAY_SVC"
grep -q 'requestCancellation' "$PAY_SVC"
grep -q 'NPS / ISO 20022' "$PAY_HTML"
grep -q 'Preview ISO 20022' "$PAY_HTML"
grep -q 'Request cancellation' "$PAY_HTML"
grep -q 'destinationInstitutions' "$PAY_TS"

grep -q 'National Payment Stack (NPS / ISO 20022)' "$TELLER_HTML"
grep -q 'EXTERNAL_CANCELLATION' "$TELLER_TS"
grep -q 'Request cancellation' "$TELLER_HTML"

grep -q 'npsCertification' "$OPS_SVC"
grep -q 'npsMessages' "$OPS_SVC"
grep -q 'importNpsParticipants' "$OPS_SVC"
grep -q 'MVP9 NPS / ISO 20022 Integration & Certification' "$OPS_HTML"
grep -q 'Official Participant Directory' "$OPS_HTML"
grep -q 'Unresolved NPS funds' "$OPS_HTML"
grep -q 'recordNpsCertification' "$OPS_TS"
grep -q 'importNpsDirectory' "$OPS_TS"

grep -q "set('rail', rail)" "$REC_SVC"
grep -q 'supports NIP or NPS only' "$REC_TS"
grep -q 'Generate {{ rail' "$REC_HTML"

echo 'Bancro frontend NPS / ISO 20022 MVP9 smoke: PASS'
