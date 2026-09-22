import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { DirectivesModule } from '../directives/directives.module';
import { TellerWorkstationRoutingModule } from './teller-workstation-routing.module';
import { TellerWorkstationComponent } from './teller-workstation.component';

@NgModule({
  imports: [SharedModule, DirectivesModule, TellerWorkstationRoutingModule],
  declarations: [TellerWorkstationComponent]
})
export class TellerWorkstationModule {}
