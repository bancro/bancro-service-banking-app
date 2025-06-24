import { NgModule } from "@angular/core";
import { DataImportRoutingModule } from "./data-import-routing.module";
import { DataImportComponent } from "./data-import.component";
import { SharedModule } from "../shared/shared.module";
import { PipesModule } from "../pipes/pipes.module";
import { DirectivesModule } from "../directives/directives.module";
import { FormsModule } from "@angular/forms"; // <-- Import FormsModule here

@NgModule({
  imports: [SharedModule, PipesModule, DirectivesModule, DataImportRoutingModule, FormsModule],
  declarations: [DataImportComponent],
  providers: [],
})
export class DataImportModule {}
