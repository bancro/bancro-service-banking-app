/** Angular Imports */
import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { of } from "rxjs";
import { catchError } from "rxjs/operators";

/** Custom Dialogs */
import { DeleteDialogComponent } from "app/shared/delete-dialog/delete-dialog.component";
import { CalculateInterestDialogComponent } from "./custom-dialogs/calculate-interest-dialog/calculate-interest-dialog.component";
import { PostInterestDialogComponent } from "./custom-dialogs/post-interest-dialog/post-interest-dialog.component";
import { ToggleWithholdTaxDialogComponent } from "./custom-dialogs/toggle-withhold-tax-dialog/toggle-withhold-tax-dialog.component";
import { BancroCommandDialogComponent } from "./custom-dialogs/bancro-command-dialog/bancro-command-dialog.component";

/** Custom Button Config. */
import { FixedDepositsButtonsConfiguration } from "./fixed-deposits-buttons.config";

/** Custom Services */
import { FixedDepositsService } from "../fixed-deposits.service";
import { SavingsService } from "app/savings/savings.service";
import { ExternalApisService } from "app/external-apis/external-apis.service";

/**
 * Fixed Deposits Account View Component
 */
@Component({
  selector: "mifosx-fixed-deposit-account-view",
  templateUrl: "./fixed-deposit-account-view.component.html",
  styleUrls: ["./fixed-deposit-account-view.component.scss"],
})
export class FixedDepositAccountViewComponent implements OnInit {
  /** Fixed Deposits Account Data */
  fixedDepositsAccountData: any;
  /** Bancro Fixed Deposit extension data */
  bancroDetails: any;
  /** Tracks whether the Bancro add-on details endpoint is loading */
  isBancroDetailsLoading = false;
  /** Stores non-blocking Bancro details load errors */
  bancroDetailsError: string | null = null;
  /** Savings Data Tables */
  savingsDatatables: any;
  /** Button Configurations */
  buttonConfig: FixedDepositsButtonsConfiguration;

  private readonly commandTitles: Record<string, string> = {
    payUpfrontInterest: "Pay Upfront Interest",
    liquidateInterest: "Liquidate Interest",
    liquidatePrincipal: "Liquidate Principal",
    liquidatePrincipalAndInterest: "Liquidate Principal + Interest",
    topupPrincipal: "Top Up Principal",
    changeInterestRate: "Change Interest Rate",
    postAccounting: "Post Accounting",
    retryAccounting: "Retry Accounting",
    reverseBancroEvent: "Reverse Bancro Event",
  };

  /**
   * Fetches fixed deposits account data from `resolve`
   * @param {ActivatedRoute} route Activated Route
   * @param {Router} router Router
   * @param {FixedDepositsService} fixedDepositsService Fixed Deposits Service
   * @param {SavingsService} savingsService Savings Service
   * @param {MatDialog} dialog Mat Dialog
   */
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fixedDepositsService: FixedDepositsService,
    private savingsService: SavingsService,
    private externalApIService: ExternalApisService,
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) {
    this.route.data.subscribe((data: { fixedDepositsAccountData: any; savingsDatatables: any }) => {
      this.fixedDepositsAccountData = data.fixedDepositsAccountData;
      this.savingsDatatables = data.savingsDatatables;
    });
  }

  ngOnInit() {
    this.setConditionalButtons();
    this.fetchBancroDetails();
  }

  /**
   * Adds options to button config conditionally.
   */
  setConditionalButtons() {
    const status = this.fixedDepositsAccountData.status.value;
    this.buttonConfig = new FixedDepositsButtonsConfiguration(status);
    if (this.fixedDepositsAccountData.taxGroup && status === "Active") {
      if (this.fixedDepositsAccountData.withHoldTax) {
        this.buttonConfig.addOption({
          name: "Disable Withhold Tax",
        });
      } else {
        this.buttonConfig.addOption({
          name: "Enable Withhold Tax",
        });
      }
    }
  }

  /**
   * Refetches data for the component.
   * TODO: Replace by a custom reload component instead of hard-coded back-routing.
   */
  reload() {
    const clientId = this.fixedDepositsAccountData.clientId;
    const url: string = this.router.url;
    this.router
      .navigateByUrl(`/clients/${clientId}/fixed-deposits-accounts`, { skipLocationChange: true })
      .then(() => this.router.navigate([url]));
  }

  /**
   * Returns Bancro detail value with fallback to the generic fixed deposit account data.
   * @param key Field name.
   */
  getBancroValue(key: string): any {
    if (this.bancroDetails && this.bancroDetails[key] !== undefined && this.bancroDetails[key] !== null) {
      return this.bancroDetails[key];
    }
    return this.fixedDepositsAccountData ? this.fixedDepositsAccountData[key] : null;
  }



  /**
   * Original Fineract product/account interest rate from the generic fixed deposit endpoint.
   * This remains the base/product chart rate and is kept for backward compatibility.
   */
  get displayOriginalInterestRate(): any {
    return this.fixedDepositsAccountData?.nominalAnnualInterestRate
      ?? this.fixedDepositsAccountData?.interestRate
      ?? this.fixedDepositsAccountData?.annualInterestRate
      ?? null;
  }

  /**
   * Interest rate to display on the Bancro-enabled account page.
   * Bancro rate changes are stored separately from the original Fineract interest chart,
   * so this prefers the Bancro effective/current rate and safely falls back to the generic rate.
   */
  get displayInterestRate(): any {
    const bancroRate = this.resolveBancroInterestRate();
    if (bancroRate !== null && bancroRate !== undefined && bancroRate !== '') {
      return bancroRate;
    }

    const originalRate = this.displayOriginalInterestRate;
    return originalRate !== null && originalRate !== undefined && originalRate !== '' ? originalRate : '--';
  }

  /**
   * True when the page is showing a Bancro rate override rather than the original product chart rate.
   */
  get hasBancroInterestRateOverride(): boolean {
    const bancroRate = this.resolveBancroInterestRate();
    const originalRate = this.displayOriginalInterestRate;

    if (bancroRate === null || bancroRate === undefined || bancroRate === ''
        || originalRate === null || originalRate === undefined || originalRate === '') {
      return false;
    }

    return Number(bancroRate) !== Number(originalRate);
  }

  /**
   * Returns Bancro rate history/schedule rows in a defensive way because backend response names may evolve.
   */
  get bancroRateChanges(): any[] {
    if (!this.bancroDetails) { return []; }

    const candidates = [
      'rateSchedule',
      'rateSchedules',
      'interestRateSchedule',
      'interestRateSchedules',
      'rateChanges',
      'rateChangeHistory',
      'rateHistory'
    ];

    for (const key of candidates) {
      const value = this.bancroDetails[key];
      if (Array.isArray(value) && value.length) {
        return value;
      }
    }

    return [];
  }

  /**
   * Resolves the Bancro current/effective interest rate from direct fields or from the latest rate schedule row.
   */
  private resolveBancroInterestRate(): any {
    if (!this.bancroDetails) { return null; }

    const directFields = [
      'currentAnnualInterestRate',
      'effectiveAnnualInterestRate',
      'latestAnnualInterestRate',
      'bancroAnnualInterestRate',
      'newAnnualInterestRate',
      'annualInterestRate',
      'currentInterestRate',
      'effectiveInterestRate',
      'interestRate'
    ];

    for (const field of directFields) {
      const value = this.bancroDetails[field];
      if (value !== undefined && value !== null && value !== '') {
        return value;
      }
    }

    const rateRows = this.bancroRateChanges;
    if (!rateRows.length) { return null; }

    const sortedRows = [...rateRows].sort((a: any, b: any) => {
      const aDate = this.resolveRateEffectiveDate(a);
      const bDate = this.resolveRateEffectiveDate(b);
      return aDate.getTime() - bDate.getTime();
    });

    const today = new Date();
    const effectiveRows = sortedRows.filter((row: any) => this.resolveRateEffectiveDate(row).getTime() <= today.getTime());
    const selected = effectiveRows.length ? effectiveRows[effectiveRows.length - 1] : sortedRows[sortedRows.length - 1];

    return this.resolveRateValue(selected);
  }

  /**
   * Resolves a rate value from a Bancro rate schedule/history row.
   */
  resolveRateValue(row: any): any {
    if (!row) { return null; }

    const fields = [
      'newAnnualInterestRate',
      'annualInterestRate',
      'currentAnnualInterestRate',
      'effectiveAnnualInterestRate',
      'rate',
      'interestRate'
    ];

    for (const field of fields) {
      const value = row[field];
      if (value !== undefined && value !== null && value !== '') {
        return value;
      }
    }

    return null;
  }

  /**
   * Resolves an effective date from a Bancro rate schedule/history row.
   */
  resolveRateEffectiveDateText(row: any): any {
    if (!row) { return null; }

    return row.effectiveDate
      ?? row.effectiveFromDate
      ?? row.effective_from_date
      ?? row.startDate
      ?? row.createdDate
      ?? null;
  }

  private resolveRateEffectiveDate(row: any): Date {
    const rawDate = this.resolveRateEffectiveDateText(row);
    if (!rawDate) { return new Date(0); }

    if (Array.isArray(rawDate) && rawDate.length >= 3) {
      return new Date(rawDate[0], rawDate[1] - 1, rawDate[2]);
    }

    const parsed = new Date(rawDate);
    return isNaN(parsed.getTime()) ? new Date(0) : parsed;
  }

  /**
   * Performs action button/option action.
   * @param {string} name action name.
   */
  doAction(name: string) {
    switch (name) {
      case "Approve":
      case "Reject":
      case "Activate":
      case "Close":
      case "Undo Approval":
      case "Add Charge":
      case "Withdraw By Client":
      case "Premature Close":
        this.router.navigate([`actions/${name}`], { relativeTo: this.route });
        break;
      case "Modify Application":
        this.router.navigate(["edit"], { relativeTo: this.route });
        break;
      case "Delete":
        this.deleteFixedDepositsAccount();
        break;
      case "Calculate Interest":
        this.calculateInterest();
        break;
      case "Post Interest":
        this.postInterest();
        break;
      case "Enable Withhold Tax":
        this.enableWithHoldTax();
        break;
      case "Disable Withhold Tax":
        this.disableWithHoldTax();
        break;
      case "Download Deal Certificate":
        this.downloadDealCertificate();
        break;
      case "Pay Upfront Interest":
        this.handleBancroCommand("payUpfrontInterest");
        break;
      case "Liquidate Interest":
        this.handleBancroCommand("liquidateInterest");
        break;
      case "Liquidate Principal":
        this.handleBancroCommand("liquidatePrincipal");
        break;
      case "Liquidate Principal + Interest":
        this.handleBancroCommand("liquidatePrincipalAndInterest");
        break;
      case "Top Up Principal":
        this.handleBancroCommand("topupPrincipal");
        break;
      case "Change Interest Rate":
        this.handleBancroCommand("changeInterestRate");
        break;
      case "Post Accounting":
        this.handleBancroCommand("postAccounting");
        break;
      case "Retry Accounting":
        this.handleBancroCommand("retryAccounting");
        break;
      case "Reverse Bancro Event":
        this.handleBancroCommand("reverseBancroEvent");
        break;
    }
  }

  /**
   * Loads the Bancro fixed deposit extension details after the generic fixed deposit endpoint succeeds.
   * Failure here is intentionally non-blocking so the generic Fineract fixed deposit page still works.
   */
  fetchBancroDetails() {
    if (!this.fixedDepositsAccountData?.id) { return; }

    this.isBancroDetailsLoading = true;
    this.bancroDetailsError = null;

    this.fixedDepositsService.getBancroDetails(this.fixedDepositsAccountData.id)
      .pipe(
        catchError((error: any) => {
          this.bancroDetailsError = error?.error?.defaultUserMessage || error?.error?.developerMessage || "Bancro details are not available.";
          return of(null);
        })
      )
      .subscribe((response: any) => {
        this.isBancroDetailsLoading = false;
        if (!response) { return; }

        this.bancroDetails = response;
        this.fixedDepositsAccountData.bancroDetails = response;
        this.setConditionalButtons();
        this.buttonConfig.applyBancroCapabilities(response);
      });
  }

  /**
   * Deletes Fixed Deposits Account.
   */
  private deleteFixedDepositsAccount() {
    const deleteFixedDepositsAccountDialogRef = this.dialog.open(DeleteDialogComponent, {
      data: { deleteContext: `fixed deposit account with id: ${this.fixedDepositsAccountData.id}` },
    });
    deleteFixedDepositsAccountDialogRef.afterClosed().subscribe((response: any) => {
      if (response.delete) {
        this.fixedDepositsService.deleteFixedDepositsAccount(this.fixedDepositsAccountData.id).subscribe(() => {
          this.router.navigate(["../../"], { relativeTo: this.route });
        });
      }
    });
  }

  /**
   * Calculates fixed deposit account's interest
   */
  private calculateInterest() {
    const calculateInterestAccountDialogRef = this.dialog.open(CalculateInterestDialogComponent);
    calculateInterestAccountDialogRef.afterClosed().subscribe((response: any) => {
      if (response.confirm) {
        this.fixedDepositsService
          .executeFixedDepositsAccountCommand(this.fixedDepositsAccountData.id, "calculateInterest", {})
          .subscribe(() => {
            this.reload();
          });
      }
    });
  }

  /**
   * Posts fixed deposit account's interest
   */
  private postInterest() {
    const postInterestAccountDialogRef = this.dialog.open(PostInterestDialogComponent);
    postInterestAccountDialogRef.afterClosed().subscribe((response: any) => {
      if (response.confirm) {
        this.fixedDepositsService
          .executeFixedDepositsAccountCommand(this.fixedDepositsAccountData.id, "postInterest", {})
          .subscribe(() => {
            this.reload();
          });
      }
    });
  }

  /**
   * Download deal certficate externally
   */
  private downloadDealCertificate() {
    this.externalApIService.downloadDealCertificate(this.fixedDepositsAccountData.id);
  }

  /**
   * Opens the reusable Bancro command modal and posts the command to the Bancro endpoint.
   * @param command Bancro command.
   */
  private handleBancroCommand(command: string) {
    const title = this.commandTitles[command] ?? command;
    const dialogRef = this.dialog.open(BancroCommandDialogComponent, {
      width: "540px",
      data: {
        command,
        title,
        accountId: this.fixedDepositsAccountData.id,
        bancroDetails: this.bancroDetails
      }
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result?.confirm) {
        const payload = { ...result.payload };
        delete payload.command;
        delete payload.accountId;

        this.fixedDepositsService.executeBancroCommand(this.fixedDepositsAccountData.id, command, payload).subscribe({
          next: (response: any) => {
            const accountingStatus = response?.accountingStatus || response?.accounting?.accountingStatus;
            const accountingError = response?.accounting?.error || response?.accountingErrorMessage;
            if (accountingStatus === "FAILED") {
              this.snackBar.open(
                accountingError || "Bancro command was recorded, but accounting posting failed and can be retried.",
                "Close",
                { duration: 8000 }
              );
            } else {
              this.snackBar.open("Bancro fixed deposit command completed.", "Close", { duration: 4000 });
            }
            this.reload();
          },
          error: (error: any) => {
            const message = error?.error?.defaultUserMessage
              || error?.error?.developerMessage
              || error?.error?.errors?.[0]?.defaultUserMessage
              || "Bancro fixed deposit command failed.";
            this.snackBar.open(message, "Close", { duration: 8000 });
          }
        });
      }
    });
  }

  /**
   * Enables withhold tax for fixed deposits account.
   * Fixed deposits endpoint is not supported so using Savings endpoint.
   */
  private enableWithHoldTax() {
    const deleteSavingsAccountDialogRef = this.dialog.open(ToggleWithholdTaxDialogComponent, {
      data: { isEnable: true },
    });
    deleteSavingsAccountDialogRef.afterClosed().subscribe((response: any) => {
      if (response.confirm) {
        this.savingsService
          .executeSavingsAccountUpdateCommand(this.fixedDepositsAccountData.id, "updateWithHoldTax", {
            withHoldTax: true,
          })
          .subscribe(() => {
            this.reload();
          });
      }
    });
  }

  /**
   * Disables withhold tax for fixed deposits account
   * Fixed deposits endpoint is not supported so using Savings endpoint.
   */
  private disableWithHoldTax() {
    const disableWithHoldTaxDialogRef = this.dialog.open(ToggleWithholdTaxDialogComponent, {
      data: { isEnable: false },
    });
    disableWithHoldTaxDialogRef.afterClosed().subscribe((response: any) => {
      if (response.confirm) {
        this.savingsService
          .executeSavingsAccountUpdateCommand(this.fixedDepositsAccountData.id, "updateWithHoldTax", {
            withHoldTax: false,
          })
          .subscribe(() => {
            this.reload();
          });
      }
    });
  }
}
