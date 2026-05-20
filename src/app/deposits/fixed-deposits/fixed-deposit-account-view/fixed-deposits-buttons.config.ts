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
    this.optionArray.push(option);
  }

  /**
   * Conditionally adds Bancro action options based on capabilities
   * and event accounting statuses returned from the bancro-details API.
   */
  applyBancroCapabilities(bancroDetails: any) {
    if (!bancroDetails) { return; }

    const caps = bancroDetails.capabilities ?? {};
    const events: any[] = bancroDetails.events ?? [];

    if (caps.allowUpfrontInterest) {
      this.optionArray.push({ name: 'Pay Upfront Interest' });
    }
    if (caps.allowInterestLiquidation) {
      this.optionArray.push({ name: 'Liquidate Interest' });
    }
    if (caps.allowPrincipalLiquidation) {
      this.optionArray.push({ name: 'Liquidate Principal' });
    }
    if (caps.allowPrincipalInterestLiquidation) {
      this.optionArray.push({ name: 'Liquidate Principal + Interest' });
    }
    if (caps.allowPrincipalTopup) {
      this.optionArray.push({ name: 'Top Up Principal' });
    }
    if (caps.allowInterestRateChange) {
      this.optionArray.push({ name: 'Change Interest Rate' });
    }

    // Event-based: Post Accounting — any event with PENDING or FAILED accounting status
    const hasPendingOrFailed = events.some(
      e => e.accountingStatus === 'PENDING' || e.accountingStatus === 'FAILED'
    );
    if (hasPendingOrFailed) {
      this.optionArray.push({ name: 'Post Accounting' });
    }

    // Event-based: Retry Accounting — any event with FAILED accounting status
    const hasFailed = events.some(e => e.accountingStatus === 'FAILED');
    if (hasFailed) {
      this.optionArray.push({ name: 'Retry Accounting' });
    }

    // Event-based: Reverse Bancro Event — any event POSTED and reversible
    const hasReversible = events.some(
      e => e.accountingStatus === 'POSTED' && e.isReversible === true
    );
    if (hasReversible) {
      this.optionArray.push({ name: 'Reverse Bancro Event' });
    }
  }

}

