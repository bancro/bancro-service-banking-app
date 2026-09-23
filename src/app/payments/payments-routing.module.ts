import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PaymentsComponent } from './payments.component';
import { Route } from '../core/route/route.service';

const routes: Routes = [Route.withShell([
  { path: 'payments', component: PaymentsComponent, data: { title: 'Bancro Payments', breadcrumb: 'Payments' } }
])];

@NgModule({ imports: [RouterModule.forChild(routes)], exports: [RouterModule] })
export class PaymentsRoutingModule {}
