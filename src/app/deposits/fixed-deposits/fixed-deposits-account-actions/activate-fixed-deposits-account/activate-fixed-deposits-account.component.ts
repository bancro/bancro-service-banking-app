/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Dates } from 'app/core/utils/dates';

/** Custom Services */
import { FixedDepositsService } from '../../fixed-deposits.service';
import { SettingsService } from 'app/settings/settings.service';

/**
 * Activate Fixed Deposits Account Component
 */
@Component({
  selector: 'mifosx-activate-fixed-deposits-account',
  templateUrl: './activate-fixed-deposits-account.component.html',
  styleUrls: ['./activate-fixed-deposits-account.component.scss']
})
export class ActivateFixedDepositsAccountComponent implements OnInit {

  /** Minimum date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum date allowed. */
  maxDate = new Date();
  /** Activate Fixed Deposits Account form. */
  activateFixedDepositsAccountForm: UntypedFormGroup;
  /** Fixed Deposits Account Id */
  accountId: any;
  /** Fixed deposit account data resolved from the parent route. */
  fixedDepositsAccountData: any;

  /**
   * Activates the fixed deposit account using the Java/Fineract backend.
   * @param {FormBuilder} formBuilder Form Builder
   * @param {FixedDepositsService} fixedDepositsService Fixed Deposits Service
   * @param {Dates} dateUtils Date Utils
   * @param {ActivatedRoute} route Activated Route
   * @param {Router} router Router
   * @param {SettingsService} settingsService Settings Service
   */
  constructor(private formBuilder: UntypedFormBuilder,
              private fixedDepositsService: FixedDepositsService,
              private dateUtils: Dates,
              private route: ActivatedRoute,
              private router: Router,
              private settingsService: SettingsService) {
    this.accountId = this.route.parent.snapshot.params['fixedDepositAccountId'];
    this.fixedDepositsAccountData = this.resolveRouteData('fixedDepositsAccountData');
  }

  /**
   * Creates the activate fixed deposits form.
   */
  ngOnInit() {
    this.maxDate = this.settingsService.businessDate;
    this.createActivateFixedDepositsAccountForm();
  }

  /**
   * Creates the activate fixed deposits account form.
   */
  createActivateFixedDepositsAccountForm() {
    this.activateFixedDepositsAccountForm = this.formBuilder.group({
      'activatedOnDate': ['', Validators.required]
    });
  }

  /**
   * Submits the form and activates the fixed deposit account,
   * if successful redirects to the fixed deposit account.
   */
  submit() {
    const activateFixedDepositsAccountFormData = this.activateFixedDepositsAccountForm.value;
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const prevActivatedOnDate: Date = this.activateFixedDepositsAccountForm.value.activatedOnDate;
    if (activateFixedDepositsAccountFormData.activatedOnDate instanceof Date) {
      activateFixedDepositsAccountFormData.activatedOnDate = this.dateUtils.formatDate(prevActivatedOnDate, dateFormat);
    }
    const linkedAccountId = this.resolveLinkedFundingAccountId();
    const data = {
      ...activateFixedDepositsAccountFormData,
      dateFormat,
      locale,
      ...(linkedAccountId ? { fundingSavingsAccountId: linkedAccountId, linkAccountId: linkedAccountId } : {})
    };
    this.fixedDepositsService.executeFixedDepositsAccountCommand(this.accountId, 'activate', data).subscribe(() => {
      this.router.navigate(['../../'], { relativeTo: this.route });
    });
  }


  private resolveLinkedFundingAccountId(): any {
    const linkedAccount = this.fixedDepositsAccountData?.linkedAccount || this.fixedDepositsAccountData?.transferToSavingsAccount;
    return linkedAccount?.id || linkedAccount?.accountId || linkedAccount?.savingsAccountId || null;
  }

  private resolveRouteData(key: string): any {
    let currentRoute: ActivatedRoute = this.route;
    while (currentRoute) {
      if (currentRoute.snapshot?.data && currentRoute.snapshot.data[key]) {
        return currentRoute.snapshot.data[key];
      }
      currentRoute = currentRoute.parent;
    }
    return null;
  }

}
