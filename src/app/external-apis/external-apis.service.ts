/** Angular Imports */
import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

/** rxjs Imports */
import { Observable } from "rxjs";
import { tap, catchError } from "rxjs/operators";
import { of } from "rxjs"; // to handle errors gracefully

/**
 * Service for interacting with external APIs.
 */
@Injectable({
  providedIn: "root",
})
export class ExternalApisService {
  private  baseUrl = "https://bancroapi.streams.com.ng";

  /**
   * @param {HttpClient} http Http Client to send requests.
   */
  constructor(private http: HttpClient) {}

  /**
   * Downloads a deal certificate by its ID.
   * @param {string} id The ID of the certificate to download.
   */
  downloadDealCertificate(id: string): void {
    const url = `${this.baseUrl}/Certificates/download/${id}`;
    this.http
      .get(url, { responseType: "blob" })
      .pipe(
        tap((blob) => {
          const downloadUrl = window.URL.createObjectURL(blob);
          const anchor = document.createElement("a");
          anchor.href = downloadUrl;
          anchor.download = `certificate_${id}.pdf`; // Adjust the filename as needed
          anchor.click();
          window.URL.revokeObjectURL(downloadUrl);
        }),
        catchError((error) => {
          console.error("Error downloading deal certificate:", error);
          // Handle error, maybe show a toast or alert to the user
          return of(null); // Return null or any default value on error
        }),
      )
      .subscribe();
  }

  /**
   * Downloads a repayment schedule by its ID.
   * @param {string} id The ID of the loan to download.
   */
  downloadRepaymentSchedule(id: string): void {
    const url = `${this.baseUrl}/Loan/${id}/export-csv`;
    this.http
      .get(url, { responseType: "blob" })
      .pipe(
        tap((blob) => {
          const downloadUrl = window.URL.createObjectURL(blob);
          const anchor = document.createElement("a");
          anchor.href = downloadUrl;
          anchor.download = `repayment_schedule_${id}.csv`; // Adjust the filename as needed
          anchor.click();
          window.URL.revokeObjectURL(downloadUrl);
        }),
        catchError((error) => {
          console.error("Error downloading repayment schedule:", error);
          // Handle error, maybe show a toast or alert to the user
          return of(null); // Return null or any default value on error
        }),
      )
      .subscribe();
  }

  /**
   * Create new fixed deposit account
   * @param {any} payload .
   */
  addFixedDepositAccount(payload: any): Observable<any> {
    console.log('Test data', payload)
    const url = `${this.baseUrl}/FixedDepositAccount/add-account?fundingSavingsAccountId=${payload?.fundingSavingsAccountId}&isCustom=${!!payload?.customInterestRate}`;
    return this.http.post(url, payload);
  }

  /**
   * Import data by uploading a file (binary).
   * @param {File} file The file to upload.
   * @param {string} endpoint The endpoint to upload to (e.g., 'customers', 'transactions').
   */
  importData(file: File, endpoint: string): Observable<any> {
    const url = `${this.baseUrl}/DataImport/${endpoint}`;
    const formData = new FormData();
    formData.append('importData', file);

    return this.http.post(url, formData);
  }

  importFdData(file: File): Observable<any> {
    const url = `${this.baseUrl}/FixedDepositAccount/import-fd-accounts`;
    const formData = new FormData();
    formData.append('importData', file);

    return this.http.post(url, formData);
  }
}
