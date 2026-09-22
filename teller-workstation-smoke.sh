#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
DIR="$ROOT/src/app/teller-workstation"
[ -f "$DIR/teller-workstation.component.ts" ]
[ -f "$DIR/teller-workstation.component.html" ]
grep -q '/bancro/teller/cash-deposit' "$DIR/teller-workstation.service.ts"
grep -q '/bancro/teller/cash-withdrawal' "$DIR/teller-workstation.service.ts"
grep -q '/bancro/teller/internal-transfer' "$DIR/teller-workstation.service.ts"
grep -q '/bancro/teller/balance' "$DIR/teller-workstation.service.ts"
grep -q 'TellerWorkstationModule' "$ROOT/src/app/app.module.ts"
grep -R -q '/teller-workstation' "$ROOT/src/app" 
echo 'Bancro teller frontend source smoke: PASS'
