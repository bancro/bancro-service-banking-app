import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { DirectivesModule } from '../directives/directives.module';
import { OperationsRoutingModule } from './operations-routing.module';
import { OperationsComponent } from './operations.component';
@NgModule({ imports: [SharedModule, DirectivesModule, OperationsRoutingModule], declarations: [OperationsComponent] })
export class OperationsModule {}
