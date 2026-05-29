/** Angular Imports */
import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface BancroCommandDialogData {
  command: string;
  title: string;
  accountId: string | number;
  bancroDetails?: any;
}

/**
 * Reusable dialog for submitting Bancro commands.
 * Renders fields dynamically based on the command type and keeps the existing
 * generic fixed deposit screen non-breaking.
 */
@Component({
  selector: 'mifosx-bancro-command-dialog',
  templateUrl: './bancro-command-dialog.component.html',
  styleUrls: ['./bancro-command-dialog.component.scss']
})
export class BancroCommandDialogComponent implements OnInit {

  form: UntypedFormGroup;

  /** Pay upfront interest is calculated by the backend, so no amount is required. */
  readonly transactionWithoutAmountCommands = ['payUpfrontInterest'];

  /** Commands that need one amount value. */
  readonly transactionAmountCommands = [
    'liquidateInterest',
    'liquidatePrincipal',
    'topupPrincipal'
  ];

  /** Principal + interest liquidation needs separate principal and interest values. */
  readonly principalInterestCommands = ['liquidatePrincipalAndInterest'];

  /** Commands that use the interest-rate-change payload. */
  readonly interestRateCommands = ['changeInterestRate'];

  /** Accounting commands can optionally/mandatorily target a Bancro event id. */
  readonly accountingCommands = ['postAccounting', 'retryAccounting', 'reverseBancroEvent'];

  get isTransactionWithoutAmountCommand(): boolean {
    return this.transactionWithoutAmountCommands.includes(this.data.command);
  }

  get isTransactionAmountCommand(): boolean {
    return this.transactionAmountCommands.includes(this.data.command);
  }

  get isPrincipalInterestCommand(): boolean {
    return this.principalInterestCommands.includes(this.data.command);
  }

  get isTransactionDateCommand(): boolean {
    return this.isTransactionWithoutAmountCommand || this.isTransactionAmountCommand || this.isPrincipalInterestCommand;
  }

  get isInterestRateCommand(): boolean {
    return this.interestRateCommands.includes(this.data.command);
  }

  get isAccountingCommand(): boolean {
    return this.accountingCommands.includes(this.data.command);
  }

  get requiresEventId(): boolean {
    return this.data.command === 'reverseBancroEvent';
  }

  constructor(
    public dialogRef: MatDialogRef<BancroCommandDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: BancroCommandDialogData,
    private fb: UntypedFormBuilder
  ) {}

  ngOnInit(): void {
    if (this.isTransactionDateCommand) {
      this.form = this.fb.group({
        transactionDate: [null, Validators.required],
        amount: [null],
        principalAmount: [null],
        interestAmount: [null],
        paymentTypeId: [1],
        note: ['']
      });

      if (this.isTransactionAmountCommand) {
        this.form.get('amount').setValidators([Validators.required, Validators.min(0.01)]);
      }
      if (this.isPrincipalInterestCommand) {
        this.form.get('principalAmount').setValidators([Validators.required, Validators.min(0.01)]);
        this.form.get('interestAmount').setValidators([Validators.required, Validators.min(0.01)]);
      }
      this.form.get('amount').updateValueAndValidity();
      this.form.get('principalAmount').updateValueAndValidity();
      this.form.get('interestAmount').updateValueAndValidity();
    } else if (this.isInterestRateCommand) {
      this.form = this.fb.group({
        effectiveDate: [null, Validators.required],
        newAnnualInterestRate: [null, [Validators.required, Validators.min(0)]],
        reason: ['', Validators.required]
      });
    } else if (this.isAccountingCommand) {
      this.form = this.fb.group({
        eventId: [null, this.requiresEventId ? Validators.required : []],
        reason: ['']
      });
    } else {
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

    if (this.isTransactionDateCommand) {
      payload = {
        ...payload,
        transactionDate: this.formatDate(raw.transactionDate),
        paymentTypeId: raw.paymentTypeId || 1,
        note: raw.note
      };

      if (this.isTransactionAmountCommand) {
        payload.amount = raw.amount;
      }
      if (this.isPrincipalInterestCommand) {
        payload.principalAmount = raw.principalAmount;
        payload.interestAmount = raw.interestAmount;
      }
    } else if (this.isInterestRateCommand) {
      payload = {
        ...payload,
        effectiveDate: this.formatDate(raw.effectiveDate),
        newAnnualInterestRate: raw.newAnnualInterestRate,
        reason: raw.reason
      };
    } else if (this.isAccountingCommand) {
      if (raw.eventId) {
        payload.eventId = raw.eventId;
      }
      if (raw.reason) {
        payload.reason = raw.reason;
      }
    }

    this.dialogRef.close({ confirm: true, payload });
  }
}
