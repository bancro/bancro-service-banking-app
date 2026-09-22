import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReconciliationComponent } from './reconciliation.component';

const routes: Routes = [{
  path: 'reconciliation',
  component: ReconciliationComponent,
  data: { title: 'Settlement & Reconciliation', breadcrumb: 'Settlement & Reconciliation' }
}];

@NgModule({ imports: [RouterModule.forChild(routes)], exports: [RouterModule] })
export class ReconciliationRoutingModule {}
