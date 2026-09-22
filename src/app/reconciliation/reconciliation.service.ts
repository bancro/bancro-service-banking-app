import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ReconciliationService {
  constructor(private http: HttpClient) {}

  summary(fromDate: string, toDate: string, rail = 'NIP'): Observable<any> {
    let params = new HttpParams().set('fromDate', fromDate).set('toDate', toDate);
    if (rail) { params = params.set('rail', rail); }
    return this.http.get('/bancro/reconciliation/summary', { params });
  }

  batches(status = '', rail = 'NIP'): Observable<any> {
    let params = new HttpParams().set('limit', '100');
    if (status) { params = params.set('status', status); }
    if (rail) { params = params.set('rail', rail); }
    return this.http.get('/bancro/reconciliation/batches', { params });
  }

  batch(id: string): Observable<any> {
    return this.http.get(`/bancro/reconciliation/batches/${id}`);
  }

  createBatch(payload: any): Observable<any> {
    return this.http.post('/bancro/reconciliation/batches', payload);
  }

  generateSimulatorBatch(settlementDate: string, scenario = 'NORMAL', rail = 'NIP'): Observable<any> {
    return this.http.post('/bancro/reconciliation/batches/simulator', {}, {
      params: new HttpParams().set('settlementDate', settlementDate).set('scenario', scenario).set('rail', rail)
    });
  }

  reconcile(id: string): Observable<any> {
    return this.http.post(`/bancro/reconciliation/batches/${id}/reconcile`, {});
  }

  exceptions(batchId = '', resolutionStatus = 'OPEN'): Observable<any> {
    let params = new HttpParams().set('limit', '250');
    if (batchId) { params = params.set('batchId', batchId); }
    if (resolutionStatus) { params = params.set('resolutionStatus', resolutionStatus); }
    return this.http.get('/bancro/reconciliation/exceptions', { params });
  }

  resolveException(itemId: string, action: 'RESOLVE' | 'REOPEN', note?: string): Observable<any> {
    return this.http.post(`/bancro/reconciliation/exceptions/${itemId}/resolution`, { action, note });
  }
}
