import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ActivityTrailService {
  private readonly base = '/bancro/activity';
  constructor(private http: HttpClient) {}

  summary(): Observable<any> { return this.http.get(`${this.base}/summary`); }

  search(filter: any = {}): Observable<any> {
    let params = new HttpParams().set('limit', String(filter.limit || 150));
    ['category', 'action', 'entityType', 'entityId', 'transactionReference', 'username', 'status'].forEach(key => {
      if (filter[key]) { params = params.set(key, String(filter[key])); }
    });
    if (filter.userId) { params = params.set('userId', String(filter.userId)); }
    if (filter.mine === true) { params = params.set('mine', 'true'); }
    return this.http.get(this.base, { params });
  }
}
