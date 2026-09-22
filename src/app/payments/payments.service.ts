import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PaymentsService {
  constructor(private http: HttpClient) {}

  list(status?: string, rail?: string): Observable<any> {
    let params = new HttpParams().set('limit', '100');
    if (status) { params = params.set('status', status); }
    if (rail) { params = params.set('rail', rail); }
    return this.http.get('/bancro/payments', { params });
  }

  providers(): Observable<any> { return this.http.get('/bancro/payments/providers'); }
  institutions(): Observable<any> { return this.http.get('/bancro/payments/institutions'); }
  nibssStatus(): Observable<any> { return this.http.get('/bancro/payments/nibss/status'); }
  npsStatus(): Observable<any> { return this.http.get('/bancro/payments/nps/status'); }
  npsParticipants(): Observable<any> { return this.http.get('/bancro/payments/nps/participants'); }
  previewNpsIso(id: string): Observable<any> { return this.http.get(`/bancro/payments/nps/${id}/iso20022/preview`); }
  nameEnquiry(bankCode: string, accountNumber: string): Observable<any> {
    return this.http.post('/bancro/payments/name-enquiry', { bankCode, accountNumber });
  }

  create(payload: any, idempotencyKey: string): Observable<any> {
    const headers = idempotencyKey ? new HttpHeaders().set('Idempotency-Key', idempotencyKey) : undefined;
    return this.http.post('/bancro/payments', payload, { headers });
  }

  submit(id: string, simulationOutcome?: string): Observable<any> {
    let params = new HttpParams();
    if (simulationOutcome) { params = params.set('simulationOutcome', simulationOutcome); }
    return this.http.post(`/bancro/payments/${id}/submit`, {}, { params });
  }

  requery(id: string): Observable<any> { return this.http.post(`/bancro/payments/${id}/requery`, {}); }
  requestReversal(id: string): Observable<any> { return this.http.post(`/bancro/payments/${id}/request-reversal`, {}); }
  requestCancellation(id: string, reason = 'Operator cancellation/recall request'): Observable<any> { return this.http.post(`/bancro/payments/${id}/request-cancellation`, { reason }); }
  simulate(id: string, outcome: string): Observable<any> {
    return this.http.post(`/bancro/payments/${id}/simulate`, {}, { params: new HttpParams().set('outcome', outcome) });
  }
  reverse(id: string): Observable<any> { return this.http.post(`/bancro/payments/${id}/reverse`, {}); }
}
