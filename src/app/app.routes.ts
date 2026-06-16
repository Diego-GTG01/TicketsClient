import { Routes } from '@angular/router';
import { Login } from './Components/login/login';
import { VistaTickets } from './Components/vista-tickets/vista-tickets';
import { VistaCrearTickets } from './Components/vista-crear-tickets/vista-crear-tickets';

export const routes: Routes = [
  { path: '', component: Login },
  {
    path: 'tickets',
    component: VistaTickets,
  },
  {
    path: 'report',
    component: VistaCrearTickets,
  },
];
