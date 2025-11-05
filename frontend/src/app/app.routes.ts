import { Routes } from '@angular/router';
import { LoginComponent } from './pages/auth/login/login.component';
import { SignupComponent } from './pages/auth/signup/signup.component';
import { HostComponent } from './pages/host/host.component';
import { AppLayoutComponent } from './app-layout/app-layout.component';
import { AuthGuard } from './guards/auth.guard';

// ---------------------Manager-start---------------------------------
import { MenuManagementComponent } from './pages/manager/menu-management/menu-management.component';
import { DashboardComponent } from './pages/manager/dashboard/dashboard.component';
import { StaffsComponent } from './pages/manager/staffs/staffs.component';
import { TableManagementComponent } from './pages/manager/table-management/table-management.component';
import { SettingsComponent } from './pages/manager/settings/settings.component';
// ------------------------Manager-end----------------------------------


// -------------------------Waiter Start----------------------------------
import { WaiterTablesComponent } from './pages/waiter/my-tables/my-tables.component';
import { OrdersComponent } from './pages/waiter/orders/orders.component';
import { ReadyComponent } from './pages/waiter/ready/ready.component';
import { BillingComponent } from './pages/waiter/billing/billing.component';
// --------------------------Waiter-end--------------------------------------


// -----------------------------Chef-Start-----------------------------------
import { KitchenQueueComponent } from './pages/chef/kitchen-queue/kitchen-queue.component';
import { InProgressComponent } from './pages/chef/in-progress/in-progress.component';
import { CompletedComponent } from './pages/chef/completed/completed.component';
// ---------------------------------Chef-End-------------------------------------

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'signup', component: SignupComponent },
    { path: 'host', component: HostComponent },


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
            { path: 'dashboard', component: DashboardComponent },
            { path: 'staffs', component: StaffsComponent },
            { path: 'assign-tables', component: TableManagementComponent },
            { path: 'settings', component: SettingsComponent },
        ]
    },


    // -----------------------------Waiter--------------------------------

    {
        path: 'waiter', component: AppLayoutComponent,
        canActivate: [AuthGuard],
        children: [
            { path: 'my-tables', component: WaiterTablesComponent },
            { path: 'orders', component: OrdersComponent },
            { path: 'ready', component: ReadyComponent },
            { path: 'billing', component: BillingComponent },
        ]
    },

    { path: '**', redirectTo: 'login' }
];
