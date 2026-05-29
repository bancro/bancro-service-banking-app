/** Angular Imports */
import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { MatDialog } from "@angular/material/dialog";

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
  /** Savings Data Tables */
  savingsDatatables: any;
  /** Button Configurations */
  buttonConfig: FixedDepositsButtonsConfiguration;

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
   * Adds options to button config. conditionaly.
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
   * Refetches data fot the component
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
        this.handleNewCommand({ command: 'payUpfrontInterest', accountId: this.fixedDepositsAccountData.id });
        break;
      case "Liquidate Interest":
        this.handleNewCommand({ command: 'liquidateInterest', accountId: this.fixedDepositsAccountData.id });
        break;
      case "Liquidate Principal":
        this.handleNewCommand({ command: 'liquidatePrincipal', accountId: this.fixedDepositsAccountData.id });
        break;
      case "Liquidate Principal + Interest":
        this.handleNewCommand({ command: 'liquidatePrincipalAndInterest', accountId: this.fixedDepositsAccountData.id });
        break;
      case "Top Up Principal":
        this.handleNewCommand({ command: 'topUpPrincipal', accountId: this.fixedDepositsAccountData.id });
        break;
      case "Change Interest Rate":
        this.handleNewCommand({ command: 'changeInterestRate', accountId: this.fixedDepositsAccountData.id });
        break;
      case "Post Accounting":
        this.handleNewCommand({ command: 'postAccounting', accountId: this.fixedDepositsAccountData.id });
        break;
      case "Retry Accounting":
        this.handleNewCommand({ command: 'retryAccounting', accountId: this.fixedDepositsAccountData.id });
        break;
      case "Reverse Bancro Event":
        this.handleNewCommand({ command: 'reverseBancroEvent',  accountId: this.fixedDepositsAccountData.id });
        break;
    }
  }

  fetchBancroDetails() {
    this.externalApIService.getFDGlMapppings().subscribe((response: any) => {
    console.log(response);
    })
    this.externalApIService.getFdAccountBancroDetails(this.fixedDepositsAccountData.id).subscribe((response: any) => {
      this.fixedDepositsAccountData.bancroDetails = response;
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

  private readonly commandTitles: Record<string, string> = {
    payUpfrontInterest: 'Pay Upfront Interest',
    liquidateInterest: 'Liquidate Interest',
    liquidatePrincipal: 'Liquidate Principal',
    liquidatePrincipalAndInterest: 'Liquidate Principal + Interest',
    topUpPrincipal: 'Top Up Principal',
    changeInterestRate: 'Change Interest Rate',
    postAccounting: 'Post Accounting',
    retryAccounting: 'Retry Accounting',
    reverseBancroEvent: 'Reverse Bancro Event',
  };

  private handleNewCommand(meta: { command: string; accountId: string | number }) {
    const title = this.commandTitles[meta.command] ?? meta.command;
    const dialogRef = this.dialog.open(BancroCommandDialogComponent, {
      width: '480px',
      data: { command: meta.command, title, accountId: meta.accountId }
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result?.confirm) {
        this.externalApIService.handleBancroCommand(result.payload).subscribe(() => {
          this.reload();
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
