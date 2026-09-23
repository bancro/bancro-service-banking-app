import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TellerWorkstationService } from './teller-workstation.service';
import { AuthenticationService } from '../core/authentication/authentication.service';

@Component({
  selector: 'mifosx-teller-workstation',
  templateUrl: './teller-workstation.component.html',
  styleUrls: ['./teller-workstation.component.scss']
})
export class TellerWorkstationComponent implements OnInit {
  form: FormGroup;
  balanceForm: FormGroup;
  cashControlForm: FormGroup;
  session: any;
  account: any;
  destinationAccount: any;
  receipt: any;
  nameEnquiryResult: any;
  institutions: any[] = [];
  npsParticipants: any[] = [];
  nibssStatus: any;
  npsStatus: any;
  transactions: any[] = [];
  pendingCommands: any[] = [];
  pendingCashControls: any[] = [];
  eodReport: any;
  loading = false;
  posting = false;
  enquiring = false;
  error = '';
  message = '';
  sessionUnavailable = false;
  sessionSetupMessage = '';
  private permissions: string[] = [];
  displayedColumns = ['reference', 'type', 'account', 'amount', 'status', 'created', 'actions'];

  constructor(private fb: FormBuilder, private tellerService: TellerWorkstationService, private authenticationService: AuthenticationService) {
    this.permissions = this.authenticationService.getCredentials()?.permissions || [];
    this.balanceForm = this.fb.group({
      declaredCash: [null, [Validators.required, Validators.min(0)]],
      note: ['']
    });
    this.cashControlForm = this.fb.group({
      operationType: ['ALLOCATE', Validators.required],
      amount: [null, [Validators.required, Validators.min(0.01)]],
      note: ['']
    });
    this.form = this.fb.group({
      operation: ['CASH_DEPOSIT', Validators.required],
      accountNo: ['', Validators.required],
      destinationAccountNo: [''],
      externalRail: ['NIP', Validators.required],
      destinationBankCode: [''],
      beneficiaryAccount: [''],
      beneficiaryName: [''],
      amount: [null, [Validators.required, Validators.min(0.01)]],
      paymentTypeId: [null],
      narration: [''],
      idempotencyKey: [''],
      simulationOutcome: ['SUCCESS']
    });
  }

  ngOnInit(): void {
    this.form.get('operation').valueChanges.subscribe(() => {
      this.account = null;
      this.destinationAccount = null;
      this.nameEnquiryResult = null;
      this.receipt = null;
      this.error = '';
    });
    this.form.get('destinationBankCode').valueChanges.subscribe(() => this.nameEnquiryResult = null);
    this.form.get('beneficiaryAccount').valueChanges.subscribe(() => this.nameEnquiryResult = null);
    this.form.get('externalRail').valueChanges.subscribe(() => { this.nameEnquiryResult = null; this.form.patchValue({ destinationBankCode: '', beneficiaryName: '' }, { emitEvent: false }); });
    if (this.canReadPayments()) {
      this.loadNibssReferenceData();
    }
    this.refresh();
  }

  refresh(): void {
    this.loading = true;
    this.error = '';
    this.sessionUnavailable = false;
    this.sessionSetupMessage = '';
    this.tellerService.session('NGN').subscribe({
      next: (session: any) => {
        this.session = session;
        this.sessionUnavailable = false;
        if (!this.form.get('paymentTypeId').value && session?.paymentTypes?.length) {
          this.form.patchValue({ paymentTypeId: session.paymentTypes[0].id });
        }
        this.loading = false;
        this.loadTransactions();
        this.loadControls();
        this.loadEod();
      },
      error: (e: any) => {
        this.session = null;
        this.loading = false;
        if (e?.status === 409) {
          this.sessionUnavailable = true;
          this.sessionSetupMessage = this.sessionProblemText(e);
          this.error = '';
        } else {
          this.error = this.errorText(e, 'We could not load your teller workspace. Please try again or contact a supervisor.');
        }
      }
    });
  }

  loadControls(): void {
    if (!this.hasPermission('READ_BANCRO_TELLER_CONTROL')) {
      this.pendingCommands = [];
      this.pendingCashControls = [];
      return;
    }
    this.tellerService.commands('PENDING_APPROVAL').subscribe({ next: x => this.pendingCommands = x || [], error: () => this.pendingCommands = [] });
    this.tellerService.cashControl('PENDING').subscribe({ next: x => this.pendingCashControls = x || [], error: () => this.pendingCashControls = [] });
  }

  loadEod(): void {
    if (!this.session?.cashierId) { this.eodReport = null; return; }
    this.tellerService.tellerEod(this.session.cashierId).subscribe({ next: x => this.eodReport = x, error: () => this.eodReport = null });
  }

  loadNibssReferenceData(): void {
    this.tellerService.institutions().subscribe({
      next: (x: any) => {
        this.institutions = x || [];
        if (!this.form.get('destinationBankCode').value && this.institutions.length) {
          this.form.patchValue({ destinationBankCode: this.institutions[0].institutionCode });
        }
      },
      error: () => this.institutions = []
    });
    this.tellerService.nibssStatus().subscribe({ next: x => this.nibssStatus = x, error: () => this.nibssStatus = null });
    this.tellerService.npsParticipants().subscribe({ next: x => this.npsParticipants = x || [], error: () => this.npsParticipants = [] });
    this.tellerService.npsStatus().subscribe({ next: x => this.npsStatus = x, error: () => this.npsStatus = null });
  }

  loadTransactions(): void {
    this.tellerService.transactions(50).subscribe({ next: x => this.transactions = x || [], error: () => this.transactions = [] });
  }

  lookupSource(): void {
    const accountNo = (this.form.get('accountNo').value || '').trim();
    if (!accountNo) { return; }
    this.error = '';
    this.tellerService.lookupAccount(accountNo).subscribe({
      next: x => this.account = x,
      error: e => { this.account = null; this.error = this.errorText(e, 'Account was not found.'); }
    });
  }

  lookupDestination(): void {
    const accountNo = (this.form.get('destinationAccountNo').value || '').trim();
    if (!accountNo) { return; }
    this.error = '';
    this.tellerService.lookupAccount(accountNo).subscribe({
      next: x => this.destinationAccount = x,
      error: e => { this.destinationAccount = null; this.error = this.errorText(e, 'Destination account was not found.'); }
    });
  }

  runNameEnquiry(): void {
    const bankCode = (this.form.get('destinationBankCode').value || '').trim();
    const beneficiaryAccount = (this.form.get('beneficiaryAccount').value || '').trim();
    if (!bankCode || !beneficiaryAccount) { this.error = 'Select a destination bank and enter the beneficiary account number.'; return; }
    this.enquiring = true;
    this.error = '';
    this.message = '';
    this.tellerService.nameEnquiry(bankCode, beneficiaryAccount).subscribe({
      next: x => { this.nameEnquiryResult = x; this.enquiring = false; this.message = `Beneficiary confirmed: ${x.accountName}`; },
      error: e => { this.nameEnquiryResult = null; this.enquiring = false; this.error = this.errorText(e, 'Name enquiry failed.'); }
    });
  }

  post(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const raw = this.form.value;
    const operation = raw.operation;
    if (!this.account) { this.lookupSource(); this.error = 'Confirm the customer account before posting.'; return; }
    if (!this.account.active) { this.error = 'The source/customer account is not active.'; return; }
    if (operation === 'INTERNAL_TRANSFER' && !this.destinationAccount) { this.error = 'Confirm the destination account before posting.'; return; }
    if (operation === 'INTERNAL_TRANSFER' && !this.destinationAccount.active) { this.error = 'The destination account is not active.'; return; }
    if (operation === 'EXTERNAL_TRANSFER' && raw.externalRail === 'NIP' && !this.nameEnquiryResult) { this.error = 'Perform name enquiry and confirm the beneficiary before posting the NIP transfer.'; return; }
    if (operation === 'EXTERNAL_TRANSFER' && raw.externalRail === 'NPS' && !(raw.beneficiaryName || '').trim()) { this.error = 'Enter the NPS beneficiary name before posting.'; return; }

    const key = raw.idempotencyKey || this.generatedIdempotencyKey(operation);
    const common: any = { amount: raw.amount, narration: raw.narration };
    let payload: any;
    if (operation === 'CASH_DEPOSIT' || operation === 'CASH_WITHDRAWAL') {
      payload = { ...common, accountNo: this.account.accountNo, paymentTypeId: raw.paymentTypeId };
    } else if (operation === 'INTERNAL_TRANSFER') {
      payload = { ...common, fromAccountNo: this.account.accountNo, toAccountNo: this.destinationAccount.accountNo };
    } else {
      payload = {
        ...common,
        rail: raw.externalRail,
        accountNo: this.account.accountNo,
        destinationBankCode: raw.destinationBankCode,
        destinationAccount: raw.beneficiaryAccount,
        destinationName: raw.externalRail === 'NPS' ? raw.beneficiaryName : this.nameEnquiryResult?.accountName,
        nameEnquiryReference: raw.externalRail === 'NIP' ? this.nameEnquiryResult?.enquiryReference : undefined,
        simulationOutcome: (raw.externalRail === 'NIP' ? this.nibssStatus?.mode : this.npsStatus?.mode) === 'SIMULATOR' ? raw.simulationOutcome : undefined
      };
    }

    this.posting = true;
    this.error = '';
    this.message = '';
    this.tellerService.submitCommand(operation, payload, key).subscribe({
      next: command => {
        this.posting = false;
        const status = command.status;
        if (status === 'PENDING_APPROVAL') {
          this.message = `Teller command ${command.request_reference} is pending approval by another authorised user.`;
        } else if (status === 'BLOCKED') {
          this.error = command.policy_reason || 'The teller operation was blocked by the Bancro policy/risk engine.';
        } else if (status === 'EXECUTED' && command.result_reference) {
          this.message = `Teller command ${command.request_reference} executed successfully.`;
          this.loadReceipt(command.result_reference);
        } else {
          this.message = `Teller command ${command.request_reference} status: ${status}.`;
        }
        this.form.patchValue({ amount: null, narration: '', idempotencyKey: '' });
        if (operation === 'EXTERNAL_TRANSFER') { this.nameEnquiryResult = null; }
        this.refresh();
        this.lookupSource();
        if (operation === 'INTERNAL_TRANSFER') { this.lookupDestination(); }
      },
      error: e => { this.error = this.errorText(e, 'Unable to submit teller transaction.'); this.posting = false; }
    });
  }

  decideCommand(row: any, action: 'APPROVE' | 'REJECT'): void {
    const note = action === 'REJECT' ? window.prompt('Reason for rejection') : 'Approved from Teller Workstation';
    if (action === 'REJECT' && !note) { return; }
    this.tellerService.decideCommand(row.id, action, note || '').subscribe({
      next: x => {
        this.message = `Teller command ${x.request_reference} ${x.status}.`;
        if (x.status === 'EXECUTED' && x.result_reference) { this.loadReceipt(x.result_reference); }
        this.refresh();
      },
      error: e => this.error = this.errorText(e, `Unable to ${action.toLowerCase()} teller command.`)
    });
  }

  requestCashControl(): void {
    if (this.cashControlForm.invalid || !this.session) { this.cashControlForm.markAllAsTouched(); return; }
    this.tellerService.requestCashControl({
      ...this.cashControlForm.value,
      tellerId: this.session.tellerId,
      cashierId: this.session.cashierId,
      currencyCode: this.session.currencyCode || 'NGN'
    }).subscribe({
      next: x => { this.message = `Vault cash request ${x.request_reference} submitted for dual control.`; this.cashControlForm.patchValue({ amount: null, note: '' }); this.refresh(); },
      error: e => this.error = this.errorText(e, 'Unable to submit vault cash request.')
    });
  }

  decideCashControl(row: any, action: 'APPROVE' | 'REJECT'): void {
    const note = action === 'REJECT' ? window.prompt('Reason for rejection') : 'Approved from Teller Workstation';
    if (action === 'REJECT' && !note) { return; }
    this.tellerService.decideCashControl(row.id, action, note || '').subscribe({
      next: x => { this.message = `Vault cash request ${x.request_reference} ${x.status}.`; this.refresh(); },
      error: e => this.error = this.errorText(e, `Unable to ${action.toLowerCase()} vault cash request.`)
    });
  }

  balanceDrawer(): void {
    if (this.balanceForm.invalid) { this.balanceForm.markAllAsTouched(); return; }
    this.error = '';
    this.message = '';
    this.tellerService.balanceDrawer({
      declaredCash: this.balanceForm.get('declaredCash').value,
      currencyCode: this.session?.currencyCode || 'NGN',
      note: this.balanceForm.get('note').value
    }).subscribe({
      next: x => {
        this.message = x.status === 'BALANCED' ? 'Drawer balanced successfully with no variance.' : `Drawer balance recorded with a variance of ${x.variance} ${x.currencyCode}.`;
        this.balanceForm.patchValue({ note: '' });
        this.refresh();
      },
      error: e => this.error = this.errorText(e, 'Unable to balance the teller drawer.')
    });
  }

  closeDay(): void {
    if (!this.session) { return; }
    const declared = this.balanceForm.get('declaredCash').value;
    if (declared === null || declared === undefined) { this.error = 'Enter the physical cash count before closing the teller.'; return; }
    const variance = Number(declared) - Number(this.session.drawer?.netCash || 0);
    if (!window.confirm(Math.abs(variance) > 0.000001
      ? `Drawer variance is ${variance.toFixed(2)} ${this.session.currencyCode}. Closure will succeed only after a separate supervisor variance override has been approved. Continue?`
      : 'Close this teller for the business day? This creates an immutable closure snapshot.')) { return; }
    this.tellerService.closeTeller({ cashierId: this.session.cashierId, declaredCash: declared, note: this.balanceForm.get('note').value }).subscribe({
      next: x => { this.message = `Teller closed for ${x.business_date || 'the business day'} with status ${x.status}.`; this.refresh(); },
      error: e => this.error = this.errorText(e, 'Unable to close the teller.')
    });
  }

  reverse(row: any): void {
    if (!row?.id || row.status !== 'SUCCESS' || row.transactionType === 'INTERNAL_TRANSFER' || row.transactionType === 'EXTERNAL_TRANSFER') { return; }
    if (!window.confirm(`Submit reversal of ${row.transactionReference} for policy/maker-checker evaluation?`)) { return; }
    const key = this.generatedIdempotencyKey('REVERSAL');
    this.tellerService.submitCommand('REVERSAL', { transactionId: row.id }, key).subscribe({
      next: x => {
        if (x.status === 'PENDING_APPROVAL') this.message = `Reversal command ${x.request_reference} is pending approval.`;
        else if (x.status === 'EXECUTED' && x.result_reference) { this.message = `Reversal ${x.request_reference} executed.`; this.loadReceipt(x.result_reference); }
        else this.message = `Reversal command ${x.request_reference} status: ${x.status}.`;
        this.refresh();
      },
      error: e => this.error = this.errorText(e, 'Unable to submit teller reversal.')
    });
  }

  requery(row: any): void {
    if (!row?.id || row.transactionType !== 'EXTERNAL_TRANSFER' || row.status !== 'UNKNOWN') { return; }
    this.tellerService.requeryExternalTransfer(row.id).subscribe({
      next: x => { this.receipt = x; this.message = `Transaction ${x.transactionReference} requery returned ${x.status}.`; this.refresh(); },
      error: e => this.error = this.errorText(e, 'Unable to requery external transfer.')
    });
  }

  requestExternalReversal(row: any): void {
    if (!row?.id || row.transactionType !== 'EXTERNAL_TRANSFER' || row.status !== 'SUCCESS') { return; }
    if (!window.confirm(`Submit provider-confirmed ${row.rail === 'NPS' ? 'NPS return' : 'NIP reversal'} for policy/maker-checker evaluation?`)) { return; }
    this.tellerService.submitCommand('EXTERNAL_REVERSAL', { transactionId: row.id }, this.generatedIdempotencyKey('EXTERNAL_REVERSAL')).subscribe({
      next: x => {
        if (x.status === 'PENDING_APPROVAL') this.message = `External reversal command ${x.request_reference} is pending approval.`;
        else if (x.status === 'EXECUTED' && x.result_reference) { this.message = `External reversal ${x.request_reference} executed after provider confirmation.`; this.loadReceipt(x.result_reference); }
        else this.message = `External reversal command ${x.request_reference} status: ${x.status}.`;
        this.refresh();
      },
      error: e => this.error = this.errorText(e, 'Unable to submit external transfer reversal.')
    });
  }

  requestNpsCancellation(row: any): void {
    if (!row?.id || row.rail !== 'NPS' || (row.status !== 'SUCCESS' && row.status !== 'UNKNOWN')) { return; }
    if (!window.confirm('Submit NPS cancellation/recall for policy/maker-checker evaluation?')) { return; }
    this.tellerService.submitCommand('EXTERNAL_CANCELLATION', { transactionId: row.id }, this.generatedIdempotencyKey('EXTERNAL_CANCELLATION')).subscribe({
      next: x => {
        if (x.status === 'PENDING_APPROVAL') this.message = `NPS cancellation command ${x.request_reference} is pending approval.`;
        else if (x.status === 'EXECUTED' && x.result_reference) { this.message = `NPS cancellation ${x.request_reference} executed after provider confirmation.`; this.loadReceipt(x.result_reference); }
        else this.message = `NPS cancellation command ${x.request_reference} status: ${x.status}.`;
        this.refresh();
      },
      error: e => this.error = this.errorText(e, 'Unable to submit NPS cancellation.')
    });
  }

  loadReceipt(reference: string): void {
    this.tellerService.receipt(reference).subscribe({ next: x => this.receipt = x, error: () => undefined });
  }

  printReceipt(): void {
    if (!this.receipt?.transactionReference) { return; }
    this.tellerService.printReceipt(this.receipt.transactionReference).subscribe({
      next: x => {
        this.receipt = x;
        this.message = x.reprint ? `Receipt reprint #${x.receiptPrintCount} recorded in the activity trail.` : 'Original receipt print recorded in the activity trail.';
        setTimeout(() => window.print(), 0);
      },
      error: e => this.error = this.errorText(e, 'Unable to record receipt printing.')
    });
  }

  isInternalTransfer(): boolean { return this.form.get('operation').value === 'INTERNAL_TRANSFER'; }
  isExternalTransfer(): boolean { return this.form.get('operation').value === 'EXTERNAL_TRANSFER'; }
  isNpsExternal(): boolean { return this.isExternalTransfer() && this.form.get('externalRail').value === 'NPS'; }
  externalInstitutions(): any[] { return this.isNpsExternal() ? this.npsParticipants.map(x => ({ institutionCode: x.participantCode, institutionName: x.participantName })) : this.institutions; }
  externalMode(): any { return this.isNpsExternal() ? this.npsStatus : this.nibssStatus; }
  isCashOperation(): boolean { return ['CASH_DEPOSIT', 'CASH_WITHDRAWAL'].includes(this.form.get('operation').value); }


  hasPermission(permission: string): boolean {
    return this.permissions.includes('ALL_FUNCTIONS') || this.permissions.includes(permission);
  }

  canReadPayments(): boolean {
    return this.hasPermission('READ_BANCRO_PAYMENT');
  }

  externalConnectionLabel(): string {
    const modes = [this.nibssStatus?.mode, this.npsStatus?.mode].filter(Boolean);
    if (!modes.length) { return 'Not configured'; }
    return modes.every(x => x === 'SIMULATOR') ? 'Test mode' : 'Connected';
  }

  private sessionProblemText(e: any): string {
    const raw = this.errorText(e, 'No active cashier assignment is available.');
    if (/not linked to a staff record/i.test(raw)) {
      return 'Your login is not linked to a staff profile. A supervisor or administrator must link this user to the correct staff record before teller transactions can be posted.';
    }
    if (/no active cashier assignment/i.test(raw)) {
      return 'You are signed in successfully, but there is no active cashier assignment for your shift. Ask a supervisor to assign you to a teller/cashier for today and allocate your opening cash.';
    }
    return 'Your teller access is valid, but your cash-drawer setup is not ready for the current business day. Ask a supervisor to confirm your staff link, cashier assignment and opening cash allocation.';
  }

  private generatedIdempotencyKey(operation: string): string {
    return `TELLER-${operation}-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
  }

  private errorText(e: any, fallback: string): string {
    return e?.error?.defaultUserMessage || e?.error?.developerMessage || e?.error?.errors?.[0]?.defaultUserMessage || e?.message || fallback;
  }
}
