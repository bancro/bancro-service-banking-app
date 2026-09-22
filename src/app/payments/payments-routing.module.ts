import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PaymentsComponent } from './payments.component';
const routes: Routes = [{ path: 'payments', component: PaymentsComponent, data: { title: 'Bancro Payments', breadcrumb: 'Payments' } }];
@NgModule({ imports: [RouterModule.forChild(routes)], exports: [RouterModule] })
export class PaymentsRoutingModule {}
