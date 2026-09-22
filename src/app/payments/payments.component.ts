import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PaymentsService } from './payments.service';

@Component({ selector: 'mifosx-payments', templateUrl: './payments.component.html', styleUrls: ['./payments.component.scss'] })
export class PaymentsComponent implements OnInit {
  form: FormGroup;
  payments: any[] = [];
  providers: any[] = [];
  institutions: any[] = [];
  npsParticipants: any[] = [];
  nibssStatus: any;
  npsStatus: any;
  isoPreview: any;
  nameEnquiryResult: any;
  loading = false;
  enquiring = false;
  error = '';
  message = '';
  statusFilter = '';
  railFilter = '';
  displayedColumns = ['reference','rail','destination','amount','status','settlement','provider','created','actions'];

  constructor(private fb: FormBuilder, private service: PaymentsService) {
    this.form = this.fb.group({
      sourceAccountId: [''], destinationBankCode: [''], destinationAccount: ['', Validators.required],
      destinationName: [''], nameEnquiryReference: [''], amount: [null, [Validators.required, Validators.min(0.01)]],
      currencyCode: ['NGN', Validators.required], rail: ['SIMULATOR', Validators.required], channel: ['API', Validators.required],
      narration: [''], idempotencyKey: [''], simulationOutcome: ['SUCCESS']
    });
  }

  ngOnInit() {
    this.load();
    this.service.providers().subscribe((x: any) => this.providers = x || []);
    this.service.institutions().subscribe((x: any) => {
      this.institutions = x || [];
      if (this.institutions.length && !this.form.get('destinationBankCode').value) {
        this.form.patchValue({ destinationBankCode: this.institutions[0].institutionCode });
      }
    });
    this.service.nibssStatus().subscribe((x: any) => this.nibssStatus = x);
    this.service.npsStatus().subscribe((x: any) => this.npsStatus = x);
    this.service.npsParticipants().subscribe((x: any) => this.npsParticipants = x || []);
    this.form.get('destinationBankCode').valueChanges.subscribe(() => this.resetNameEnquiry());
    this.form.get('destinationAccount').valueChanges.subscribe(() => this.resetNameEnquiry());
    this.form.get('rail').valueChanges.subscribe(() => this.resetNameEnquiry());
  }

  load() {
    this.loading = true; this.error = '';
    this.service.list(this.statusFilter, this.railFilter).subscribe({
      next: (x: any) => { this.payments = x || []; this.loading = false; },
      error: e => { this.error = this.errorText(e, 'Unable to load payments'); this.loading = false; }
    });
  }

  nameEnquiry() {
    const bankCode = (this.form.get('destinationBankCode').value || '').trim();
    const accountNumber = (this.form.get('destinationAccount').value || '').trim();
    if (!bankCode || !accountNumber) { this.error = 'Enter the destination bank and account first.'; return; }
    this.enquiring = true; this.error = ''; this.message = '';
    this.service.nameEnquiry(bankCode, accountNumber).subscribe({
      next: (x: any) => {
        this.nameEnquiryResult = x;
        this.form.patchValue({ destinationName: x.accountName, nameEnquiryReference: x.enquiryReference });
        this.enquiring = false;
        this.message = `Beneficiary confirmed: ${x.accountName}`;
      },
      error: e => { this.enquiring = false; this.error = this.errorText(e, 'Name enquiry failed'); }
    });
  }

  create() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const raw = { ...this.form.value };
    const key = raw.idempotencyKey;
    delete raw.idempotencyKey;
    delete raw.simulationOutcome;
    if (!raw.sourceAccountId) { delete raw.sourceAccountId; }
    if (raw.rail === 'NIP' && !this.nameEnquiryResult) { this.error = 'Perform name enquiry before creating a NIP instruction.'; return; }
    if (raw.rail === 'NPS' && !raw.destinationBankCode) { this.error = 'Select an NPS participant before creating the instruction.'; return; }
    if (raw.rail === 'NPS' && !(raw.destinationName || '').trim()) { this.error = 'Enter the NPS beneficiary name.'; return; }
    this.service.create(raw, key).subscribe({
      next: (x: any) => { this.message = `Payment instruction ${x.transactionReference} created.`; this.load(); },
      error: e => this.error = this.errorText(e, 'Unable to create payment')
    });
  }

  submit(p: any) {
    const mode = p.rail === 'NPS' ? this.npsStatus?.mode : this.nibssStatus?.mode;
    const outcome = mode === 'SIMULATOR' ? this.form.get('simulationOutcome').value : undefined;
    this.service.submit(p.id, outcome).subscribe({ next: () => this.load(), error: e => this.error = this.errorText(e, `${p.rail} submit failed`) });
  }

  requery(p: any) { this.service.requery(p.id).subscribe({ next: () => this.load(), error: e => this.error = this.errorText(e, 'Requery failed') }); }
  requestReversal(p: any) { this.service.requestReversal(p.id).subscribe({ next: () => this.load(), error: e => this.error = this.errorText(e, 'Reversal request failed') }); }
  simulate(p: any, outcome: string) { this.service.simulate(p.id, outcome).subscribe({ next: () => this.load(), error: e => this.error = this.errorText(e, 'Simulation failed') }); }
  reverse(p: any) { this.service.reverse(p.id).subscribe({ next: () => this.load(), error: e => this.error = this.errorText(e, 'Reversal failed') }); }

  isNip(): boolean { return this.form.get('rail').value === 'NIP'; }
  isNps(): boolean { return this.form.get('rail').value === 'NPS'; }
  destinationInstitutions(): any[] { return this.isNps() ? this.npsParticipants.map(x => ({ institutionCode: x.participantCode, institutionName: x.participantName })) : this.institutions; }
  previewIso(p: any): void { this.service.previewNpsIso(p.id).subscribe({ next: x => this.isoPreview = x, error: e => this.error = this.errorText(e, 'Unable to preview ISO 20022 message') }); }
  requestCancellation(p: any): void { const reason = window.prompt('NPS cancellation/recall reason') || ''; if (!reason) return; this.service.requestCancellation(p.id, reason).subscribe({ next: () => this.load(), error: e => this.error = this.errorText(e, 'NPS cancellation failed') }); }

  private resetNameEnquiry(): void {
    this.nameEnquiryResult = null;
    this.form.patchValue({ nameEnquiryReference: '' }, { emitEvent: false });
  }

  private errorText(e: any, fallback: string): string {
    return e?.error?.defaultUserMessage || e?.error?.developerMessage || e?.error?.errors?.[0]?.defaultUserMessage || e?.message || fallback;
  }
}
