import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TellerWorkstationComponent } from './teller-workstation.component';
import { Route } from '../core/route/route.service';

const routes: Routes = [
  Route.withShell([{
    path: 'teller-workstation',
    component: TellerWorkstationComponent,
    data: { title: 'Teller Workstation', breadcrumb: 'Teller Workstation' }
  }])
];

@NgModule({ imports: [RouterModule.forChild(routes)], exports: [RouterModule] })
export class TellerWorkstationRoutingModule {}
