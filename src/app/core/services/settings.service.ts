import { Injectable, signal } from '@angular/core';

import { RestaurantSettings } from '../../models/restaurant-settings.model';
import { StorageService } from './storage.service';

const SETTINGS_KEY = 'restaurant-settings';

@Injectable({ providedIn: 'root' })
export class SettingsService {
  readonly settings = signal<RestaurantSettings>({
    restaurantName: 'Saffron & Cedar',
    contactNumber: '+1 (415) 555-0199',
    email: 'hello@saffroncedar.com',
    openingTime: '17:00',
    closingTime: '23:00',
    defaultReservationDuration: 120,
    cleaningBufferMinutes: 30,
  });

  constructor(private readonly storageService: StorageService) {
    this.loadSettings();
  }

  private loadSettings(): void {
    const savedSettings = this.storageService.get<RestaurantSettings | null>(SETTINGS_KEY, null);
    this.settings.set(savedSettings ?? this.settings());
  }

  updateSettings(nextSettings: RestaurantSettings): void {
    this.settings.set(nextSettings);
    this.storageService.set(SETTINGS_KEY, nextSettings);
  }
}
