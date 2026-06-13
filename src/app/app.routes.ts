import { Routes } from '@angular/router';
import { Login } from './Components/login/login';
import { VistaTickets } from './Components/vista-tickets/vista-tickets';

export const routes: Routes = [
  { path: '', component: Login },
  {
    path: 'tickets',
    component: VistaTickets,
  },
];
