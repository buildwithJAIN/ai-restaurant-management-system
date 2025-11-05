import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LoaderComponent } from '../loader/loader.component';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterModule, LoaderComponent],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit {
  role: string = '';
  roleName: string = ''
  showLogoutModal = false;
  loading: boolean = false
  menuItems: { label: string; route: string; icon: string }[] = [];

  constructor(private router: Router) { }

  ngOnInit() {
    debugger
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.role = user?.role || 'User';
    this.roleName = user?.firstName || 'User'
    this.setMenuItems();
  }

  setMenuItems() {
    switch (this.role.toLocaleLowerCase()) {
      case 'waiter':
        this.menuItems = [
          // { label: 'Dashboard', route: '/waiter/dashboard', icon: 'dashboard' },
          { label: 'My Tables', route: '/waiter/my-tables', icon: 'mytable' },
          { label: 'Orders', route: '/waiter/orders', icon: 'orders' },
          { label: 'Ready', route: '/waiter/ready', icon: 'ready' },
          { label: 'Billing', route: '/waiter/billing', icon: 'billing' },
        ];
        break;

      case 'host':
        this.menuItems = [
          { label: 'Dashboard', route: '/host/dashboard', icon: 'dashboard' },
          { label: 'Tables', route: '/host/tables', icon: 'tables' },
          { label: 'Reservations', route: '/host/reservations', icon: 'reservations' },
          { label: 'Reports', route: '/host/reports', icon: 'reports' },
          { label: 'Settings', route: '/host/settings', icon: 'settings' },
        ];
        break;

      case 'chef':
        this.menuItems = [
          { label: 'Kitchen Queue', route: '/chef/kitchen-queue', icon: 'kitchen' },
          { label: 'In-Progress', route: '/chef/in-progress', icon: 'inprogress' },
          { label: 'Completed Orders', route: '/chef/completed', icon: 'completed' }
        ];
        break;


      case 'manager':
        this.menuItems = [
          { label: 'Dashboard', route: '/manager/dashboard', icon: 'dashboard' },
          { label: 'Staff', route: '/manager/staffs', icon: 'staffs' },
          { label: 'Assign Tables', route: '/manager/assign-tables', icon: 'assignedtables' },
          { label: 'Menu Management', route: '/manager/menu-management', icon: 'menumanagement' },
          { label: 'Reports', route: '/manager/reports', icon: 'reports' },
          { label: 'Settings', route: '/manager/settings', icon: 'settings' },
        ];
        break;

      case 'owner':
        this.menuItems = [
          { label: 'Dashboard', route: '/owner/dashboard', icon: 'dashboard' },
          { label: 'Managers', route: '/owner/managers', icon: 'managers' },
          { label: 'Reports', route: '/owner/reports', icon: 'reports' },
          { label: 'Revenue', route: '/owner/revenue', icon: 'revenue' },
          { label: 'Analytics', route: '/owner/analytics', icon: 'analytics' },
          { label: 'Settings', route: '/owner/settings', icon: 'settings' },
        ];
        break;
    }
  }

  navigate(route: string) {
    this.router.navigate([route]);
  }

  // 🔹 Logout Modal Controls
  openLogoutModal() {
    this.showLogoutModal = true;
  }

  closeLogoutModal() {
    this.showLogoutModal = false;
  }

  logout() {
    localStorage.clear();
    this.showLogoutModal = false;
    this.router.navigate(['/login']);
  }
}
