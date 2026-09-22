# Bancro NIBSS/NIP MVP 3 — Frontend

The teller workstation now supports an additive **External Bank Transfer (NIP)** workflow while preserving cash deposits, cash withdrawals, internal transfers, teller balancing and legacy teller/cashier administration.

## Teller workflow

1. Select **External Bank Transfer (NIP)**.
2. Look up and confirm the source Bancro savings account.
3. Select a configured destination institution.
4. Enter the beneficiary account and run **Name enquiry**.
5. Confirm the beneficiary returned by Bancro.
6. Enter amount/narration and post.
7. In SIMULATOR mode choose SUCCESS, FAILED or UNKNOWN to exercise UAT paths.
8. UNKNOWN transactions show **Requery** in Recent Transactions.
9. Successful external transfers show **Request reversal**.

The cash drawer is not changed by an external bank transfer.

## Safety semantics shown in the UI

- `FAILED`: Bancro compensates/reverses the source-account debit.
- `UNKNOWN`: the source debit remains posted until Transaction Status Query resolves the outcome.
- `SUCCESS`: the transfer is final from the teller's point of view unless provider-confirmed reversal is requested.

## Payments operations page

The Bancro Payments page now exposes configured institutions, NIBSS adapter status, Name Enquiry and NIP simulator submission/requery/reversal actions for orchestration testing.

Raw NIP instructions created on the Payments page do **not** debit customer accounts. Use the Teller Workstation for an end-to-end core debit + NIP flow.
