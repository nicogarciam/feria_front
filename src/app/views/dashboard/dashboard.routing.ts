import { Routes } from "@angular/router";

import { DefaultDashboardComponent } from "./default-dashboard/default-dashboard.component";

export const DashboardRoutes: Routes = [
  {
    path: "",
    component: DefaultDashboardComponent,
    data: { title: "Default", breadcrumb: "Default" }
  }
];
