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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dateUtils: Dates,
    private fixedDepositsService: FixedDepositsService,
    private settingsService: SettingsService,
    private externalApIService: ExternalApisService,
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


    // Uncomment this to actually make the API call

    // if (customInterestRate) {
      this.externalApIService
        .addFixedDepositAccount({ ...fixedDepositAccount, customInterestRate })
        .subscribe((response: any) => {
          this.router.navigate(["../", response.data?.data?.resourceId], { relativeTo: this.route });
        });
    // } else {
    //   this.fixedDepositsService.createFixedDepositAccount(fixedDepositAccount).subscribe((response: any) => {
    //     this.router.navigate(["../", response.resourceId], { relativeTo: this.route });
    //   });
    // }
  }
}
