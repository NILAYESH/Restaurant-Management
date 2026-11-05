import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface NavItem {
  label: string;
  path: string;
  icon: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class SidebarComponent {
  @Input() currentRoute = '/dashboard';

  readonly navItems: NavItem[] = [
    { label: 'Dashboard', path: '/dashboard', icon: '⌂' },
    { label: 'Reservations', path: '/reservations', icon: '▤' },
    { label: 'Table Management', path: '/tables', icon: '▦' },
    { label: 'Availability', path: '/availability', icon: '◔' },
    { label: 'Settings', path: '/settings', icon: '⚙' },
  ];
}
