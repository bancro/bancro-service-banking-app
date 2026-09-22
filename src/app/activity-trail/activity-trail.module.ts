import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { DirectivesModule } from '../directives/directives.module';
import { ActivityTrailRoutingModule } from './activity-trail-routing.module';
import { ActivityTrailComponent } from './activity-trail.component';
@NgModule({ imports: [SharedModule, DirectivesModule, ActivityTrailRoutingModule], declarations: [ActivityTrailComponent] })
export class ActivityTrailModule {}
