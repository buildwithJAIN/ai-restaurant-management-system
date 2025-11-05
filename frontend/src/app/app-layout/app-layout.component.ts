import { Component } from '@angular/core';
import { SidebarComponent } from '../components/sidebar/sidebar.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-layout',
  templateUrl: './app-layout.component.html',
  imports: [SidebarComponent, RouterModule],
  styleUrls: ['./app-layout.component.scss']
})
export class AppLayoutComponent { }
