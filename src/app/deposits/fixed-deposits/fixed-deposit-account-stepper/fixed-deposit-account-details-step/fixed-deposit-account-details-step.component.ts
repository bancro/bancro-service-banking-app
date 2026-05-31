/** Angular Imports */
import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { UntypedFormGroup, UntypedFormBuilder, Validators } from "@angular/forms";
import { SettingsService } from "app/settings/settings.service";

/** Custom Services */
import { FixedDepositsService } from "../../fixed-deposits.service";
import { ClientsService } from "app/clients/clients.service";

/**
 * Fixed Deposits Account Details Step
 */
@Component({
  selector: "mifosx-fixed-deposit-account-details-step",
  templateUrl: "./fixed-deposit-account-details-step.component.html",
  styleUrls: ["./fixed-deposit-account-details-step.component.scss"],
})
export class FixedDepositAccountDetailsStepComponent implements OnInit {
  /** Fixed Deposits Account Template */
  @Input() fixedDepositsAccountTemplate: any;

  /** Minimum date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum date allowed. */
  maxDate = new Date();
  /** Product Data */
  productData: any;
  /** Field Officer Data */
  fieldOfficerData: any;
  /** For edit savings form */
  isFieldOfficerPatched = false;
  /** Fixed Deposits Account Details Form */
  fixedDepositAccountDetailsForm: UntypedFormGroup;

  fundingSavingsAccountData: any[] = [];
  allFundingSavingsAccountData: any[] = [];
  selectedProductCurrencyCode = "";

  /** Fixed Deposits Account Template with product data  */
  @Output() fixedDepositsAccountProductTemplate = new EventEmitter();

  /**
   * Sets fixed deposits account details form.
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {FixedDepositsService} fixedDepositsService Fixed Deposits Service.
   * @param {SettingsService} settingsService Settings Service
   */
  constructor(
    private formBuilder: UntypedFormBuilder,
    private fixedDepositsService: FixedDepositsService,
    private settingsService: SettingsService,
    private clientsService: ClientsService,
  ) {
    this.createFixedDepositsAccountDetailsForm();
  }

  ngOnInit() {
    this.maxDate = this.settingsService.businessDate;
    this.buildDependencies();
    if (this.fixedDepositsAccountTemplate) {
      this.productData = this.fixedDepositsAccountTemplate.productOptions.filter(
        (item: { name: string }) => !item.name?.includes("_CUSTOM"),
      );
      if (this.fixedDepositsAccountTemplate.depositProductId) {
        this.fixedDepositAccountDetailsForm.patchValue({
          productId: this.fixedDepositsAccountTemplate.depositProductId,
          submittedOnDate:
            this.fixedDepositsAccountTemplate.timeline.submittedOnDate &&
            new Date(this.fixedDepositsAccountTemplate.timeline.submittedOnDate),
        });
      }
    }
  }

  /**
   * Creates fixed deposits account details form.
   */
  createFixedDepositsAccountDetailsForm() {
    this.fixedDepositAccountDetailsForm = this.formBuilder.group({
      productId: ["", Validators.required],
      submittedOnDate: ["", Validators.required],
      fieldOfficerId: [""],
      fundingSavingsAccountId: ["", Validators.required],
    });
  }

  /**
   * Fetches fixed deposits account product template on productId value changes
   */
  buildDependencies() {
    const clientId = this.fixedDepositsAccountTemplate.clientId;
    this.fixedDepositAccountDetailsForm.get("productId").valueChanges.subscribe((productId: string) => {
      this.fixedDepositsService.getFixedDepositsAccountTemplate(clientId, productId).subscribe((response: any) => {
        this.fixedDepositsAccountProductTemplate.emit(response);
        this.selectedProductCurrencyCode = this.resolveCurrencyCode(response);
        this.filterFundingAccountsForSelectedProduct();
        this.fieldOfficerData = response.fieldOfficerOptions;
        if (!this.isFieldOfficerPatched && this.fixedDepositsAccountTemplate.fieldOfficerId) {
          this.fixedDepositAccountDetailsForm
            .get("fieldOfficerId")
            .patchValue(this.fixedDepositsAccountTemplate.fieldOfficerId);
          this.isFieldOfficerPatched = true;
        } else {
          this.fixedDepositAccountDetailsForm.get("fieldOfficerId").patchValue("");
        }
      });
    });

    this.clientsService.getClientAccountData(clientId).subscribe((response: any) => {
      this.allFundingSavingsAccountData = (response.savingsAccounts || []).filter(
        (item: { status: { active: any } }) => item.status && item.status.active,
      );
      this.filterFundingAccountsForSelectedProduct();
    });
  }

  private resolveCurrencyCode(source: any): string {
    return (source?.currency?.code || source?.currencyCode || source?.currency?.name || source?.currency || "").toString();
  }

  private filterFundingAccountsForSelectedProduct() {
    const selectedCurrency = this.selectedProductCurrencyCode;
    this.fundingSavingsAccountData = (this.allFundingSavingsAccountData || []).filter((account: any) => {
      const accountCurrency = this.resolveCurrencyCode(account);
      return !selectedCurrency || accountCurrency === selectedCurrency;
    });

    const selectedFundingAccountId = this.fixedDepositAccountDetailsForm.get("fundingSavingsAccountId").value;
    if (selectedFundingAccountId && !this.fundingSavingsAccountData.some((account: any) => account.id === selectedFundingAccountId)) {
      this.fixedDepositAccountDetailsForm.get("fundingSavingsAccountId").patchValue("");
    }
  }

  /**
   * Returns fixed deposits account details form value.
   */
  get fixedDepositAccountDetails() {
    const fixedDepositAccountDetails = { ...this.fixedDepositAccountDetailsForm.value };
    if (fixedDepositAccountDetails.fundingSavingsAccountId) {
      fixedDepositAccountDetails.linkAccountId = fixedDepositAccountDetails.fundingSavingsAccountId;
    }
    for (const key in fixedDepositAccountDetails) {
      if (fixedDepositAccountDetails[key] === "") {
        delete fixedDepositAccountDetails[key];
      }
    }
    return fixedDepositAccountDetails;
  }
}
