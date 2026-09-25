#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ROOT="$ROOT" node <<'NODE'
const path = require('path');
const root = process.env.ROOT;
const p = require(path.join(root, 'package.json'));
const l = require(path.join(root, 'package-lock.json'));
function fail(m){console.error(m); process.exit(1)}
if(p.dependencies?.['ng-apexcharts']) fail('ng-apexcharts must be removed from package.json');
if(l.packages?.['node_modules/ng-apexcharts']) fail('ng-apexcharts must be removed from package-lock package graph');
if(l.dependencies?.['ng-apexcharts']) fail('ng-apexcharts must be removed from package-lock dependency graph');
if(p.dependencies?.['@angular/common'] !== '14.3.0') fail('Angular common baseline changed unexpectedly');
if(!p.dependencies?.apexcharts) fail('Standalone apexcharts runtime must remain present');
if(p.engines?.node !== '^24.x || ^26.x') fail('Bancro Node 24/26 engine policy missing');
console.log('Bancro MVP12.3 frontend dependency compatibility smoke: PASS');
NODE
