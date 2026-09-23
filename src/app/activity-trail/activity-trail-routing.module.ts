import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ActivityTrailComponent } from './activity-trail.component';
import { Route } from '../core/route/route.service';

const routes: Routes = [Route.withShell([
  { path: 'activity-trail', component: ActivityTrailComponent, data: { title: 'Bancro Current Activity Trail', breadcrumb: 'Audit & Activity' } }
])];

@NgModule({ imports: [RouterModule.forChild(routes)], exports: [RouterModule] })
export class ActivityTrailRoutingModule {}
