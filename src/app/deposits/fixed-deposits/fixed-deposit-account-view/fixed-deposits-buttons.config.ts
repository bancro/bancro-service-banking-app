/** Fixed Deposits Account Buttons Configuration */
export class FixedDepositsButtonsConfiguration {

  optionArray: {
    name: string,
    disabled?: boolean,
    message?: string
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

  addOption(option: {name: string, disabled?: boolean, message?: string}) {
    const existing = this.optionArray.find(item => item.name === option.name);
    if (existing) {
      existing.disabled = option.disabled;
      existing.message = option.message;
      return;
    }
    this.optionArray.push(option);
  }

  /**
   * Conditionally adds Bancro action options based on capabilities
   * and command/event accounting statuses returned from the bancro-details API.
   * Supports both flat allow* response fields and a nested capabilities object.
   */
  applyBancroCapabilities(bancroDetails: any) {
    if (!bancroDetails) { return; }

    const caps = bancroDetails.capabilities ?? bancroDetails;
    const events: any[] = bancroDetails.events ?? bancroDetails.bancroEvents ?? [];
    const availability = bancroDetails.commandAvailability ?? {};

    const addBancroOption = (
      label: string,
      command: string,
      capabilityEnabled: boolean,
      fallbackDisabledReason?: string
    ) => {
      const commandAvailability = availability[command];
      const hasAvailability = commandAvailability !== undefined && commandAvailability !== null;
      const fallbackDisabled = !!fallbackDisabledReason && !hasAvailability;
      const available = hasAvailability ? commandAvailability.available !== false : capabilityEnabled && !fallbackDisabled;

      if (!capabilityEnabled && !hasAvailability) { return; }

      this.addOption({
        name: label,
        disabled: !available,
        message: commandAvailability?.reason || fallbackDisabledReason
      });
    };

    const upfrontAlreadyTriggered = bancroDetails.upfrontInterestAlreadyTriggered === true
      || events.some(e => e.eventType === 'payUpfrontInterest' && e.eventStatus === 'ACTIVE');

    addBancroOption(
      'Pay Upfront Interest',
      'payUpfrontInterest',
      caps.allowUpfrontInterest === true,
      upfrontAlreadyTriggered ? 'Upfront interest has already been triggered for this fixed deposit.' : bancroDetails.payUpfrontInterestBlockReason
    );
    addBancroOption('Liquidate Interest', 'liquidateInterest', caps.allowInterestLiquidation === true);
    addBancroOption('Liquidate Principal', 'liquidatePrincipal', caps.allowPrincipalLiquidation === true);
    addBancroOption(
      'Liquidate Principal + Interest',
      'liquidatePrincipalAndInterest',
      caps.allowPrincipalInterestLiquidation === true
    );
    addBancroOption('Top Up Principal', 'topupPrincipal', caps.allowPrincipalTopup === true || caps.allowPrincipalTopUp === true);
    addBancroOption('Change Interest Rate', 'changeInterestRate', caps.allowInterestRateChange === true);

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
