import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TellerWorkstationService {
  constructor(private http: HttpClient) {}

  session(currencyCode: string = 'NGN'): Observable<any> {
    return this.http.get('/bancro/teller/session', { params: new HttpParams().set('currencyCode', currencyCode) });
  }

  lookupAccount(accountNo: string): Observable<any> {
    return this.http.get('/bancro/teller/accounts/lookup', { params: new HttpParams().set('accountNo', accountNo) });
  }

  transactions(limit: number = 50): Observable<any> {
    return this.http.get('/bancro/teller/transactions', { params: new HttpParams().set('limit', String(limit)) });
  }

  institutions(): Observable<any> {
    return this.http.get('/bancro/payments/institutions');
  }

  nibssStatus(): Observable<any> { return this.http.get('/bancro/payments/nibss/status'); }
  npsStatus(): Observable<any> { return this.http.get('/bancro/payments/nps/status'); }
  npsParticipants(): Observable<any> { return this.http.get('/bancro/payments/nps/participants'); }

  nameEnquiry(bankCode: string, accountNumber: string): Observable<any> {
    return this.http.post('/bancro/payments/name-enquiry', { bankCode, accountNumber });
  }

  cashDeposit(payload: any, idempotencyKey?: string): Observable<any> {
    return this.http.post('/bancro/teller/cash-deposit', payload, { headers: this.headers(idempotencyKey) });
  }

  cashWithdrawal(payload: any, idempotencyKey?: string): Observable<any> {
    return this.http.post('/bancro/teller/cash-withdrawal', payload, { headers: this.headers(idempotencyKey) });
  }

  internalTransfer(payload: any, idempotencyKey?: string): Observable<any> {
    return this.http.post('/bancro/teller/internal-transfer', payload, { headers: this.headers(idempotencyKey) });
  }

  externalTransfer(payload: any, idempotencyKey?: string): Observable<any> {
    return this.http.post('/bancro/teller/external-transfer', payload, { headers: this.headers(idempotencyKey) });
  }

  requeryExternalTransfer(transactionId: string): Observable<any> {
    return this.http.post(`/bancro/teller/transactions/${transactionId}/requery`, {});
  }

  requestExternalReversal(transactionId: string): Observable<any> {
    return this.http.post(`/bancro/teller/transactions/${transactionId}/request-reversal`, {});
  }

  requestNpsCancellation(transactionId: string): Observable<any> {
    return this.http.post(`/bancro/teller/transactions/${transactionId}/request-cancellation`, {});
  }

  balanceDrawer(payload: any): Observable<any> {
    return this.http.post('/bancro/teller/balance', payload);
  }

  closeTeller(payload: any): Observable<any> {
    return this.http.post('/bancro/operations/teller/close', payload);
  }

  reverse(transactionId: string): Observable<any> {
    return this.http.post(`/bancro/teller/transactions/${transactionId}/reverse`, {});
  }

  receipt(reference: string): Observable<any> {
    return this.http.get(`/bancro/teller/receipts/${encodeURIComponent(reference)}`);
  }


  commands(status: string = ''): Observable<any> {
    const params = status ? new HttpParams().set('status', status).set('limit', '100') : new HttpParams().set('limit', '100');
    return this.http.get('/bancro/teller/commands', { params });
  }

  submitCommand(operationType: string, payload: any, idempotencyKey?: string): Observable<any> {
    return this.http.post(`/bancro/teller/commands/${encodeURIComponent(operationType)}`, payload, { headers: this.headers(idempotencyKey) });
  }

  decideCommand(commandId: string, action: 'APPROVE' | 'REJECT', note: string = ''): Observable<any> {
    return this.http.post(`/bancro/teller/commands/${encodeURIComponent(commandId)}/decision`, { action, note });
  }

  cashControl(status: string = ''): Observable<any> {
    const params = status ? new HttpParams().set('status', status).set('limit', '100') : new HttpParams().set('limit', '100');
    return this.http.get('/bancro/teller/cash-control', { params });
  }

  requestCashControl(payload: any): Observable<any> {
    return this.http.post('/bancro/teller/cash-control', payload);
  }

  decideCashControl(requestId: string, action: 'APPROVE' | 'REJECT', note: string = ''): Observable<any> {
    return this.http.post(`/bancro/teller/cash-control/${encodeURIComponent(requestId)}/decision`, { action, note });
  }

  tellerEod(cashierId: number, businessDate?: string): Observable<any> {
    let params = new HttpParams().set('cashierId', String(cashierId));
    if (businessDate) { params = params.set('businessDate', businessDate); }
    return this.http.get('/bancro/operations/teller/eod', { params });
  }

  printReceipt(reference: string): Observable<any> {
    return this.http.post(`/bancro/teller/receipts/${encodeURIComponent(reference)}/print`, {});
  }

  private headers(idempotencyKey?: string): HttpHeaders | undefined {
    return idempotencyKey ? new HttpHeaders().set('Idempotency-Key', idempotencyKey) : undefined;
  }
}
