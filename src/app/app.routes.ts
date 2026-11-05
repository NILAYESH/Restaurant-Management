import { Routes } from '@angular/router';

import { AvailabilityComponent } from './features/availability/availability';
import { DashboardComponent } from './features/dashboard/dashboard';
import { ReservationsComponent } from './features/reservations/reservations';
import { SettingsComponent } from './features/settings/settings';
import { TablesComponent } from './features/tables/tables';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'reservations', component: ReservationsComponent },
  { path: 'tables', component: TablesComponent },
  { path: 'availability', component: AvailabilityComponent },
  { path: 'settings', component: SettingsComponent },
  { path: '**', redirectTo: '/dashboard' },
];
