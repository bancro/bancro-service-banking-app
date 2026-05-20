/** Angular Imports */
import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface BancroCommandDialogData {
  command: string;
  title: string;
  accountId: string | number;
}

/**
 * Reusable dialog for submitting Bancro commands that require a payload.
 * Renders fields dynamically based on the command type.
 */
@Component({
  selector: 'mifosx-bancro-command-dialog',
  templateUrl: './bancro-command-dialog.component.html',
  styleUrls: ['./bancro-command-dialog.component.scss']
})
export class BancroCommandDialogComponent implements OnInit {

  form: UntypedFormGroup;

  /** Commands that use the transaction-style payload (date, amount, paymentTypeId, note) */
  readonly transactionCommands = [
    'payUpfrontInterest',
    'liquidateInterest',
    'liquidatePrincipal',
    'liquidatePrincipalAndInterest',
    'topUpPrincipal',
  ];

  /** Commands that use the interest-rate-change payload (effectiveDate, newAnnualInterestRate, reason) */
  readonly interestRateCommands = ['changeInterestRate'];

  /** Commands with no extra payload (just confirm) */
  readonly noPayloadCommands = ['postAccounting', 'retryAccounting', 'reverseBancroEvent'];

  get isTransactionCommand(): boolean {
    return this.transactionCommands.includes(this.data.command);
  }

  get isInterestRateCommand(): boolean {
    return this.interestRateCommands.includes(this.data.command);
  }

  get isNoPayloadCommand(): boolean {
    return this.noPayloadCommands.includes(this.data.command);
  }

  constructor(
    public dialogRef: MatDialogRef<BancroCommandDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: BancroCommandDialogData,
    private fb: UntypedFormBuilder
  ) {}

  ngOnInit(): void {
    if (this.isTransactionCommand) {
      this.form = this.fb.group({
        transactionDate: [null, Validators.required],
        amount: [null, [Validators.required, Validators.min(0.01)]],
        note: ['']
      });
    } else if (this.isInterestRateCommand) {
      this.form = this.fb.group({
        effectiveDate: [null, Validators.required],
        newAnnualInterestRate: [null, [Validators.required, Validators.min(0)]],
        reason: ['', Validators.required]
      });
    } else {
      // no-payload commands: empty form, just confirm
      this.form = this.fb.group({});
    }
  }

  private formatDate(date: Date): string {
    if (!date) { return ''; }
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const months = ['January','February','March','April','May','June',
                    'July','August','September','October','November','December'];
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  }

  submit(): void {
    if (this.form.invalid) { return; }

    const raw = this.form.value;
    let payload: any = {
      command: this.data.command,
      accountId: this.data.accountId,
      dateFormat: 'dd MMMM yyyy',
      locale: 'en'
    };

    if (this.isTransactionCommand) {
      payload = {
        ...payload,
        transactionDate: this.formatDate(raw.transactionDate),
        amount: raw.amount,
        paymentTypeId: 1,
        note: raw.note
      };
    } else if (this.isInterestRateCommand) {
      payload = {
        ...payload,
        effectiveDate: this.formatDate(raw.effectiveDate),
        newAnnualInterestRate: raw.newAnnualInterestRate,
        reason: raw.reason
      };
    }

    this.dialogRef.close({ confirm: true, payload });
  }
}
