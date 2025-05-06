/** Angular Imports */
import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

/** rxjs Imports */
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";

/**
 * Service for interacting with external APIs.
 */
@Injectable({
  providedIn: "root",
})
export class ExternalApisService {
  private readonly baseUrl = "https://bancroapi.streams.com.ng";

  /**
   * @param {HttpClient} http Http Client to send requests.
   */
  constructor(private readonly http: HttpClient) {}

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
        })
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
          })
        )
        .subscribe();
    }
}
