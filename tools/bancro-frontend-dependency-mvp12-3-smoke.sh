#!/usr/bin/env bash
set -euo pipefail
node <<'NODE'
const p=require('../package.json');
const l=require('../package-lock.json');
function fail(m){console.error(m); process.exit(1)}
if(p.dependencies?.['ng-apexcharts']) fail('ng-apexcharts must be removed from package.json');
if(l.packages?.['node_modules/ng-apexcharts']) fail('ng-apexcharts must be removed from package-lock package graph');
if(l.dependencies?.['ng-apexcharts']) fail('ng-apexcharts must be removed from package-lock dependency graph');
if(p.dependencies?.['@angular/common'] !== '14.3.0') fail('Angular common baseline changed unexpectedly');
if(!p.dependencies?.apexcharts) fail('Standalone apexcharts runtime must remain present');
if(p.engines?.node !== '^14.15.0 || ^16.10.0') fail('Angular 14 Node engine guard missing');
console.log('Bancro MVP12.3 frontend dependency compatibility smoke: PASS');
NODE
