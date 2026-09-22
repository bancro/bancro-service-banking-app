import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { DirectivesModule } from '../directives/directives.module';
import { PaymentsRoutingModule } from './payments-routing.module';
import { PaymentsComponent } from './payments.component';
@NgModule({ imports: [SharedModule, DirectivesModule, PaymentsRoutingModule], declarations: [PaymentsComponent] })
export class PaymentsModule {}
