/** Angular Imports */
import { Component, Input, OnChanges, ViewChild, ChangeDetectionStrategy } from "@angular/core";
import { MatTableDataSource, MatTable } from "@angular/material/table";
import { animate, state, style, transition, trigger } from "@angular/animations";
import { FormGroup, FormControl } from "@angular/forms"; // Import missing form controls

/** Type Definitions (Optional but recommended for type safety) */
interface ChartSlab {
  period: string;
  amountRange: string;
  interest: string;
  description: string;
  actions: any; // Adjust if there's a more specific type
}

interface Incentive {
  entityType: string;
  attributeName: string;
  conditionType: string;
  attributeValue: string;
  incentiveType: string;
  amount: number;
}

/**
 * Fixed Deposits Account Interest Rate Chart Step
 */
@Component({
  selector: "mifosx-fixed-deposit-account-interest-rate-chart-step",
  templateUrl: "./fixed-deposit-account-interest-rate-chart-step.component.html",
  styleUrls: ["./fixed-deposit-account-interest-rate-chart-step.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush, // Optimize change detection
  animations: [
    trigger("expandChartSlab", [
      state("collapsed", style({ height: "0px", minHeight: "0" })),
      state("expanded", style({ height: "*" })),
      transition("expanded <=> collapsed", animate("225ms cubic-bezier(0.4, 0.0, 0.2, 1)")),
    ]),
  ],
})
export class FixedDepositAccountInterestRateChartStepComponent implements OnChanges {
  /** Fixed deposits account template */
  @Input() fixedDepositsAccountTemplate!: any;

  /** Fixed deposits account and product template */
  @Input() fixedDepositsAccountProductTemplate!: any;

  /** Interest Rate Chart Data */
  interestRateChartData: ChartSlab[] = [];

  /** Columns to be displayed in interest rate chart table. */
  chartSlabsDisplayedColumns: string[] = ["period", "amountRange", "interest", "description", "actions"];

  /** Columns to be displayed in incentives sub-table. */
  incentivesDisplayedColumns: string[] = [
    "entityType",
    "attributeName",
    "conditionType",
    "attributeValue",
    "incentiveType",
    "amount",
  ];

  /** Additional Column to display incentives table */
  chartSlabsIncentivesDisplayedColumns: string[] = ["incentives"];

  /** Expand Chart Slab Index used in the view */
  expandChartSlabIndex: number | null = null;

  customInterestRate: FormGroup;

  /** Interest Rate charts table reference */
  @ViewChild("chartsTable", { static: true }) chartsTableRef!: MatTable<ChartSlab>;

  constructor() {
    // Initialize the form control with a more specific type
    this.customInterestRate = new FormGroup({
      rate: new FormControl<number | null>(null),
    });
  }

  ngOnInit() {
    this.customInterestRate.get("rate")?.valueChanges.subscribe((value) => {
      if (this.fixedDepositsAccountProductTemplate) {
        console.log("value", value);
        this.fixedDepositsAccountTemplate.customInterestRate = value;
      }
    });
  }

  ngOnChanges() {
    if (this.fixedDepositsAccountProductTemplate) {
      this.interestRateChartData = this.fixedDepositsAccountProductTemplate.accountChart.chartSlabs;
      this.chartsTableRef.renderRows();
    }
  }
}
