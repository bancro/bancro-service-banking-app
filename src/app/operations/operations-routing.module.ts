import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OperationsComponent } from './operations.component';
const routes: Routes = [{ path: 'operations', component: OperationsComponent, data: { title: 'Bancro Administration & Operations', breadcrumb: 'Bancro Administration' } }];
@NgModule({ imports: [RouterModule.forChild(routes)], exports: [RouterModule] })
export class OperationsRoutingModule {}
