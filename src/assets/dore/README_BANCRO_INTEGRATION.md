# Bancro Dore UI integration — MVP12.9 full conformance

The Dore light/bluenavy template supplied by the user is the visual source of truth for the **authenticated** Bancro frontend.

## What is used verbatim

The supplied Dore reference CSS is retained byte-for-byte under `reference/`:

- `dore.light.bluenavy.min.css`
- `main.css`

The Nunito font files used by the authenticated UI are retained under `font/nunito/`.

Bancro intentionally does **not** execute the original Dore jQuery/Bootstrap JavaScript bundle. Bancro is an Angular 14 + Angular Material application; loading Dore's jQuery runtime in parallel would create conflicting DOM ownership, event handlers and component state. Instead, the Dore visual system is mapped natively to Angular Material in `src/assets/styles/_dore-bancro.scss`.

## Conformance rules

MVP12.9 applies Dore at the application-shell level rather than styling only the newer Bancro modules:

- Dore 100/90/80/70px responsive top navbar.
- Dore two-level navigation: 120px main icon rail + 230px submenu on desktop, with responsive equivalents.
- Dore light/bluenavy `#00365a` primary colour, `#f8f8f8` canvas, `#3a3a3a` text and `#8f8f8f` secondary text.
- Dore card shadow, 0.1rem panel/input radius, pill action buttons, table, tab, paginator, form, dialog, menu, select, datepicker, stepper, expansion-panel and snackbar treatment.
- A universal authenticated route frame provides consistent Dore page gutters to all routed feature views, including legacy Fineract/Mifos screens.
- Legacy `list-grid` index/menu pages (Products, Accounting, Organization, System-style menus and similar screens) are converted to Dore card tiles by the global conformance layer.
- CDK overlay content is explicitly themed, so dialogs, dropdowns and menus match the page rather than reverting to the old theme.

## Login preservation

`ShellComponent` adds `bancro-dore-authenticated` only while the authenticated shell is mounted and removes it on logout. The same class is applied to the Angular Material overlay container. Login, reset-password and two-factor routes therefore remain outside the Dore scope.

The login-source SHA-256 baseline from MVP12.8 is recorded in `docs/MVP12_9_LOGIN_PRESERVATION_SHA256.txt` and is checked by `tools/bancro-dore-ui-conformance-check.js`.
