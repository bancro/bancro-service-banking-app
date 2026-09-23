#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Dore authenticated shell assets/theme.
test -s "$ROOT/src/assets/styles/_dore-bancro.scss"
grep -q 'assets/styles/dore-bancro' "$ROOT/src/main.scss"
grep -q '#mifosx-shell-container' "$ROOT/src/assets/styles/_dore-bancro.scss"
for f in nunito-300.woff2 nunito-regular.woff2 nunito-600.woff2 nunito-700.woff2; do
  test -s "$ROOT/src/assets/dore/font/nunito/$f"
done

# The normal authenticated shell is mandatory for channel screens.
for f in \
  "$ROOT/src/app/teller-workstation/teller-workstation-routing.module.ts" \
  "$ROOT/src/app/payments/payments-routing.module.ts" \
  "$ROOT/src/app/reconciliation/reconciliation-routing.module.ts" \
  "$ROOT/src/app/activity-trail/activity-trail-routing.module.ts" \
  "$ROOT/src/app/operations/operations-routing.module.ts"; do
  grep -q 'Route.withShell' "$f"
done

grep -q 'id="mifosx-shell-container"' "$ROOT/src/app/core/shell/shell.component.html"
grep -q 'Sign Out' "$ROOT/src/app/core/shell/toolbar/toolbar.component.html"
grep -q '(click)="logout()"' "$ROOT/src/app/core/shell/sidenav/sidenav.component.html"

# First-class administration areas.
grep -q "operations/:area" "$ROOT/src/app/operations/operations-routing.module.ts"
grep -q "\['/operations/transfers'\]" "$ROOT/src/app/core/shell/sidenav/sidenav.component.html"
grep -q "\['/operations/cards'\]" "$ROOT/src/app/core/shell/sidenav/sidenav.component.html"
grep -q "\['/operations/pos'\]" "$ROOT/src/app/core/shell/sidenav/sidenav.component.html"
grep -q "\['/operations/approvals'\]" "$ROOT/src/app/core/shell/sidenav/sidenav.component.html"
grep -q "\['/operations/integrations'\]" "$ROOT/src/app/core/shell/sidenav/sidenav.component.html"
grep -q 'showArea' "$ROOT/src/app/operations/operations.component.ts"
grep -q 'admin-area-grid' "$ROOT/src/app/operations/operations.component.html"

# Teller is business-facing: quick actions, no teller-facing simulator outcome selector.
grep -q 'quick-actions' "$ROOT/src/app/teller-workstation/teller-workstation.component.html"
grep -q "selectOperation('CASH_DEPOSIT')" "$ROOT/src/app/teller-workstation/teller-workstation.component.html"
grep -q "selectOperation('EXTERNAL_TRANSFER')" "$ROOT/src/app/teller-workstation/teller-workstation.component.html"
! grep -q '<mat-label>Simulator outcome</mat-label>' "$ROOT/src/app/teller-workstation/teller-workstation.component.html"
grep -q 'Training mode' "$ROOT/src/app/teller-workstation/teller-workstation.component.ts"

# Prior user-provisioning/password-route fixes remain in the checkpoint.
grep -q "navigate(\['/appusers'\]" "$ROOT/src/app/users/view-user/view-user.component.ts"
grep -q 'Email temporary password to user' "$ROOT/src/app/users/create-user/create-user.component.html"

# Login page source intentionally remains the MVP12.7 source.
echo 'f759795c6b5a7f1740d31ffedd7d12c2a58af4c584b04257065104c0fb8f4890  src/app/login/login.component.ts' | sha256sum -c - >/dev/null
echo '2af98e9dcb754894c443b34a5bdb5811e8d98d3f49e0e52abdd5627153d5c5c2  src/app/login/login.component.html' | sha256sum -c - >/dev/null
echo 'ddd1e76281b8b98142eb5b708326a4dc100236ec68630ffcf6c431dc9e288c7d  src/app/login/login.component.scss' | sha256sum -c - >/dev/null

echo 'Bancro MVP12.8 Dore Admin & Channel UX source smoke: PASS'
