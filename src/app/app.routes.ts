import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Login } from './pages/login/login';
import { Dashboard } from './pages/dashboard/dashboard';
import { Checkout } from './pages/checkout/checkout';
import { MyTickets } from './pages/my-tickets/my-tickets';
import { Scanner } from './pages/scanner/scanner';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'login', component: Login },
  { path: 'dashboard', component: Dashboard, canActivate: [authGuard] },
  { path: 'checkout', component: Checkout, canActivate: [authGuard] },
  { path: 'my-tickets', component: MyTickets, canActivate: [authGuard] },
  { path: 'scan', component: Scanner, canActivate: [authGuard] },
  { path: '**', redirectTo: '' }
];
