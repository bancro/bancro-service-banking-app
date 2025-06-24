import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RepaymentScheduleTabComponent } from './repayment-schedule-tab.component';
import { MatTableExporterModule } from 'mat-table-exporter';

@NgModule({
  declarations: [
    RepaymentScheduleTabComponent
  ],
  imports: [
    CommonModule,
    MatTableExporterModule
  ],
  exports: [
    RepaymentScheduleTabComponent
  ]
})
export class RepaymentScheduleTabModule {}
