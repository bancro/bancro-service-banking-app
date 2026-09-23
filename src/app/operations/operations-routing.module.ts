import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OperationsComponent } from './operations.component';
import { Route } from '../core/route/route.service';

const routes: Routes = [
  Route.withShell([
    { path: 'operations', component: OperationsComponent, data: { title: 'Bancro Administration', breadcrumb: 'Administration' } },
    { path: 'operations/:area', component: OperationsComponent, data: { title: 'Bancro Administration', breadcrumb: 'Administration' } }
  ])
];

@NgModule({ imports: [RouterModule.forChild(routes)], exports: [RouterModule] })
export class OperationsRoutingModule {}
