import { Routes } from '@angular/router';
import { LoginComponent } from './pages/auth/login/login.component';
import { SignupComponent } from './pages/auth/signup/signup.component';
import { AppLayoutComponent } from './app-layout/app-layout.component';
import { AuthGuard } from './guards/auth.guard';
// import { GuestReserveComponent } from './pages/guest/guest-reserve/guest-reserve.component';

// ---------------------Manager-start---------------------------------
import { MenuManagementComponent } from './pages/manager/menu-management/menu-management.component';
import { StaffsComponent } from './pages/manager/staffs/staffs.component';
import { TableManagementComponent } from './pages/manager/table-management/table-management.component';
import { SettingsComponent } from './pages/manager/settings/settings.component';
import { ReportsComponent } from './pages/manager/reports/reports.component';
// ------------------------Manager-end----------------------------------


// -------------------------Waiter Start----------------------------------
import { WaiterTablesComponent } from './pages/waiter/my-tables/my-tables.component';
import { OrdersComponent } from './pages/waiter/orders/orders.component';
import { WaiterReadyComponent } from './pages/waiter/ready/ready.component';
import { BillingComponent } from './pages/waiter/billing/billing.component';
// --------------------------Waiter-end--------------------------------------


// -----------------------------Chef-Start-----------------------------------
import { KitchenQueueComponent } from './pages/chef/kitchen-queue/kitchen-queue.component';
import { InProgressComponent } from './pages/chef/in-progress/in-progress.component';
import { CompletedComponent } from './pages/chef/completed/completed.component';
// ---------------------------------Chef-End-------------------------------------


// -------------------------------Host-start--------------------------------------
import { HostDashboardComponent } from './pages/host/dashboard/dashboard.component';
// ----------------------------------Host-ends-------------------------------------

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'signup', component: SignupComponent },


    // ---------------------------------Chef---------------------------------


    {
        path: 'chef', component: AppLayoutComponent,
        canActivate: [AuthGuard],
        children: [
            { path: 'kitchen-queue', component: KitchenQueueComponent },
            { path: 'in-progress', component: InProgressComponent },
            { path: 'completed', component: CompletedComponent },
        ]
    },

    // ----------------------------Manager--------------------------

    {
        path: 'manager', component: AppLayoutComponent,
        canActivate: [AuthGuard],
        children: [
            { path: 'menu-management', component: MenuManagementComponent },
            { path: 'staffs', component: StaffsComponent },
            { path: 'assign-tables', component: TableManagementComponent },
            { path: 'settings', component: SettingsComponent },
            { path: 'reports', component: ReportsComponent },
        ]
    },


    // -----------------------------Waiter--------------------------------

    {
        path: 'waiter', component: AppLayoutComponent,
        canActivate: [AuthGuard],
        children: [
            { path: 'my-tables', component: WaiterTablesComponent },
            { path: 'orders', component: OrdersComponent },
            { path: 'ready', component: WaiterReadyComponent },
            { path: 'billing', component: BillingComponent },
        ]
    },


    // ---------------------------------Host-------------------------------

    // -----------------------------Host--------------------------------
    {
        path: 'host',
        component: AppLayoutComponent,
        canActivate: [AuthGuard],
        children: [
            { path: 'dashboard', component: HostDashboardComponent },
        ],
    },
    {
        path: 'guest-reserve',
        loadComponent: () =>
            import('./pages/guest/guest-reserve/guest-reserve.component').then(
                (m) => m.GuestReserveComponent
            ),
    },


    { path: '**', redirectTo: 'login' }
];
