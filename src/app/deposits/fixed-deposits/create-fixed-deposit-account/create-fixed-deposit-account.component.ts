/** Angular Imports */
import { Component, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";

/** Custom Services */
import { FixedDepositsService } from "../fixed-deposits.service";
import { SettingsService } from "app/settings/settings.service";
import { ExternalApisService } from "app/external-apis/external-apis.service";

/** Custom Components */
import { FixedDepositAccountDetailsStepComponent } from "../fixed-deposit-account-stepper/fixed-deposit-account-details-step/fixed-deposit-account-details-step.component";
import { FixedDepositAccountCurrencyStepComponent } from "../fixed-deposit-account-stepper/fixed-deposit-account-currency-step/fixed-deposit-account-currency-step.component";
import { FixedDepositAccountTermsStepComponent } from "../fixed-deposit-account-stepper/fixed-deposit-account-terms-step/fixed-deposit-account-terms-step.component";
import { FixedDepositAccountSettingsStepComponent } from "../fixed-deposit-account-stepper/fixed-deposit-account-settings-step/fixed-deposit-account-settings-step.component";
import { FixedDepositAccountChargesStepComponent } from "../fixed-deposit-account-stepper/fixed-deposit-account-charges-step/fixed-deposit-account-charges-step.component";
import { Dates } from "app/core/utils/dates";
import { MatSnackBar } from "@angular/material/snack-bar";
import { FixedDepositAccountInterestRateChartStepComponent } from "../fixed-deposit-account-stepper/fixed-deposit-account-interest-rate-chart-step/fixed-deposit-account-interest-rate-chart-step.component";

/**
 * Create Fixed Deposit Account Component
 */
@Component({
  selector: "mifosx-create-fixed-deposit-account",
  templateUrl: "./create-fixed-deposit-account.component.html",
  styleUrls: ["./create-fixed-deposit-account.component.scss"],
})
export class CreateFixedDepositAccountComponent {
  @ViewChild(FixedDepositAccountDetailsStepComponent, { static: true })
  fixedDepositsAccountDetailsStep: FixedDepositAccountDetailsStepComponent;

  @ViewChild(FixedDepositAccountCurrencyStepComponent, { static: true })
  fixedDepositAccountCurrencyStep: FixedDepositAccountCurrencyStepComponent;

  @ViewChild(FixedDepositAccountTermsStepComponent, { static: true })
  fixedDepositAccountTermsStep: FixedDepositAccountTermsStepComponent;

  @ViewChild(FixedDepositAccountSettingsStepComponent, { static: true })
  fixedDepositAccountSettingsStep: FixedDepositAccountSettingsStepComponent;

  @ViewChild(FixedDepositAccountChargesStepComponent, { static: true })
  fixedDepositAccountChargesStep: FixedDepositAccountChargesStepComponent;

  @ViewChild(FixedDepositAccountInterestRateChartStepComponent, { static: true })
  fixedDepositAccountInterestRateChartStep: FixedDepositAccountInterestRateChartStepComponent;

  fixedDepositsAccountTemplate: any;
  fixedDepositsAccountProductTemplate: any;
  isSubmitting = false;
  bancroApiCreateWarning: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dateUtils: Dates,
    private fixedDepositsService: FixedDepositsService,
    private settingsService: SettingsService,
    private externalApIService: ExternalApisService,
    private snackBar: MatSnackBar,
  ) {
    this.route.data.subscribe((data: { fixedDepositsAccountTemplate: any }) => {
      this.fixedDepositsAccountTemplate = data.fixedDepositsAccountTemplate;
    });
  }

  // Method to replace annual interest rate with a variable
  replaceAnnualInterestRateWithVariable(data: any[], customRate: number) {
    return data.map((item) => ({
      ...item,
      chartSlabs: item.chartSlabs.map((slab: any) => ({
        ...slab,
        annualInterestRate: customRate, // Replace the annualInterestRate with customRate
      })),
    }));
  }

  setTemplate($event: any) {
    this.fixedDepositsAccountProductTemplate = $event;
  }

  get fixedDepositAccountDetailsForm() {
    return this.fixedDepositsAccountDetailsStep.fixedDepositAccountDetailsForm;
  }

  get fixedDepositAccountCurrencyForm() {
    return this.fixedDepositAccountCurrencyStep.fixedDepositAccountCurrencyForm;
  }

  get fixedDepositAccountTermsForm() {
    return this.fixedDepositAccountTermsStep.fixedDepositAccountTermsForm;
  }

  get fixedDepositAccountSettingsForm() {
    return this.fixedDepositAccountSettingsStep.fixedDepositAccountSettingsForm;
  }

  get fixedDepositAccountCustomRateForm() {
    return this.fixedDepositAccountInterestRateChartStep.customInterestRate;
  }

  get fixedDepositAccountFormValid() {
    return (
      this.fixedDepositAccountDetailsForm.valid &&
      this.fixedDepositAccountTermsForm.valid &&
      this.fixedDepositAccountSettingsForm.valid
    );
  }

  get fixedDepositAccount() {
    return {
      ...this.fixedDepositsAccountDetailsStep.fixedDepositAccountDetails,
      ...this.fixedDepositAccountTermsStep.fixedDepositAccountTerms,
      ...this.fixedDepositAccountSettingsStep.fixedDepositAccountSettings,
      ...this.fixedDepositAccountChargesStep.fixedDepositAccountCharges,
    };
  }

  submit() {
    const customInterestRate = this.fixedDepositAccountInterestRateChartStep.customInterestRate.value.rate;
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const monthDayFormat = "dd MMMM";
    const chartsData = [{ chartSlabs: this.fixedDepositsAccountProductTemplate.accountChart.chartSlabs }];
    const fixedDepositAccount = {
      ...this.fixedDepositAccount,

      clientId: this.fixedDepositsAccountTemplate.clientId,
      charges: this.fixedDepositAccount.charges.map((charge: any) => ({
        chargeId: charge.id,
        amount: charge.amount,
        dueDate: charge.dueDate && this.dateUtils.formatDate(charge.dueDate, dateFormat),
        feeOnMonthDay:
          charge.feeOnMonthDay && this.dateUtils.formatDate([2000].concat(charge.feeOnMonthDay), monthDayFormat),
        feeInterval: charge.feeInterval,
      })),
      submittedOnDate: this.dateUtils.formatDate(this.fixedDepositAccount.submittedOnDate, dateFormat),
      charts: customInterestRate
        ? this.replaceAnnualInterestRateWithVariable(chartsData, customInterestRate)
        : chartsData,
      dateFormat,
      monthDayFormat,
      locale,
    };

    const createPayload = this.withCustomInterestRate(fixedDepositAccount, customInterestRate);
    this.isSubmitting = true;
    this.bancroApiCreateWarning = null;

    this.externalApIService.addFixedDepositAccount(createPayload).subscribe({
      next: (response: any) => {
        this.isSubmitting = false;
        this.navigateToCreatedAccount(response);
      },
      error: (error: any) => {
        this.bancroApiCreateWarning = this.resolveCreateErrorMessage(error);
        this.snackBar.open(
          `${this.bancroApiCreateWarning} Retrying with the core fixed deposit creation endpoint.`,
          "Close",
          { duration: 8000 },
        );
        this.createFixedDepositThroughCoreApi(createPayload);
      },
    });
  }

  private withCustomInterestRate(fixedDepositAccount: any, customInterestRate: any) {
    const parsedCustomRate = this.toNullableNumber(customInterestRate);
    if (parsedCustomRate === null) {
      return fixedDepositAccount;
    }
    return {
      ...fixedDepositAccount,
      customInterestRate: parsedCustomRate,
      nominalAnnualInterestRate: parsedCustomRate,
      isCustom: true,
    };
  }

  private createFixedDepositThroughCoreApi(payload: any) {
    this.fixedDepositsService.createFixedDepositAccount(payload).subscribe({
      next: (response: any) => {
        this.isSubmitting = false;
        this.navigateToCreatedAccount(response);
      },
      error: (fallbackError: any) => {
        this.isSubmitting = false;
        this.snackBar.open(this.resolveCreateErrorMessage(fallbackError), "Close", { duration: 10000 });
      },
    });
  }

  private navigateToCreatedAccount(response: any) {
    const resourceId = response?.data?.data?.resourceId || response?.data?.resourceId || response?.resourceId || response?.savingsId;
    if (!resourceId) {
      this.snackBar.open("Fixed deposit account was created but the response did not include the account id.", "Close", {
        duration: 8000,
      });
      return;
    }
    this.router.navigate(["../", resourceId], { relativeTo: this.route });
  }

  private resolveCreateErrorMessage(error: any): string {
    return (
      error?.error?.message ||
      error?.error?.developerMessage ||
      error?.error?.defaultUserMessage ||
      error?.message ||
      "The Bancro fixed deposit account creation service failed."
    );
  }

  private toNullableNumber(value: any): number | null {
    if (value === null || value === undefined || value === "") {
      return null;
    }
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }
}
