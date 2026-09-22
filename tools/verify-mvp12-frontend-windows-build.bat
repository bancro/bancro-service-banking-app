@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0\.."

echo ============================================================
echo Bancro MVP12.3 Frontend Dependency and Production Build Check
echo ============================================================
where node >nul 2>&1 || (echo ERROR: node.exe was not found on PATH.& exit /b 1)
where npm >nul 2>&1 || (echo ERROR: npm.cmd was not found on PATH.& exit /b 1)

node -e "const v=process.versions.node; const m=+v.split('.')[0]; console.log('Node '+v); if(m!==16){console.error('ERROR: Bancro is Angular 14.3. Use Node 16.x (recommended 16.20.2) for this build.'); process.exit(2)}"
if errorlevel 1 exit /b %errorlevel%

call npm --version
if errorlevel 1 exit /b %errorlevel%

echo [1/4] Verify dependency manifest no longer contains unused ng-apexcharts...
node -e "const p=require('./package.json'); if(p.dependencies && p.dependencies['ng-apexcharts']){throw new Error('ng-apexcharts must not be present');} console.log('OK: ng-apexcharts removed; apexcharts='+p.dependencies.apexcharts);"
if errorlevel 1 exit /b %errorlevel%

echo [2/4] Clean installed dependencies...
if exist node_modules rmdir /s /q node_modules

echo [3/4] Reproducible npm install from package-lock.json...
call npm ci
if errorlevel 1 exit /b %errorlevel%

echo [4/4] Angular production build...
call npm run build:prod
if errorlevel 1 exit /b %errorlevel%

echo.
echo SUCCESS: Bancro frontend npm CI and production build completed.
exit /b 0
