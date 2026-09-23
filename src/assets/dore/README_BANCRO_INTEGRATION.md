# Bancro Dore UI integration

This folder contains the Dore visual assets reused for the authenticated Bancro application shell in MVP12.8.

The Angular application intentionally does **not** execute the original Dore jQuery/Bootstrap JavaScript bundle because Bancro is an Angular Material application and loading a second runtime UI framework would create event, layout and dependency conflicts. Instead, the Dore typography/layout language is adapted natively in Angular through `src/assets/styles/_dore-bancro.scss`, the shell, sidebar, toolbar and channel screens.

The original Dore `dore.light.bluenavy.min.css` and `main.css` are retained under `reference/` as the supplied template reference. Nunito font assets used by the authenticated shell are under `font/nunito/`.

All Dore rules are scoped to `#mifosx-shell-container`; the existing Bancro login, reset-password and two-factor pages remain unchanged.
