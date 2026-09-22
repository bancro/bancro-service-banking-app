import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TellerWorkstationComponent } from './teller-workstation.component';

const routes: Routes = [{
  path: 'teller-workstation',
  component: TellerWorkstationComponent,
  data: { title: 'Teller Workstation', breadcrumb: 'Teller Workstation' }
}];

@NgModule({ imports: [RouterModule.forChild(routes)], exports: [RouterModule] })
export class TellerWorkstationRoutingModule {}
