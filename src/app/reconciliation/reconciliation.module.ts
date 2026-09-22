import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { DirectivesModule } from '../directives/directives.module';
import { ReconciliationRoutingModule } from './reconciliation-routing.module';
import { ReconciliationComponent } from './reconciliation.component';

@NgModule({
  imports: [SharedModule, DirectivesModule, ReconciliationRoutingModule],
  declarations: [ReconciliationComponent]
})
export class ReconciliationModule {}
