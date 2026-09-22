import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class OperationsService {
  private readonly base = '/bancro/operations';

  private readonly financialControlsBase = '/bancro/financial-controls';
  private readonly cardsBase = '/bancro/cards';
  constructor(private http: HttpClient) {}
  summary(): Observable<any> { return this.http.get(`${this.base}/summary`); }
  nibssStatus(): Observable<any> { return this.http.get('/bancro/payments/nibss/status'); }
  nibssHealth(): Observable<any> { return this.http.get('/bancro/payments/nibss/health'); }
  nibssExchanges(limit = 50): Observable<any> { return this.http.get('/bancro/payments/nibss/exchanges', { params: new HttpParams().set('limit', String(limit)) }); }
  nibssCertification(): Observable<any> { return this.http.get('/bancro/payments/nibss/certification'); }
  nibssInstitutions(): Observable<any> { return this.http.get('/bancro/payments/institutions'); }
  importNibssInstitutions(institutions: any[]): Observable<any> { return this.http.post('/bancro/payments/institutions/import', { institutions }); }
  recordNibssCertification(caseCode: string, status: 'PASSED' | 'FAILED' | 'PENDING', evidenceNote = ''): Observable<any> {
    return this.http.post(`/bancro/payments/nibss/certification/${caseCode}/result`, { status, evidenceNote });
  }
  npsStatus(): Observable<any> { return this.http.get('/bancro/payments/nps/status'); }
  npsHealth(): Observable<any> { return this.http.get('/bancro/payments/nps/health'); }
  npsExchanges(limit = 50): Observable<any> { return this.http.get('/bancro/payments/nps/exchanges', { params: new HttpParams().set('limit', String(limit)) }); }
  npsMessages(limit = 50): Observable<any> { return this.http.get('/bancro/payments/nps/messages', { params: new HttpParams().set('limit', String(limit)) }); }
  npsCertification(): Observable<any> { return this.http.get('/bancro/payments/nps/certification'); }
  recordNpsCertification(caseCode: string, status: 'PASSED' | 'FAILED' | 'PENDING', evidenceNote = ''): Observable<any> {
    return this.http.post(`/bancro/payments/nps/certification/${caseCode}/result`, { status, evidenceNote });
  }
  npsParticipants(): Observable<any> { return this.http.get('/bancro/payments/nps/participants'); }
  importNpsParticipants(participants: any[]): Observable<any> { return this.http.post('/bancro/payments/nps/participants/import', { participants }); }
  readiness(): Observable<any> { return this.http.get(`${this.base}/readiness`); }
  quote(payload: any): Observable<any> { return this.http.post(`${this.base}/quote`, payload); }
  policies(): Observable<any> { return this.http.get(`${this.base}/policies`); }
  savePolicy(payload: any): Observable<any> { return this.http.post(`${this.base}/policies`, payload); }
  accounting(): Observable<any> { return this.http.get(`${this.base}/accounting`); }
  saveAccounting(payload: any): Observable<any> { return this.http.post(`${this.base}/accounting`, payload); }
  approvals(status = 'PENDING'): Observable<any> { return this.http.get(`${this.base}/approvals`, { params: new HttpParams().set('status', status) }); }
  decideApproval(id: string, action: 'APPROVE' | 'REJECT', note = ''): Observable<any> { return this.http.post(`${this.base}/approvals/${id}/decision`, { action, note }); }
  alerts(status = 'OPEN'): Observable<any> { return this.http.get(`${this.base}/alerts`, { params: new HttpParams().set('status', status) }); }
  acknowledgeAlert(id: string): Observable<any> { return this.http.post(`${this.base}/alerts/${id}/acknowledge`, {}); }
  disputes(status = ''): Observable<any> { const p = status ? new HttpParams().set('status', status) : undefined; return this.http.get(`${this.base}/disputes`, { params: p }); }
  createDispute(payload: any): Observable<any> { return this.http.post(`${this.base}/disputes`, payload); }
  updateDispute(id: string, payload: any): Observable<any> { return this.http.post(`${this.base}/disputes/${id}`, payload); }
  merchants(): Observable<any> { return this.http.get(`${this.base}/merchants`); }
  createMerchant(payload: any): Observable<any> { return this.http.post(`${this.base}/merchants`, payload); }
  updateMerchant(id: string, payload: any): Observable<any> { return this.http.post(`${this.base}/merchants/${id}`, payload); }
  terminals(): Observable<any> { return this.http.get(`${this.base}/terminals`); }
  createTerminal(payload: any): Observable<any> { return this.http.post(`${this.base}/terminals`, payload); }
  updateTerminal(id: string, payload: any): Observable<any> { return this.http.post(`${this.base}/terminals/${id}`, payload); }
  tellerAccess(limit = 200): Observable<any> { return this.http.get(`${this.base}/teller-access`, { params: new HttpParams().set('limit', String(limit)) }); }
  posTransactions(): Observable<any> { return this.http.get(`${this.base}/pos-transactions`); }
  simulatePos(payload: any): Observable<any> { return this.http.post(`${this.base}/pos/simulate`, payload); }
  cards(): Observable<any> { return this.http.get(`${this.base}/cards`); }
  createCard(payload: any): Observable<any> { return this.http.post(`${this.base}/cards`, payload); }
  updateCardStatus(id: string, action: string): Observable<any> { return this.http.post(`${this.base}/cards/${id}/status`, { action }); }
  fraudRules(): Observable<any> { return this.http.get(`${this.base}/fraud-rules`); }
  saveFraudRule(payload: any): Observable<any> { return this.http.post(`${this.base}/fraud-rules`, payload); }
  outbox(status = 'PENDING'): Observable<any> { return this.http.get(`${this.base}/outbox`, { params: new HttpParams().set('status', status) }); }
  webhooks(): Observable<any> { return this.http.get(`${this.base}/webhooks`); }
  createWebhook(payload: any): Observable<any> { return this.http.post(`${this.base}/webhooks`, payload); }
  controlProfiles(): Observable<any> { return this.http.get(`${this.financialControlsBase}/profiles`); }
  saveControlProfile(payload: any): Observable<any> { return this.http.post(`${this.financialControlsBase}/profiles`, payload); }
  accountingChanges(status = 'PENDING'): Observable<any> { return this.http.get(`${this.financialControlsBase}/accounting/changes`, { params: new HttpParams().set('status', status) }); }
  requestAccountingChange(payload: any): Observable<any> { return this.http.post(`${this.financialControlsBase}/accounting/changes`, payload); }
  decideAccountingChange(id: string, action: 'APPROVE' | 'REJECT', note = ''): Observable<any> { return this.http.post(`${this.financialControlsBase}/accounting/changes/${id}/decision`, { action, note }); }
  feeJournals(limit = 100): Observable<any> { return this.http.get(`${this.financialControlsBase}/fee-journals`, { params: new HttpParams().set('limit', String(limit)) }); }
  postFeeJournal(payload: any): Observable<any> { return this.http.post(`${this.financialControlsBase}/fee-journals`, payload); }
  reverseFeeJournal(id: string, note = ''): Observable<any> { return this.http.post(`${this.financialControlsBase}/fee-journals/${id}/reverse`, { note }); }
  varianceOverrides(status = 'PENDING'): Observable<any> { return this.http.get(`${this.financialControlsBase}/variance-overrides`, { params: new HttpParams().set('status', status) }); }
  requestVarianceOverride(payload: any): Observable<any> { return this.http.post(`${this.financialControlsBase}/variance-overrides`, payload); }
  decideVarianceOverride(id: string, action: 'APPROVE' | 'REJECT', note = ''): Observable<any> { return this.http.post(`${this.financialControlsBase}/variance-overrides/${id}/decision`, { action, note }); }
  branchDay(officeId: number): Observable<any> { return this.http.get(`${this.financialControlsBase}/branches/${officeId}/business-day`); }
  closeBranch(officeId: number, note = ''): Observable<any> { return this.http.post(`${this.financialControlsBase}/branches/${officeId}/close`, { note }); }
  reopenBranch(officeId: number, reason: string): Observable<any> { return this.http.post(`${this.financialControlsBase}/branches/${officeId}/reopen`, { reason }); }

  posStatus(): Observable<any> { return this.http.get('/bancro/pos/status'); }
  posHealth(): Observable<any> { return this.http.get('/bancro/pos/health'); }
  posExchanges(limit = 50): Observable<any> { return this.http.get('/bancro/pos/exchanges', { params: new HttpParams().set('limit', String(limit)) }); }
  posCertification(): Observable<any> { return this.http.get('/bancro/pos/certification'); }
  recordPosCertification(caseCode: string, status: 'PASSED' | 'FAILED' | 'PENDING', evidenceNote = ''): Observable<any> {
    return this.http.post(`/bancro/pos/certification/${caseCode}/result`, { status, evidenceNote });
  }
  posAuthorize(payload: any, idempotencyKey: string): Observable<any> {
    return this.http.post('/bancro/pos/authorize', payload, { headers: { 'Idempotency-Key': idempotencyKey } });
  }
  posAdvice(id: string, payload: any = {}): Observable<any> { return this.http.post(`/bancro/pos/transactions/${id}/advice`, payload); }
  posReverse(id: string, payload: any = {}): Observable<any> { return this.http.post(`/bancro/pos/transactions/${id}/reverse`, payload); }
  posHeartbeat(payload: any): Observable<any> { return this.http.post('/bancro/pos/heartbeat', payload); }
  posSettlementPreview(businessDate = '', merchantId = ''): Observable<any> {
    let params = new HttpParams(); if (businessDate) params = params.set('businessDate', businessDate); if (merchantId) params = params.set('merchantId', merchantId);
    return this.http.get('/bancro/pos/settlement/preview', { params });
  }
  createPosSettlementBatch(businessDate = '', merchantId = ''): Observable<any> {
    let params = new HttpParams(); if (businessDate) params = params.set('businessDate', businessDate); if (merchantId) params = params.set('merchantId', merchantId);
    return this.http.post('/bancro/pos/settlement/batches', {}, { params });
  }
  posSettlementBatches(limit = 100): Observable<any> { return this.http.get('/bancro/pos/settlement/batches', { params: new HttpParams().set('limit', String(limit)) }); }

  cardProgramStatus(): Observable<any> { return this.http.get(`${this.cardsBase}/status`); }
  cardProcessorProfiles(): Observable<any> { return this.http.get(`${this.cardsBase}/processor-profiles`); }
  saveCardProcessorProfile(payload: any): Observable<any> { return this.http.post(`${this.cardsBase}/processor-profiles`, payload); }
  hsmProfiles(): Observable<any> { return this.http.get(`${this.cardsBase}/hsm-profiles`); }
  saveHsmProfile(payload: any): Observable<any> { return this.http.post(`${this.cardsBase}/hsm-profiles`, payload); }
  cardProducts(): Observable<any> { return this.http.get(`${this.cardsBase}/products`); }
  saveCardProduct(payload: any): Observable<any> { return this.http.post(`${this.cardsBase}/products`, payload); }
  cardLifecycle(status = 'PENDING_APPROVAL'): Observable<any> { return this.http.get(`${this.cardsBase}/lifecycle`, { params: new HttpParams().set('status', status) }); }
  requestCardLifecycle(payload: any): Observable<any> { return this.http.post(`${this.cardsBase}/lifecycle`, payload); }
  decideCardLifecycle(id: string, action: 'APPROVE' | 'REJECT', note = ''): Observable<any> { return this.http.post(`${this.cardsBase}/lifecycle/${id}/decision`, { action, note }); }
  cardProcessorExchanges(limit = 50): Observable<any> { return this.http.get(`${this.cardsBase}/processor-exchanges`, { params: new HttpParams().set('limit', String(limit)) }); }
  cardTransactions(limit = 100): Observable<any> { return this.http.get(`${this.cardsBase}/transactions`, { params: new HttpParams().set('limit', String(limit)) }); }
  cardReconciliationPreview(businessDate = '', processorCode = '', scheme = ''): Observable<any> { let params = new HttpParams(); if (businessDate) params = params.set('businessDate', businessDate); if (processorCode) params = params.set('processorCode', processorCode); if (scheme) params = params.set('scheme', scheme); return this.http.get(`${this.cardsBase}/reconciliation/preview`, { params }); }
  createCardReconciliationBatch(businessDate = '', processorCode = '', scheme = ''): Observable<any> { let params = new HttpParams(); if (businessDate) params = params.set('businessDate', businessDate); if (processorCode) params = params.set('processorCode', processorCode); if (scheme) params = params.set('scheme', scheme); return this.http.post(`${this.cardsBase}/reconciliation/batches`, {}, { params }); }
  cardReconciliationBatches(limit = 100): Observable<any> { return this.http.get(`${this.cardsBase}/reconciliation/batches`, { params: new HttpParams().set('limit', String(limit)) }); }
  cardCertification(): Observable<any> { return this.http.get(`${this.cardsBase}/certification`); }
  recordCardCertification(caseCode: string, status: 'PASSED' | 'FAILED' | 'PENDING', evidenceNote = ''): Observable<any> { return this.http.post(`${this.cardsBase}/certification/${caseCode}/result`, { status, evidenceNote }); }
  keyCeremonies(): Observable<any> { return this.http.get(`${this.cardsBase}/hsm/key-ceremonies`); }
  recordKeyCeremony(payload: any): Observable<any> { return this.http.post(`${this.cardsBase}/hsm/key-ceremonies`, payload); }

  lookup(type: string, q = '', limit = 50): Observable<any> { let params = new HttpParams().set('limit', String(limit)); if (q) params = params.set('q', q); return this.http.get(`${this.base}/lookups/${type}`, { params }); }
  integrationProfiles(): Observable<any> { return this.http.get(`${this.base}/integration-profiles`); }
  saveIntegrationProfile(rail: string, payload: any): Observable<any> { return this.http.post(`${this.base}/integration-profiles/${rail}`, payload); }
  productionReadiness(): Observable<any> { return this.http.get(`${this.base}/production-readiness`); }
  activationRequests(status = ''): Observable<any> { const params = status ? new HttpParams().set('status', status) : undefined; return this.http.get(`${this.base}/production-activations`, { params }); }
  requestActivation(rail: string, note = ''): Observable<any> { return this.http.post(`${this.base}/production-activations/${rail}`, { note }); }
  decideActivation(id: string, action: 'APPROVE' | 'REJECT', note = ''): Observable<any> { return this.http.post(`${this.base}/production-activations/requests/${id}/decision`, { action, note }); }
  updateAlert(id: string, payload: any): Observable<any> { return this.http.post(`${this.base}/alerts/${id}`, payload); }
  updateWebhook(id: string, payload: any): Observable<any> { return this.http.post(`${this.base}/webhooks/${id}`, payload); }
  webhookDeliveries(subscriptionId = '', status = ''): Observable<any> { let params = new HttpParams(); if (subscriptionId) params = params.set('subscriptionId', subscriptionId); if (status) params = params.set('status', status); return this.http.get(`${this.base}/webhook-deliveries`, { params }); }
  retryWebhookDelivery(id: string): Observable<any> { return this.http.post(`${this.base}/webhook-deliveries/${id}/retry`, {}); }
  replayOutbox(id: string): Observable<any> { return this.http.post(`${this.base}/outbox/${id}/replay`, {}); }

}
