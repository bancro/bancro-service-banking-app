# Bancro Fixed Deposit Frontend Changes

## Purpose

This frontend update keeps the existing Fineract fixed deposit screen intact and adds Bancro-specific fixed deposit capabilities as an extension.

The existing generic endpoint still loads the normal fixed deposit account page:

```http
GET /fixeddepositaccounts/{accountId}?associations=all
```

After that succeeds, the UI calls the Bancro add-on endpoint:

```http
GET /fixeddepositaccounts/{accountId}/bancro-details
```

The Bancro endpoint drives:

- Principal amount display override/fallback
- Interest at maturity
- WHT at maturity
- Principal + interest at maturity
- Net maturity amount
- Bancro action button visibility
- Accounting status visibility

## Files Updated

```text
src/app/deposits/fixed-deposits/fixed-deposits.service.ts
src/app/deposits/fixed-deposits/fixed-deposit-account-view/fixed-deposit-account-view.component.ts
src/app/deposits/fixed-deposits/fixed-deposit-account-view/fixed-deposit-account-view.component.html
src/app/deposits/fixed-deposits/fixed-deposit-account-view/fixed-deposit-account-view.component.scss
src/app/deposits/fixed-deposits/fixed-deposit-account-view/fixed-deposits-buttons.config.ts
src/app/deposits/fixed-deposits/fixed-deposit-account-view/custom-dialogs/bancro-command-dialog/bancro-command-dialog.component.ts
src/app/deposits/fixed-deposits/fixed-deposit-account-view/custom-dialogs/bancro-command-dialog/bancro-command-dialog.component.html
src/app/external-apis/external-apis.service.ts
```

## Service Methods Added

The following methods were added to `FixedDepositsService`:

```ts
getBancroDetails(accountId: string | number)
executeBancroCommand(accountId: string | number, command: string, data: any)
getBancroAccountingMappings()
saveBancroAccountingMapping(mapping: any)
```

## Bancro Commands Supported

The UI now supports these command values:

```text
payUpfrontInterest
liquidateInterest
liquidatePrincipal
liquidatePrincipalAndInterest
topupPrincipal
changeInterestRate
postAccounting
retryAccounting
reverseBancroEvent
```

## Command Endpoint

All Bancro actions post to:

```http
POST /fixeddepositaccounts/{accountId}/bancro-command?command={command}
```

## Payload Examples

### Pay upfront interest

```json
{
  "transactionDate": "19 May 2026",
  "dateFormat": "dd MMMM yyyy",
  "locale": "en",
  "paymentTypeId": 1,
  "note": "Pay upfront interest"
}
```

### Liquidate interest/principal/top-up principal

```json
{
  "transactionDate": "19 May 2026",
  "dateFormat": "dd MMMM yyyy",
  "locale": "en",
  "amount": 500000,
  "paymentTypeId": 1,
  "note": "Top up principal"
}
```

### Liquidate principal + interest

```json
{
  "transactionDate": "19 May 2026",
  "dateFormat": "dd MMMM yyyy",
  "locale": "en",
  "principalAmount": 500000,
  "interestAmount": 25000,
  "paymentTypeId": 1,
  "note": "Liquidate principal and interest"
}
```

### Change interest rate

```json
{
  "effectiveDate": "19 May 2026",
  "dateFormat": "dd MMMM yyyy",
  "locale": "en",
  "newAnnualInterestRate": 20,
  "reason": "Approved negotiated rate"
}
```

### Accounting commands

```json
{
  "eventId": 123,
  "reason": "Reverse wrong posting"
}
```

`eventId` is required for `reverseBancroEvent`. For `postAccounting` and `retryAccounting`, it can be left blank if the backend is configured to process eligible events for the account.

## GL Mapping Endpoints

```http
GET /fixeddepositaccounts/bancro-accounting-mappings
POST /fixeddepositaccounts/bancro-accounting-mappings
```

Example save payload:

```json
{
  "eventType": "PRINCIPAL_TOPUP",
  "debitAccountId": 1,
  "creditAccountId": 2,
  "enabled": true
}
```

## UI Sequence

1. Open fixed deposit page.
2. Load generic fixed deposit account:
   `GET /fixeddepositaccounts/{accountId}?associations=all`
3. Render normal fixed deposit details.
4. Load Bancro details:
   `GET /fixeddepositaccounts/{accountId}/bancro-details`
5. Merge Bancro values into the performance section.
6. Show Bancro command buttons based on returned capability flags.
7. User executes a command using the reusable Bancro command dialog.
8. UI posts to `/bancro-command`.
9. UI reloads the page so both generic and Bancro data refresh.

## Non-breaking Behavior

If `/bancro-details` fails, the normal fixed deposit page still renders. A warning message is shown, but existing Fineract details and actions remain available.

## Template Support

A custom UI template can be uploaded later. The same data and service methods can be used to re-skin or restructure the fixed deposit page while preserving the endpoint sequence above.
