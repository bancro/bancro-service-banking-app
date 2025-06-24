import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { DataImportComponent } from "./data-import.component";
import { extract } from "app/core/i18n/i18n.service";

/** Routing Imports */
import { Route } from '../core/route/route.service';

const routes: Routes = [
  Route.withShell([
    {
      path: "data-import",
      component: DataImportComponent,
      data: { title: extract("Imports"), breadcrumb: "Data Import", routeParamBreadcrumb: false },
    },
  ]),
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [],
})
export class DataImportRoutingModule {}
