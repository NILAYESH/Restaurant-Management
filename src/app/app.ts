import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

import { SettingsService } from './core/services/settings.service';
import { NavbarComponent } from './shared/components/navbar/navbar';
import { SidebarComponent } from './shared/components/sidebar/sidebar';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, NavbarComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly router = inject(Router);
  readonly settings = inject(SettingsService).settings;
  readonly currentRoute = signal(this.router.url || '/dashboard');

  readonly pageTitle = computed(() => {
    const routeMap: Record<string, string> = {
      '/dashboard': 'Dashboard',
      '/reservations': 'Reservations',
      '/tables': 'Table Management',
      '/availability': 'Availability',
      '/settings': 'Settings',
    };

    return routeMap[this.currentRoute()] ?? 'Dashboard';
  });

  constructor() {
    this.router.events.subscribe(() => {
      this.currentRoute.set(this.router.url || '/dashboard');
    });
  }
}
