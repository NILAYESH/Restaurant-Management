import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ReservationService } from '../../core/services/reservation.service';
import { SettingsService } from '../../core/services/settings.service';
import { TableService } from '../../core/services/table.service';
import { ReservationStatus } from '../../models/reservation.model';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, StatCardComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class DashboardComponent {
  private readonly reservationService = inject(ReservationService);
  private readonly tableService = inject(TableService);
  private readonly settingsService = inject(SettingsService);

  readonly reservations = this.reservationService.reservations;
  readonly tables = this.tableService.tables;
  readonly settings = this.settingsService.settings;

  readonly todayDate = new Date().toISOString().slice(0, 10);

  readonly todayReservations = computed(() =>
    this.reservations().filter((reservation) => reservation.date === this.todayDate),
  );

  readonly upcomingReservations = computed(() =>
    [...this.reservations()]
      .filter((reservation) => reservation.status !== 'Cancelled')
      .sort((first, second) => {
        const firstValue = `${first.date}T${first.startTime}`;
        const secondValue = `${second.date}T${second.startTime}`;
        return new Date(firstValue).getTime() - new Date(secondValue).getTime();
      })
      .slice(0, 5),
  );

  readonly recentReservations = computed(() => [...this.reservations()].slice(-5).reverse());

  readonly availableTables = computed(() => this.tables().filter((table) => table.status === 'Available'));
  readonly occupiedTables = computed(() => this.tables().filter((table) => table.status === 'Occupied'));
  readonly cancelledReservations = computed(() =>
    this.reservations().filter((reservation) => reservation.status === 'Cancelled').length,
  );

  readonly totalGuestsExpected = computed(() =>
    this.reservations().reduce((total, reservation) => total + reservation.guestCount, 0),
  );

  readonly statusSummary = computed(() =>
    this.reservationService.getStatusBreakdown(),
  );

  readonly statusKeys: ReservationStatus[] = ['Confirmed', 'Pending', 'Seated', 'Completed', 'Cancelled'];

  getProgressPercentage(status: ReservationStatus): number {
    const total = Math.max(this.reservations().length, 1);
    return (this.statusSummary()[status] / total) * 100;
  }

  formatTime(time: string): string {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    return `${hours % 12 || 12}:${String(minutes).padStart(2, '0')} ${period}`;
  }

  formatDate(value: string): string {
    return new Date(`${value}T12:00:00`).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  }
}
