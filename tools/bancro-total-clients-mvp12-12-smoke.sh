#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DASH="$ROOT/src/app/home/dashboard/dashboard.component.html"
DASH_TS="$ROOT/src/app/home/dashboard/dashboard.component.ts"
HOME_SERVICE="$ROOT/src/app/home/home.service.ts"
PKG="$ROOT/package.json"

for f in "$DASH" "$DASH_TS" "$HOME_SERVICE" "$PKG"; do
  test -f "$f" || { echo "Missing expected file: $f" >&2; exit 1; }
done

grep -q 'Total Clients' "$DASH"
! grep -q '<span class="summary-label">New Clients</span>' "$DASH"
grep -q 'getTotalClients' "$DASH_TS"
grep -q 'totalElements(responses\[0\])' "$DASH_TS"
grep -q "this.http.post('/v2/clients/search', request)" "$HOME_SERVICE"
grep -q 'Number(response.totalElements)' "$DASH_TS"
grep -q '"node": "\^24.x || \^26.x"' "$PKG"

echo 'Bancro MVP12.12 total-clients dashboard smoke: PASS'
