/** Angular Imports */
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

/** rxjs Imports */
import { Observable } from 'rxjs';

/**
 * Fixed Deposits Service.
 */
@Injectable({
  providedIn: 'root'
})
export class FixedDepositsService {

  /**
   * @param {HttpClient} http HttpClient
   */
  constructor(private http: HttpClient) {}

  /**
   * @param accountId Account Id.
   * @returns {Observable<any>} Fixed Deposits data.
   */
  getFixedDepositsAccountData(accountId: string): Observable<any> {
    const httpParams = new HttpParams().set('associations', 'all');
    return this.http.get(`/fixeddepositaccounts/${accountId}`, { params: httpParams });
  }

  /**
   * @param {string} accountId fixed deposits account Id
   * @returns {Observable<any>}
   */
  deleteFixedDepositsAccount(accountId: string): Observable<any> {
    return this.http.delete(`/fixeddepositaccounts/${accountId}`);
  }

  /**
   * @param {string} accountId Account Id
   * @param {string} command Command
   * @param {any} data Data
   * @returns {Observable<any>}
   */
  executeFixedDepositsAccountCommand(accountId: string, command: string, data: any): Observable<any> {
    const httpParams = new HttpParams().set('command', command);
    return this.http.post(`/fixeddepositaccounts/${accountId}`, data, { params: httpParams });
  }

  /**
   * @param {string} accountId Fixed Deposits Account Id
   * @param {string} transactionId Transaction Id
   * @returns {Observable<any>}
   */
  getFixedDepositsAccountTransaction(accountId: string, transactionId: string): Observable<any> {
    return this.http.get(`/fixeddepositaccounts/${accountId}/transactions/${transactionId}`);
  }

  /**
   * @param {string} accountId Fixed Deposits Account Id
   * @param {string} command Command
   * @param {any} data Data
   * @param {string} transactionId Transaction Id
   * @returns {Observable<any>}
   */
  executeFixedDepositsAccountTransactionsCommand(accountId: string, command: string, data: any, transactionId?: any): Observable<any> {
    const httpParams = new HttpParams().set('command', command);
    return this.http.post(`/fixeddepositaccounts/${accountId}/transactions/${transactionId}`, data, { params: httpParams });
  }

  /**
   * @param {string} accountId Fixed Deposits Account Id
   * @returns {Observable<any>}
   */
  getFixedDepositsAccountClosureTemplate(accountId: string): Observable<any> {
    const httpParams = new HttpParams().set('command', 'close');
    return this.http.get(`/fixeddepositaccounts/${accountId}/template`, { params: httpParams });
  }

  /**
   * @param clientId Client Id assosciated with fixed deposits account.
   * @returns {Observable<any>} Fixed Deposits account template.
   */
  getFixedDepositsAccountTemplate(clientId: string, productId?: string): Observable<any> {
    let httpParams = new HttpParams().set('clientId', clientId);
    httpParams = productId ? httpParams.set('productId', productId) : httpParams;
    return this.http.get('/fixeddepositaccounts/template', { params: httpParams });
  }

  /**
   * @param {string} accountId Fixed Deposits Account Id
   * @returns {Observable<any>}
   */
  getFixedDepositsAccountAndTemplate(accountId: any) {
    const httpParams = new HttpParams().set('associations', 'charges,+linkedAccount')
      .set('template', 'true');
    return this.http.get(`/fixeddepositaccounts/${accountId}`, { params: httpParams });
  }

  /**
   * @param fixedDepositAccount Fixed Deposit Account
   * @returns {Observable<any>}
   */
  createFixedDepositAccount(fixedDepositAccount: any): Observable<any> {
    return this.http.post(`/fixeddepositaccounts`, fixedDepositAccount);
  }

  /**
   * @param {any} accountId Account Id
   * @param {any} fixedDepositAccount Fixed Deposit Account
   * @returns {Observable<any>}
   */
  updateFixedDepositAccount(accountId: any, fixedDepositAccount: any): Observable<any> {
    return this.http.put(`/fixeddepositaccounts/${accountId}`, fixedDepositAccount);
  }

  /**
   * @param clientId Client Id
   * @param clientName Client Name
   * @param fromAccountId Account Id
   * @param locale Locale
   * @param dateFormat Date Format
   * @returns {Observable<any>} Standing Instructions
   */
  getStandingInstructions(
    clientId: string, clientName: string, fromAccountId: string,
    locale: string, dateFormat: string): Observable<any> {
    const httpParams = new HttpParams()
      .set('clientId', clientId)
      .set('clientName', clientName)
      .set('fromAccountId', fromAccountId)
      .set('fromAccountType', '2')
      .set('locale', locale)
      .set('dateFormat', dateFormat);
    return this.http.get(`/standinginstructions`, { params: httpParams });
  }


  /**
   * Retrieves Bancro-specific fixed deposit maturity, capability, event, and accounting details.
   * This call is additive and should be made after the generic fixed deposit account endpoint loads.
   * @param accountId Fixed Deposit Account Id.
   */
  getBancroDetails(accountId: string | number): Observable<any> {
    return this.http.get(`/fixeddepositaccounts/${accountId}/bancro-details`);
  }

  /**
   * Executes a Bancro fixed deposit command such as topupPrincipal, liquidateInterest,
   * changeInterestRate, postAccounting, retryAccounting, or reverseBancroEvent.
   * @param accountId Fixed Deposit Account Id.
   * @param command Bancro command name.
   * @param data Command payload.
   */
  executeBancroCommand(accountId: string | number, command: string, data: any): Observable<any> {
    const httpParams = new HttpParams().set('command', command);
    return this.http.post(`/fixeddepositaccounts/${accountId}/bancro-command`, data, { params: httpParams });
  }

  /**
   * Retrieves configured Bancro GL/accounting mappings.
   */
  getBancroAccountingMappings(): Observable<any> {
    return this.http.get('/fixeddepositaccounts/bancro-accounting-mappings');
  }

  /**
   * Creates or updates a Bancro GL/accounting mapping.
   * @param mapping Mapping payload.
   */
  saveBancroAccountingMapping(mapping: any): Observable<any> {
    return this.http.post('/fixeddepositaccounts/bancro-accounting-mappings', mapping);
  }

}
