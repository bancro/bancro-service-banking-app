import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { OperationsService } from './operations.service';

@Component({
  selector: 'mifosx-bancro-operations',
  templateUrl: './operations.component.html',
  styleUrls: ['./operations.component.scss']
})
export class OperationsComponent implements OnInit {
  summary: any = {};
  readiness: any = {};
  policies: any[] = [];
  approvals: any[] = [];
  alerts: any[] = [];
  disputes: any[] = [];
  accounting: any[] = [];
  merchants: any[] = [];
  terminals: any[] = [];
  outbox: any[] = [];
  webhooks: any[] = [];
  fraudRules: any[] = [];
  cards: any[] = [];
  cardProgramStatus: any = {};
  cardProcessorProfiles: any[] = [];
  hsmProfiles: any[] = [];
  cardProducts: any[] = [];
  cardLifecycleRequests: any[] = [];
  cardProcessorExchanges: any[] = [];
  cardSchemeTransactions: any[] = [];
  cardReconciliationPreviewResult: any = null;
  cardReconciliationBatches: any[] = [];
  cardCertification: any = { cases: [] };
  keyCeremonies: any[] = [];
  posTransactions: any[] = [];
  controlProfiles: any[] = [];
  accountingChanges: any[] = [];
  feeJournals: any[] = [];
  varianceOverrides: any[] = [];
  branchDay: any = null;
  nibssStatus: any = null;
  nibssHealth: any = null;
  nibssCertification: any = { cases: [] };
  nibssExchanges: any[] = [];
  nibssInstitutions: any[] = [];
  nibssDirectoryImport = '';
  npsStatus: any = null;
  npsHealth: any = null;
  npsCertification: any = { cases: [] };
  npsExchanges: any[] = [];
  npsMessages: any[] = [];
  npsParticipants: any[] = [];
  npsDirectoryImport = '';
  posStatus: any = null;
  posHealth: any = null;
  posCertification: any = { cases: [] };
  posExchanges: any[] = [];
  posSettlementBatches: any[] = [];
  posSettlementPreviewResult: any = null;
  tellerAccess: any[] = [];
  integrationProfiles: any[] = [];
  productionReadiness: any = { rails: [] };
  activationRequests: any[] = [];
  webhookDeliveries: any[] = [];
  officeOptions: any[] = [];
  tellerOptions: any[] = [];
  cashierOptions: any[] = [];
  glAccountOptions: any[] = [];
  chargeOptions: any[] = [];
  clientOptions: any[] = [];
  savingsAccountOptions: any[] = [];
  merchantOptions: any[] = [];
  selectedIntegrationRail = 'NIP';
  policyEditId = '';
  fraudEditId = '';
  merchantEditId = '';
  terminalEditId = '';
  quoteResult: any;
  error = '';
  message = '';
  activeArea = 'overview';

  private readonly areaCopy: any = {
    overview: { title: 'Administration & Channel Control', description: 'Control Bancro channels, approvals, readiness and operational exceptions from one administrative workspace.' },
    teller: { title: 'Teller Management', description: 'Prepare teller users, cashier assignments, branch access and financial controls before a teller opens a cash drawer.' },
    transfers: { title: 'Transfers & NIBSS', description: 'Manage NIBSS/NIP and NPS integration readiness, certification, directories, policies and operational status.' },
    cards: { title: 'Cards', description: 'Manage card products, processor/HSM profiles, lifecycle approvals, certification and card reconciliation.' },
    pos: { title: 'POS & Merchants', description: 'Manage merchants, terminals, PTSA/ISO 8583 readiness, POS controls and settlement preparation.' },
    approvals: { title: 'Approvals & Controls', description: 'Review maker-checker requests, transaction limits, accounting controls, teller variance and operational exceptions.' },
    integrations: { title: 'Integrations', description: 'Configure safe non-secret connection profiles and control production activation for external banking rails.' }
  };

  quoteForm: FormGroup;
  policyForm: FormGroup;
  disputeForm: FormGroup;
  merchantForm: FormGroup;
  terminalForm: FormGroup;
  posForm: FormGroup;
  fraudForm: FormGroup;
  webhookForm: FormGroup;
  cardForm: FormGroup;
  cardProcessorProfileForm: FormGroup;
  hsmProfileForm: FormGroup;
  cardProductForm: FormGroup;
  cardLifecycleForm: FormGroup;
  keyCeremonyForm: FormGroup;
  cardReconciliationForm: FormGroup;
  controlProfileForm: FormGroup;
  accountingChangeForm: FormGroup;
  feeJournalForm: FormGroup;
  varianceOverrideForm: FormGroup;
  branchControlForm: FormGroup;
  posHeartbeatForm: FormGroup;
  posSettlementForm: FormGroup;
  integrationProfileForm: FormGroup;

  constructor(private fb: FormBuilder, private service: OperationsService, private route: ActivatedRoute) {
    this.quoteForm = this.fb.group({
      rail: ['NIP', Validators.required], channel: ['TELLER', Validators.required], paymentType: ['TRANSFER', Validators.required],
      sourceAccountId: [''], amount: [null, [Validators.required, Validators.min(0.01)]]
    });
    this.policyForm = this.fb.group({
      name: ['NIP teller default', Validators.required], rail: ['NIP'], channel: ['TELLER'], paymentType: ['TRANSFER'], currencyCode: ['NGN'],
      maximumAmount: [null], dailyLimit: [null], approvalThreshold: [null], feeType: ['NONE'], feeValue: [0], enabled: [true]
    });
    this.disputeForm = this.fb.group({ transactionReference: [''], reason: ['', Validators.required], priority: ['NORMAL'], description: [''], slaHours: [48] });
    this.merchantForm = this.fb.group({ merchantCode: ['', Validators.required], name: ['', Validators.required], settlementAccountId: [''], mdrPercent: [0], status: ['ACTIVE'] });
    this.terminalForm = this.fb.group({
      terminalId: ['', Validators.required], merchantId: ['', Validators.required], serialNumber: [''], routingMode: ['DUAL', Validators.required],
      ptspCode: [''], primaryRoute: ['NIBSS', Validators.required], secondaryRoute: ['UPSL', Validators.required], activeRoute: ['NIBSS', Validators.required],
      terminalProfile: ['POS'], merchantCategoryCode: [''], latitude: [null], longitude: [null], geofenceRadiusM: [70, [Validators.required, Validators.min(1)]],
      registeredAddress: [''], certificationStatus: ['PENDING', Validators.required], status: ['ACTIVE']
    });
    this.posForm = this.fb.group({
      terminalId: ['', Validators.required], amount: [null, [Validators.required, Validators.min(0.01)]], transactionType: ['PURCHASE', Validators.required],
      currencyCode: ['NGN', Validators.required], posEntryMode: ['', Validators.required], conditionCode: ['00', Validators.required], latitude: [null], longitude: [null],
      simulationOutcome: ['APPROVED'], idempotencyKey: ['']
    });
    this.fraudForm = this.fb.group({
      name: ['High-value review', Validators.required], ruleType: ['AMOUNT_THRESHOLD', Validators.required], rail: ['NIP'], channel: ['TELLER'], paymentType: ['TRANSFER'],
      thresholdValue: [null], windowMinutes: [15], occurrenceThreshold: [5], dailyAmountThreshold: [null], action: ['REVIEW'], enabled: [true]
    });
    this.webhookForm = this.fb.group({ name: ['', Validators.required], callbackUrl: ['', Validators.required], eventTypes: ['PAYMENT_SUCCESS,PAYMENT_FAILED'] });
    this.cardForm = this.fb.group({ customerId: [''], accountId: [''], processorCode: ['SIMULATOR'], scheme: ['VERVE'], maskedPan: [''], lastFour: [''], cardType: ['DEBIT'] });
    this.cardProcessorProfileForm = this.fb.group({
      processorCode: ['SIMULATOR', Validators.required], displayName: ['Bancro Card Simulator', Validators.required], mode: ['SIMULATOR', Validators.required],
      baseUrl: [''], issuePath: [''], lifecyclePath: [''], statusPath: [''], healthPath: [''], authSecretReference: [''], clientIdReference: [''], enabled: [true]
    });
    this.hsmProfileForm = this.fb.group({
      profileCode: ['', Validators.required], providerName: ['', Validators.required], modelName: [''], integrationMode: ['PROCESSOR_MANAGED', Validators.required],
      pciApprovalReference: [''], pinKeyAlias: [''], macKeyAlias: [''], cardVerificationKeyAlias: [''], status: ['PENDING', Validators.required], enabled: [false]
    });
    this.cardProductForm = this.fb.group({
      productCode: ['', Validators.required], name: ['', Validators.required], scheme: ['VERVE', Validators.required], cardType: ['DEBIT', Validators.required],
      processorCode: ['SIMULATOR', Validators.required], hsmProfileCode: [''], currencyCode: ['NGN', Validators.required], physicalEnabled: [true], virtualEnabled: [false],
      contactlessEnabled: [true], onlineEnabled: [true], internationalEnabled: [false], defaultDailyPosLimit: [''], defaultDailyWebLimit: [''], defaultDailyAtmLimit: [''], status: ['DRAFT', Validators.required]
    });
    this.cardLifecycleForm = this.fb.group({
      requestType: ['ISSUE', Validators.required], cardId: [''], productCode: [''], customerId: [''], accountId: [''], reason: ['']
    });
    this.keyCeremonyForm = this.fb.group({
      ceremonyReference: ['', Validators.required], hsmProfileCode: [''], keyPurpose: ['PIN', Validators.required], keyAlias: ['', Validators.required],
      keyVersion: [''], kcv: [''], status: ['RECORDED'], participantsNote: [''], evidenceNote: ['']
    });
    this.cardReconciliationForm = this.fb.group({ businessDate: [''], processorCode: [''], scheme: [''] });
    this.controlProfileForm = this.fb.group({
      scopeType: ['INSTITUTION', Validators.required], scopeId: [''], currencyCode: ['NGN', Validators.required],
      maxSingleCashDeposit: [''], maxSingleCashWithdrawal: [''], maxSingleTransfer: [''], dailyCashOutLimit: [''],
      maxDrawerCash: [''], maxVaultAllocation: [''], varianceTolerance: [0], enabled: [true]
    });
    this.accountingChangeForm = this.fb.group({
      rail: ['NIP', Validators.required], outboundSuspenseGlAccountId: [''], settlementGlAccountId: [''],
      feeClearingGlAccountId: [''], feeIncomeGlAccountId: ['', Validators.required], taxIncomeGlAccountId: [''],
      exceptionSuspenseGlAccountId: [''], chargebackGlAccountId: [''], customerFeeDebitEnabled: [false], customerFeeChargeId: [''], enabled: [false]
    });
    this.feeJournalForm = this.fb.group({
      idempotencyKey: ['', Validators.required], rail: ['NIP', Validators.required], transactionReference: ['', Validators.required],
      officeId: [null, Validators.required], currencyCode: ['NGN', Validators.required], feeAmount: [null, [Validators.required, Validators.min(0.01)]], taxAmount: [0]
    });
    this.varianceOverrideForm = this.fb.group({ cashierId: [null, Validators.required], declaredCash: [null, [Validators.required, Validators.min(0)]], reason: ['', Validators.required] });
    this.branchControlForm = this.fb.group({ officeId: [null, Validators.required], note: [''] });
    this.posHeartbeatForm = this.fb.group({ terminalId: ['', Validators.required], latitude: [null], longitude: [null], simulationOutcome: ['APPROVED'] });
    this.posSettlementForm = this.fb.group({ businessDate: [''], merchantId: [''] });
    this.integrationProfileForm = this.fb.group({
      displayName: [''], mode: ['SIMULATOR', Validators.required], baseUrl: [''], secondaryBaseUrl: [''], operationPath: [''], nameEnquiryPath: [''], statusPath: [''],
      reversalPath: [''], returnPath: [''], cancellationPath: [''], advicePath: [''], networkPath: [''], healthPath: [''], institutionId: [''], secretReference: [''], clientIdReference: [''], enabled: [false]
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const requested = (params.get('area') || 'overview').toLowerCase();
      this.activeArea = this.areaCopy[requested] ? requested : 'overview';
    });
    this.refresh();
  }

  get areaTitle(): string { return this.areaCopy[this.activeArea]?.title || this.areaCopy.overview.title; }
  get areaDescription(): string { return this.areaCopy[this.activeArea]?.description || this.areaCopy.overview.description; }
  showArea(...areas: string[]): boolean { return areas.includes(this.activeArea); }

  refresh(): void {
    this.error = '';
    this.service.summary().subscribe({ next: x => this.summary = x || {}, error: e => this.fail(e, 'Unable to load operations summary') });
    this.service.readiness().subscribe({ next: x => this.readiness = x || {}, error: e => this.fail(e, 'Unable to load readiness') });
    this.service.nibssStatus().subscribe({ next: x => this.nibssStatus = x || null });
    this.service.nibssHealth().subscribe({ next: x => this.nibssHealth = x || null });
    this.service.nibssCertification().subscribe({ next: x => this.nibssCertification = x || { cases: [] } });
    this.service.nibssExchanges().subscribe({ next: x => this.nibssExchanges = x || [] });
    this.service.nibssInstitutions().subscribe({ next: x => this.nibssInstitutions = x || [] });
    this.service.npsStatus().subscribe({ next: x => this.npsStatus = x || null });
    this.service.npsHealth().subscribe({ next: x => this.npsHealth = x || null });
    this.service.npsCertification().subscribe({ next: x => this.npsCertification = x || { cases: [] } });
    this.service.npsExchanges().subscribe({ next: x => this.npsExchanges = x || [] });
    this.service.npsMessages().subscribe({ next: x => this.npsMessages = x || [] });
    this.service.npsParticipants().subscribe({ next: x => this.npsParticipants = x || [] });
    this.service.posStatus().subscribe({ next: x => this.posStatus = x || null });
    this.service.posHealth().subscribe({ next: x => this.posHealth = x || null });
    this.service.posCertification().subscribe({ next: x => this.posCertification = x || { cases: [] } });
    this.service.posExchanges().subscribe({ next: x => this.posExchanges = x || [] });
    this.service.posSettlementBatches().subscribe({ next: x => this.posSettlementBatches = x || [] });
    this.service.tellerAccess().subscribe({ next: x => this.tellerAccess = x || [] });
    this.service.policies().subscribe({ next: x => this.policies = x || [] });
    this.service.approvals().subscribe({ next: x => this.approvals = x || [] });
    this.service.alerts().subscribe({ next: x => this.alerts = x || [] });
    this.service.disputes().subscribe({ next: x => this.disputes = x || [] });
    this.service.accounting().subscribe({ next: x => this.accounting = x || [] });
    this.service.merchants().subscribe({ next: x => this.merchants = x || [] });
    this.service.terminals().subscribe({ next: x => this.terminals = x || [] });
    this.service.outbox().subscribe({ next: x => this.outbox = x || [] });
    this.service.webhooks().subscribe({ next: x => this.webhooks = x || [] });
    this.service.fraudRules().subscribe({ next: x => this.fraudRules = x || [] });
    this.service.cards().subscribe({ next: x => this.cards = x || [] });
    this.service.cardProgramStatus().subscribe({ next: x => this.cardProgramStatus = x || {} });
    this.service.cardProcessorProfiles().subscribe({ next: x => this.cardProcessorProfiles = x || [] });
    this.service.hsmProfiles().subscribe({ next: x => this.hsmProfiles = x || [] });
    this.service.cardProducts().subscribe({ next: x => this.cardProducts = x || [] });
    this.service.cardLifecycle().subscribe({ next: x => this.cardLifecycleRequests = x || [] });
    this.service.cardProcessorExchanges().subscribe({ next: x => this.cardProcessorExchanges = x || [] });
    this.service.cardTransactions().subscribe({ next: x => this.cardSchemeTransactions = x || [] });
    this.service.cardReconciliationBatches().subscribe({ next: x => this.cardReconciliationBatches = x || [] });
    this.service.cardCertification().subscribe({ next: x => this.cardCertification = x || { cases: [] } });
    this.service.keyCeremonies().subscribe({ next: x => this.keyCeremonies = x || [] });
    this.service.posTransactions().subscribe({ next: x => this.posTransactions = x || [] });
    this.service.controlProfiles().subscribe({ next: x => this.controlProfiles = x || [] });
    this.service.accountingChanges().subscribe({ next: x => this.accountingChanges = x || [] });
    this.service.feeJournals().subscribe({ next: x => this.feeJournals = x || [] });
    this.service.varianceOverrides().subscribe({ next: x => this.varianceOverrides = x || [] });
    this.service.integrationProfiles().subscribe({ next: x => { this.integrationProfiles = x || []; this.loadIntegrationProfile(this.selectedIntegrationRail); } });
    this.service.productionReadiness().subscribe({ next: x => this.productionReadiness = x || { rails: [] } });
    this.service.activationRequests().subscribe({ next: x => this.activationRequests = x || [] });
    this.service.webhookDeliveries().subscribe({ next: x => this.webhookDeliveries = x || [] });
    this.service.lookup('OFFICES').subscribe({ next: x => this.officeOptions = x || [] });
    this.service.lookup('TELLERS').subscribe({ next: x => this.tellerOptions = x || [] });
    this.service.lookup('CASHIERS').subscribe({ next: x => this.cashierOptions = x || [] });
    this.service.lookup('GL_ACCOUNTS').subscribe({ next: x => this.glAccountOptions = x || [] });
    this.service.lookup('CHARGES').subscribe({ next: x => this.chargeOptions = x || [] });
    this.service.lookup('CLIENTS').subscribe({ next: x => this.clientOptions = x || [] });
    this.service.lookup('SAVINGS_ACCOUNTS').subscribe({ next: x => this.savingsAccountOptions = x || [] });
    this.service.lookup('MERCHANTS').subscribe({ next: x => this.merchantOptions = x || [] });
  }

  quote(): void { if (this.quoteForm.invalid) return; this.service.quote(this.quoteForm.value).subscribe({ next: x => this.quoteResult = x, error: e => this.fail(e, 'Unable to quote payment') }); }
  savePolicy(): void { if (this.policyForm.invalid) return; const payload = { ...this.policyForm.value, id: this.policyEditId || undefined }; this.service.savePolicy(payload).subscribe({ next: () => { this.message = 'Payment policy saved.'; this.policyEditId=''; this.policyForm.reset({ name: 'NIP teller default', rail: 'NIP', channel: 'TELLER', paymentType: 'TRANSFER', currencyCode: 'NGN', feeType: 'NONE', feeValue: 0, enabled: true }); this.refresh(); }, error: e => this.fail(e, 'Unable to save payment policy') }); }
  editPolicy(p: any): void { this.policyEditId=p.id; this.policyForm.patchValue({ name:p.name, rail:p.rail, channel:p.channel, paymentType:p.payment_type, currencyCode:p.currency_code, maximumAmount:p.maximum_amount, dailyLimit:p.daily_limit, approvalThreshold:p.approval_threshold, feeType:p.fee_type, feeValue:p.fee_value, enabled:p.enabled }); }
  clonePolicy(p:any): void { this.policyEditId=''; this.policyForm.patchValue({ name:`${p.name} Copy`, rail:p.rail, channel:p.channel, paymentType:p.payment_type, currencyCode:p.currency_code, maximumAmount:p.maximum_amount, dailyLimit:p.daily_limit, approvalThreshold:p.approval_threshold, feeType:p.fee_type, feeValue:p.fee_value, enabled:false }); }
  approve(a: any): void { this.service.decideApproval(a.id, 'APPROVE', 'Approved from Bancro Operations').subscribe({ next: () => { this.message = 'Payment approved.'; this.refresh(); }, error: e => this.fail(e, 'Unable to approve payment') }); }
  reject(a: any): void { const note = window.prompt('Reason for rejection'); if (!note) return; this.service.decideApproval(a.id, 'REJECT', note).subscribe({ next: () => { this.message = 'Payment rejected.'; this.refresh(); }, error: e => this.fail(e, 'Unable to reject payment') }); }
  acknowledge(a: any): void { this.service.acknowledgeAlert(a.id).subscribe({ next: () => this.refresh(), error: e => this.fail(e, 'Unable to acknowledge alert') }); }
  updateAlert(a:any,status:string):void { const note = status === 'RESOLVED' ? (window.prompt('Resolution note') || '') : ''; if(status==='RESOLVED'&&!note)return; this.service.updateAlert(a.id,{status,resolutionNote:note}).subscribe({next:()=>this.refresh(),error:e=>this.fail(e,'Unable to update alert')}); }
  updateDisputeStatus(d:any,status:string):void { const note = ['RESOLVED','REJECTED','CLOSED'].includes(status) ? (window.prompt('Resolution / decision note') || '') : ''; if(['RESOLVED','REJECTED'].includes(status)&&!note)return; this.service.updateDispute(d.id,{status,resolutionNote:note}).subscribe({next:()=>this.refresh(),error:e=>this.fail(e,'Unable to update dispute')}); }
  createDispute(): void { if (this.disputeForm.invalid) return; this.service.createDispute({ ...this.disputeForm.value, channel: 'PAYMENTS' }).subscribe({ next: () => { this.message = 'Dispute case created.'; this.disputeForm.reset({ priority: 'NORMAL', slaHours: 48 }); this.refresh(); }, error: e => this.fail(e, 'Unable to create dispute') }); }

  createMerchant(): void {
    if (this.merchantForm.invalid) return;
    const request = this.merchantEditId ? this.service.updateMerchant(this.merchantEditId, this.merchantForm.value) : this.service.createMerchant(this.merchantForm.value);
    request.subscribe({ next: x => { this.message = `Merchant ${x.merchant_code || x.merchantCode} ${this.merchantEditId ? 'updated' : 'created'}.`; this.cancelMerchantEdit(); this.refresh(); }, error: e => this.fail(e, 'Unable to save merchant') });
  }
  editMerchant(m: any): void { this.merchantEditId = m.id; this.merchantForm.patchValue({ merchantCode: m.merchant_code, name: m.name, settlementAccountId: m.settlement_account_id, mdrPercent: m.mdr_percent, status: m.status || 'ACTIVE' }); }
  cancelMerchantEdit(): void { this.merchantEditId = ''; this.merchantForm.reset({ mdrPercent: 0, status: 'ACTIVE' }); }

  createTerminal(): void {
    if (this.terminalForm.invalid) return;
    const payload = this.terminalForm.value;
    const request = this.terminalEditId ? this.service.updateTerminal(this.terminalEditId, payload) : this.service.createTerminal(payload);
    request.subscribe({ next: x => { this.message = `Terminal ${x.terminal_id || x.terminalId} ${this.terminalEditId ? 'updated' : 'created'}.`; this.cancelTerminalEdit(); this.refresh(); }, error: e => this.fail(e, 'Unable to save terminal configuration') });
  }

  editTerminal(t: any): void {
    this.terminalEditId = t.id;
    this.terminalForm.patchValue({
      terminalId: t.terminal_id, merchantId: t.merchant_id, serialNumber: t.serial_number, routingMode: t.routing_mode || 'DUAL',
      ptspCode: t.ptsp_code, primaryRoute: t.ptsa_primary || t.primary_route || 'NIBSS', secondaryRoute: t.ptsa_secondary || t.secondary_route || 'UPSL',
      activeRoute: t.active_route || t.primary_route || 'NIBSS', terminalProfile: t.terminal_profile || 'POS', merchantCategoryCode: t.merchant_category_code,
      latitude: t.geo_latitude, longitude: t.geo_longitude, geofenceRadiusM: t.geofence_radius_m || 70, registeredAddress: t.registered_address,
      certificationStatus: t.certification_status || 'PENDING', status: t.status || 'ACTIVE'
    });
  }

  cancelTerminalEdit(): void {
    this.terminalEditId = '';
    this.terminalForm.reset({ routingMode: 'DUAL', primaryRoute: 'NIBSS', secondaryRoute: 'UPSL', activeRoute: 'NIBSS', terminalProfile: 'POS', geofenceRadiusM: 70, certificationStatus: 'PENDING', status: 'ACTIVE' });
  }

  processPos(): void {
    if (this.posForm.invalid) return;
    const payload = { ...this.posForm.value };
    const idempotencyKey = payload.idempotencyKey || `POS-UI-${Date.now()}`;
    delete payload.idempotencyKey;
    this.service.posAuthorize(payload, idempotencyKey).subscribe({ next: x => { this.message = `POS ${x.transaction_type || x.transactionType || 'transaction'} ${x.rrn || ''} returned ${x.status || 'submitted'}.`; this.refresh(); }, error: e => this.fail(e, 'Unable to process POS authorization') });
  }

  posAdvice(t: any): void { this.service.posAdvice(t.id, { simulationOutcome: 'APPROVED', latitude: t.geo_latitude, longitude: t.geo_longitude }).subscribe({ next: () => { this.message = `Advice sent for ${t.rrn}.`; this.refresh(); }, error: e => this.fail(e, 'Unable to send POS advice') }); }
  posReverse(t: any): void { if (!window.confirm(`Reverse POS transaction ${t.rrn}?`)) return; this.service.posReverse(t.id, { simulationOutcome: 'APPROVED', latitude: t.geo_latitude, longitude: t.geo_longitude }).subscribe({ next: () => { this.message = `Reversal processed for ${t.rrn}.`; this.refresh(); }, error: e => this.fail(e, 'Unable to reverse POS transaction') }); }
  posHeartbeat(): void { if (this.posHeartbeatForm.invalid) return; this.service.posHeartbeat(this.posHeartbeatForm.value).subscribe({ next: x => { this.message = `Terminal ${x.terminalId || ''} heartbeat returned ${x.provider?.status || 'success'}.`; this.refresh(); }, error: e => this.fail(e, 'Unable to send terminal heartbeat') }); }
  previewPosSettlement(): void { const v = this.posSettlementForm.value; this.service.posSettlementPreview(v.businessDate || '', v.merchantId || '').subscribe({ next: x => this.posSettlementPreviewResult = x, error: e => this.fail(e, 'Unable to preview POS settlement') }); }
  createPosSettlement(): void { const v = this.posSettlementForm.value; this.service.createPosSettlementBatch(v.businessDate || '', v.merchantId || '').subscribe({ next: x => { this.message = `POS settlement batch ${x.batch_reference || ''} prepared.`; this.refresh(); }, error: e => this.fail(e, 'Unable to create POS settlement batch') }); }
  recordPosCertification(item: any, status: 'PASSED' | 'FAILED' | 'PENDING'): void { const note = window.prompt('POS/PTSA certification evidence / test note', item.evidence_note || '') || ''; if (status !== 'PENDING' && !note) return; this.service.recordPosCertification(item.case_code, status, note).subscribe({ next: () => { this.message = `${item.case_code} marked ${status}.`; this.refresh(); }, error: e => this.fail(e, 'Unable to record POS/PTSA certification result') }); }

  saveFraudRule(): void { if (this.fraudForm.invalid) return; const payload={...this.fraudForm.value,id:this.fraudEditId||undefined}; this.service.saveFraudRule(payload).subscribe({ next: () => { this.message = 'Fraud/risk rule saved.'; this.fraudEditId=''; this.refresh(); }, error: e => this.fail(e, 'Unable to save fraud rule') }); }
  editFraudRule(r:any):void { this.fraudEditId=r.id; this.fraudForm.patchValue({name:r.name,ruleType:r.rule_type,rail:r.rail,channel:r.channel,paymentType:r.payment_type,thresholdValue:r.threshold_value,windowMinutes:r.window_minutes,occurrenceThreshold:r.occurrence_threshold,dailyAmountThreshold:r.daily_amount_threshold,action:r.action,enabled:r.enabled}); }
  createWebhook(): void { if (this.webhookForm.invalid) return; this.service.createWebhook(this.webhookForm.value).subscribe({ next: () => { this.message = 'Webhook subscription created.'; this.webhookForm.reset({ eventTypes: 'PAYMENT_SUCCESS,PAYMENT_FAILED' }); this.refresh(); }, error: e => this.fail(e, 'Unable to create webhook') }); }
  toggleWebhook(w:any):void { this.service.updateWebhook(w.id,{enabled:!w.enabled}).subscribe({next:()=>this.refresh(),error:e=>this.fail(e,'Unable to update webhook')}); }
  editWebhook(w:any):void { const url=window.prompt('HTTPS callback URL',w.callback_url||''); if(!url)return; this.service.updateWebhook(w.id,{callbackUrl:url,enabled:w.enabled,eventTypes:w.event_types}).subscribe({next:()=>this.refresh(),error:e=>this.fail(e,'Unable to update webhook')}); }
  retryWebhookDelivery(d:any):void { this.service.retryWebhookDelivery(d.id).subscribe({next:()=>this.refresh(),error:e=>this.fail(e,'Unable to retry webhook delivery')}); }
  replayOutbox(e:any):void { this.service.replayOutbox(e.id).subscribe({next:()=>this.refresh(),error:x=>this.fail(x,'Unable to replay outbox event')}); }
  createCard(): void { if (this.cardForm.invalid) return; this.service.createCard(this.cardForm.value).subscribe({ next: () => { this.message = 'Card record created in configured processor/simulator mode.'; this.refresh(); }, error: e => this.fail(e, 'Unable to create card record') }); }
  cardAction(card: any, action: string): void { this.service.updateCardStatus(card.id, action).subscribe({ next: () => this.refresh(), error: e => this.fail(e, 'Unable to update card status') }); }

  saveCardProcessorProfile(): void {
    if (this.cardProcessorProfileForm.invalid) return;
    this.service.saveCardProcessorProfile(this.cardProcessorProfileForm.value).subscribe({ next: () => { this.message = 'Card processor profile saved.'; this.refresh(); }, error: e => this.fail(e, 'Unable to save card processor profile') });
  }

  saveHsmProfile(): void {
    if (this.hsmProfileForm.invalid) return;
    this.service.saveHsmProfile(this.hsmProfileForm.value).subscribe({ next: () => { this.message = 'HSM profile saved. No key material is stored in Bancro.'; this.refresh(); }, error: e => this.fail(e, 'Unable to save HSM profile') });
  }

  saveCardProduct(): void {
    if (this.cardProductForm.invalid) return;
    this.service.saveCardProduct(this.cardProductForm.value).subscribe({ next: () => { this.message = 'Card product saved.'; this.refresh(); }, error: e => this.fail(e, 'Unable to save card product') });
  }

  requestCardLifecycle(): void {
    if (this.cardLifecycleForm.invalid) return;
    const v = { ...this.cardLifecycleForm.value };
    if (v.requestType === 'ISSUE') v.cardId = null;
    else { v.customerId = null; v.accountId = null; }
    this.service.requestCardLifecycle(v).subscribe({ next: () => { this.message = 'Card lifecycle request submitted for checker approval.'; this.refresh(); }, error: e => this.fail(e, 'Unable to submit card lifecycle request') });
  }

  decideCardLifecycle(item: any, action: 'APPROVE' | 'REJECT'): void {
    const note = window.prompt(action === 'APPROVE' ? 'Approval note (optional)' : 'Rejection reason', '') || '';
    if (action === 'REJECT' && !note) return;
    this.service.decideCardLifecycle(item.id, action, note).subscribe({ next: () => { this.message = `Card request ${action.toLowerCase()}d.`; this.refresh(); }, error: e => this.fail(e, 'Unable to decide card lifecycle request') });
  }

  recordCardCertification(item: any, status: 'PASSED' | 'FAILED' | 'PENDING'): void {
    const note = window.prompt('Card/processor/HSM certification evidence or test note', item.evidence_note || '') || '';
    if (status !== 'PENDING' && !note) return;
    this.service.recordCardCertification(item.case_code, status, note).subscribe({ next: () => { this.message = `${item.case_code} marked ${status}.`; this.refresh(); }, error: e => this.fail(e, 'Unable to record card certification result') });
  }

  recordKeyCeremony(): void {
    if (this.keyCeremonyForm.invalid) return;
    this.service.recordKeyCeremony(this.keyCeremonyForm.value).subscribe({ next: () => { this.message = 'HSM key ceremony evidence recorded. No clear key material was accepted.'; this.refresh(); }, error: e => this.fail(e, 'Unable to record HSM key ceremony') });
  }

  previewCardReconciliation(): void {
    const v = this.cardReconciliationForm.value;
    this.service.cardReconciliationPreview(v.businessDate || '', v.processorCode || '', v.scheme || '').subscribe({ next: x => this.cardReconciliationPreviewResult = x, error: e => this.fail(e, 'Unable to preview card processor reconciliation') });
  }

  createCardReconciliationBatch(): void {
    const v = this.cardReconciliationForm.value;
    this.service.createCardReconciliationBatch(v.businessDate || '', v.processorCode || '', v.scheme || '').subscribe({ next: x => { this.message = `Card reconciliation batch ${x.batch_reference || ''} prepared.`; this.refresh(); }, error: e => this.fail(e, 'Unable to create card processor reconciliation batch') });
  }

  saveControlProfile(): void {
    if (this.controlProfileForm.invalid) return;
    const payload = { ...this.controlProfileForm.value };
    if (payload.scopeType === 'INSTITUTION') payload.scopeId = null;
    this.service.saveControlProfile(payload).subscribe({ next: () => { this.message = 'Financial control profile saved.'; this.refresh(); }, error: e => this.fail(e, 'Unable to save financial control profile') });
  }

  requestAccountingChange(): void {
    if (this.accountingChangeForm.invalid) return;
    this.service.requestAccountingChange(this.accountingChangeForm.value).subscribe({ next: () => { this.message = 'Accounting mapping change submitted for checker approval.'; this.refresh(); }, error: e => this.fail(e, 'Unable to request accounting mapping change') });
  }

  decideAccountingChange(change: any, action: 'APPROVE' | 'REJECT'): void {
    const note = action === 'REJECT' ? (window.prompt('Reason for rejection') || '') : 'Approved from Financial Controls';
    if (action === 'REJECT' && !note) return;
    this.service.decideAccountingChange(change.id, action, note).subscribe({ next: () => { this.message = `Accounting mapping ${action.toLowerCase()}d.`; this.refresh(); }, error: e => this.fail(e, 'Unable to decide accounting mapping change') });
  }

  postFeeJournal(): void {
    if (this.feeJournalForm.invalid) return;
    this.service.postFeeJournal(this.feeJournalForm.value).subscribe({ next: x => { this.message = `Fee journal posted: ${x.journal_transaction_id || x.journalTransactionId || ''}`; this.refresh(); }, error: e => this.fail(e, 'Unable to post fee journal') });
  }

  reverseFeeJournal(journal: any): void {
    const note = window.prompt('Reversal reason') || '';
    if (!note) return;
    this.service.reverseFeeJournal(journal.id, note).subscribe({ next: () => { this.message = 'Fee journal reversed.'; this.refresh(); }, error: e => this.fail(e, 'Unable to reverse fee journal') });
  }

  requestVarianceOverride(): void {
    if (this.varianceOverrideForm.invalid) return;
    this.service.requestVarianceOverride(this.varianceOverrideForm.value).subscribe({ next: () => { this.message = 'Teller variance override requested.'; this.refresh(); }, error: e => this.fail(e, 'Unable to request teller variance override') });
  }

  decideVarianceOverride(item: any, action: 'APPROVE' | 'REJECT'): void {
    const note = action === 'REJECT' ? (window.prompt('Reason for rejection') || '') : 'Approved from Financial Controls';
    if (action === 'REJECT' && !note) return;
    this.service.decideVarianceOverride(item.id, action, note).subscribe({ next: () => { this.message = `Variance override ${action.toLowerCase()}d.`; this.refresh(); }, error: e => this.fail(e, 'Unable to decide teller variance override') });
  }

  loadBranchDay(): void {
    if (this.branchControlForm.invalid) return;
    this.service.branchDay(Number(this.branchControlForm.value.officeId)).subscribe({ next: x => this.branchDay = x, error: e => this.fail(e, 'Unable to load branch business day') });
  }

  closeBranch(): void {
    if (this.branchControlForm.invalid) return;
    const v = this.branchControlForm.value;
    this.service.closeBranch(Number(v.officeId), v.note || '').subscribe({ next: x => { this.branchDay = x; this.message = 'Branch business day closed.'; }, error: e => this.fail(e, 'Unable to close branch business day') });
  }

  reopenBranch(): void {
    if (this.branchControlForm.invalid) return;
    const reason = window.prompt('Reason for reopening branch day') || '';
    if (!reason) return;
    this.service.reopenBranch(Number(this.branchControlForm.value.officeId), reason).subscribe({ next: x => { this.branchDay = x; this.message = 'Branch business day reopened.'; }, error: e => this.fail(e, 'Unable to reopen branch business day') });
  }

  recordCertification(item: any, status: 'PASSED' | 'FAILED' | 'PENDING'): void {
    const note = window.prompt('Certification evidence / test note', item.evidence_note || '') || '';
    if (status !== 'PENDING' && !note) return;
    this.service.recordNibssCertification(item.case_code, status, note).subscribe({
      next: () => { this.message = `${item.case_code} marked ${status}.`; this.refresh(); },
      error: e => this.fail(e, 'Unable to record NIBSS certification result')
    });
  }

  importNibssDirectory(): void {
    try {
      const parsed = JSON.parse(this.nibssDirectoryImport || '[]');
      const institutions = Array.isArray(parsed) ? parsed : parsed?.institutions;
      if (!Array.isArray(institutions) || !institutions.length) { this.error = 'Paste a JSON institution array or an object containing institutions[].'; return; }
      this.service.importNibssInstitutions(institutions).subscribe({
        next: x => { this.message = `NIBSS participant directory imported: ${x.inserted || 0} inserted, ${x.updated || 0} updated.`; this.nibssDirectoryImport = ''; this.refresh(); },
        error: e => this.fail(e, 'Unable to import NIBSS participant directory')
      });
    } catch (e) { this.error = 'NIBSS participant directory must be valid JSON.'; }
  }

  recordNpsCertification(item: any, status: 'PASSED' | 'FAILED' | 'PENDING'): void {
    const note = window.prompt('NPS certification evidence / test note', item.evidenceNote || '') || '';
    if (status !== 'PENDING' && !note) return;
    this.service.recordNpsCertification(item.caseCode, status, note).subscribe({
      next: () => { this.message = `${item.caseCode} marked ${status}.`; this.refresh(); },
      error: e => this.fail(e, 'Unable to record NPS certification result')
    });
  }

  importNpsDirectory(): void {
    try {
      const parsed = JSON.parse(this.npsDirectoryImport || '[]');
      const participants = Array.isArray(parsed) ? parsed : parsed?.participants;
      if (!Array.isArray(participants) || !participants.length) { this.error = 'Paste a JSON participant array or an object containing participants[].'; return; }
      this.service.importNpsParticipants(participants).subscribe({
        next: x => { this.message = `NPS participant directory imported: ${x.inserted || 0} inserted, ${x.updated || 0} updated.`; this.npsDirectoryImport = ''; this.refresh(); },
        error: e => this.fail(e, 'Unable to import NPS participant directory')
      });
    } catch (e) { this.error = 'NPS participant directory must be valid JSON.'; }
  }

  loadIntegrationProfile(rail: string): void {
    this.selectedIntegrationRail = rail; const p = this.integrationProfiles.find(x => x.rail === rail);
    this.integrationProfileForm.reset({ displayName: p?.display_name || rail, mode: p?.mode || 'SIMULATOR', baseUrl: p?.base_url || '', secondaryBaseUrl: p?.secondary_base_url || '', operationPath: p?.operation_path || '', nameEnquiryPath: p?.name_enquiry_path || '', statusPath: p?.status_path || '', reversalPath: p?.reversal_path || '', returnPath: p?.return_path || '', cancellationPath: p?.cancellation_path || '', advicePath: p?.advice_path || '', networkPath: p?.network_path || '', healthPath: p?.health_path || '', institutionId: p?.institution_id || '', secretReference: p?.secret_reference || '', clientIdReference: p?.client_id_reference || '', enabled: !!p?.enabled });
  }
  saveIntegrationProfile(): void { if(this.integrationProfileForm.invalid)return; this.service.saveIntegrationProfile(this.selectedIntegrationRail,this.integrationProfileForm.value).subscribe({next:()=>{this.message=`${this.selectedIntegrationRail} integration profile saved.`;this.refresh();},error:e=>this.fail(e,'Unable to save integration profile')}); }
  requestProductionActivation(rail:string):void { const note=window.prompt(`Activation request note for ${rail}`,'Certification and operational readiness reviewed')||''; this.service.requestActivation(rail,note).subscribe({next:()=>{this.message=`${rail} activation submitted for checker approval.`;this.refresh();},error:e=>this.fail(e,'Unable to request production activation')}); }
  decideProductionActivation(a:any,action:'APPROVE'|'REJECT'):void { const note=window.prompt(action==='APPROVE'?'Approval note':'Rejection reason','')||''; if(action==='REJECT'&&!note)return; this.service.decideActivation(a.id,action,note).subscribe({next:()=>this.refresh(),error:e=>this.fail(e,'Unable to decide production activation')}); }
  exportCsv(name:string,rows:any[]):void { if(!rows?.length)return; const keys=Object.keys(rows[0]); const esc=(v:any)=>`"${String(v??'').replace(/"/g,'""')}"`; const csv=[keys.join(','),...rows.map(r=>keys.map(k=>esc(r[k])).join(','))].join('\n'); const blob=new Blob([csv],{type:'text/csv;charset=utf-8'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url;a.download=`${name}.csv`;a.click();URL.revokeObjectURL(url); }

  private fail(e: any, fallback: string): void { this.error = e?.error?.defaultUserMessage || e?.error?.developerMessage || e?.error?.errors?.[0]?.defaultUserMessage || e?.message || fallback; }
}
