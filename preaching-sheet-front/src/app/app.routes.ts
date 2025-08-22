import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ConductorsComponent } from './components/conductors/conductors.component';
import { NewWeeklyComponent } from './components/new-weekly/new-weekly.component';
import { PreviousWeeksComponent } from './components/previous-weeks/previous-weeks.component';

export const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'conductors', component: ConductorsComponent },
  { path: 'new-weekly', component: NewWeeklyComponent },
  { path: 'previous-weeks', component: PreviousWeeksComponent },
  { path: '**', redirectTo: '' }
];
