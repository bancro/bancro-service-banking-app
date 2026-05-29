/** Fixed Deposits Account Buttons Configuration */
export class FixedDepositsButtonsConfiguration {

  optionArray: {
    name: string
  }[];

  buttonsArray: {
    name: string,
    icon: string,
  }[];

  constructor(status: string) {
    this.setOptions(status);
    this.setButtons(status);
  }

  get singleButtons() {
    return this.buttonsArray;
  }

  get options() {
    return this.optionArray;
  }

  setButtons(status: string) {
    switch (status) {
      case 'Active':
        this.buttonsArray = [
          {
            name: 'Premature Close',
            icon: 'fa fa-arrow-left'
          },
          {
            name: 'Calculate Interest',
            icon: 'fa fa-table'
          }
        ];
        break;
      case 'Matured':
        this.buttonsArray = [
          {
            name: 'Close',
            icon: 'fa fa-arrow-right'
          },
          {
            name: 'Calculate Interest',
            icon: 'fa fa-table'
          }
        ];
      break;
      case 'Submitted and pending approval':
        this.buttonsArray = [
          {
            name: 'Modify Application',
            icon: 'fa fa-pencil '
          },
          {
            name: 'Approve',
            icon: 'fa fa-check'
          }
        ];
        break;
      case 'Approved':
        this.buttonsArray = [
          {
            name: 'Undo Approval',
            icon: 'fa fa-undo'
          },
          {
            name: 'Activate',
            icon: 'fa fa-check'
          }
        ];
      break;
      default:
        this.buttonsArray = [];
    }
  }

  setOptions(status: string) {
    switch (status) {
      case 'Active':
      case 'Matured':
        this.optionArray = [
          {
            name: 'Post Interest'
          },
          {
            name: 'Add Charge'
          },
          {
            name: 'Download Deal Certificate'
          }
        ];
        break;
      case 'Submitted and pending approval':
        this.optionArray = [
          {
            name: 'Reject'
          },
          {
            name: 'Withdraw By Client'
          },
          {
            name: 'Add Charge'
          },
          {
            name: 'Delete'
          }
        ];
        break;
      case 'Approved':
      default:
        this.optionArray = [];
    }
  }

  addOption(option: {name: string}) {
    if (!this.optionArray.some(existing => existing.name === option.name)) {
      this.optionArray.push(option);
    }
  }

  /**
   * Conditionally adds Bancro action options based on capabilities
   * and event accounting statuses returned from the bancro-details API.
   * Supports both flat allow* response fields and a nested capabilities object.
   */
  applyBancroCapabilities(bancroDetails: any) {
    if (!bancroDetails) { return; }

    const caps = bancroDetails.capabilities ?? bancroDetails;
    const events: any[] = bancroDetails.events ?? bancroDetails.bancroEvents ?? [];

    if (caps.allowUpfrontInterest) {
      this.addOption({ name: 'Pay Upfront Interest' });
    }
    if (caps.allowInterestLiquidation) {
      this.addOption({ name: 'Liquidate Interest' });
    }
    if (caps.allowPrincipalLiquidation) {
      this.addOption({ name: 'Liquidate Principal' });
    }
    if (caps.allowPrincipalInterestLiquidation) {
      this.addOption({ name: 'Liquidate Principal + Interest' });
    }
    if (caps.allowPrincipalTopup || caps.allowPrincipalTopUp) {
      this.addOption({ name: 'Top Up Principal' });
    }
    if (caps.allowInterestRateChange) {
      this.addOption({ name: 'Change Interest Rate' });
    }

    const hasPendingOrFailed = events.some(
      e => e.accountingStatus === 'PENDING' || e.accountingStatus === 'FAILED'
    );
    if (hasPendingOrFailed) {
      this.addOption({ name: 'Post Accounting' });
    }

    const hasFailed = events.some(e => e.accountingStatus === 'FAILED');
    if (hasFailed) {
      this.addOption({ name: 'Retry Accounting' });
    }

    const hasReversible = events.some(
      e => e.accountingStatus === 'POSTED' && (e.isReversible === true || e.reversible === true)
    );
    if (hasReversible) {
      this.addOption({ name: 'Reverse Bancro Event' });
    }
  }

}
