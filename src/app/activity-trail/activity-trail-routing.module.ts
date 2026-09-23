import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ActivityTrailComponent } from './activity-trail.component';
const routes: Routes = [{ path: 'activity-trail', component: ActivityTrailComponent, data: { title: 'Bancro Current Activity Trail', breadcrumb: 'Current Activity Trail' } }];
@NgModule({ imports: [RouterModule.forChild(routes)], exports: [RouterModule] })
export class ActivityTrailRoutingModule {}
