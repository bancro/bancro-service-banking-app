#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SKIN="$ROOT/src/assets/styles/bancro-internal-dore.scss"
NAV="$ROOT/src/app/core/shell/sidenav/sidenav.component.html"
DASH="$ROOT/src/app/home/dashboard/dashboard.component.html"
DASH_TS="$ROOT/src/app/home/dashboard/dashboard.component.ts"
DIALOG="$ROOT/src/app/system/manage-data-tables/column-dialog/column-dialog.component.html"
PKG="$ROOT/package.json"

for f in "$SKIN" "$NAV" "$DASH" "$DASH_TS" "$DIALOG" "$PKG"; do
  test -f "$f" || { echo "Missing expected file: $f" >&2; exit 1; }
done

grep -q 'class="main-menu"' "$NAV"
grep -q 'class="sub-menu"' "$NAV"
grep -q 'report-submenu' "$NAV"
grep -q "\['/reports', 'Loan'\]" "$NAV"
grep -q "\['/xbrl'\]" "$NAV"

grep -q 'mat-horizontal-stepper-header-container' "$SKIN"
grep -q 'mat-stepper-horizontal-line' "$SKIN"
grep -q 'mat-paginator-navigation-next' "$SKIN"
grep -q 'cdk-overlay-pane .mat-dialog-container' "$SKIN"
grep -q 'mat-tab-label.mat-tab-label-active' "$SKIN"

grep -q 'dashboard-summary-grid' "$DASH"
grep -q 'New Clients' "$DASH"
grep -q 'Loans Disbursed' "$DASH"
grep -q 'Amount Collected' "$DASH"
grep -q 'Amount Disbursed' "$DASH"
grep -q 'getClientTrendsByDay' "$DASH_TS"
grep -q 'getDisbursedAmount' "$DASH_TS"

grep -q 'column-options' "$DIALOG"

grep -q '"node": "\^24.x || \^26.x"' "$PKG"

echo 'Bancro MVP12.11 Dore app-wide UI smoke: PASS'
