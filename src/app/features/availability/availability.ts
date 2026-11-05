import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { SettingsService } from '../../core/services/settings.service';
import { TableService } from '../../core/services/table.service';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge';

@Component({
  selector: 'app-availability',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, StatusBadgeComponent],
  templateUrl: './availability.html',
  styleUrl: './availability.css',
})
export class AvailabilityComponent {
  private readonly fb = inject(FormBuilder);
  private readonly tableService = inject(TableService);
  private readonly settingsService = inject(SettingsService);

  readonly settings = this.settingsService.settings;
  readonly availabilityForm = this.fb.group({
    date: [new Date().toISOString().slice(0, 10), Validators.required],
    startTime: ['18:00', Validators.required],
    guestCount: [2, [Validators.required, Validators.min(1)]],
    durationMinutes: [this.settings().defaultReservationDuration, [Validators.required, Validators.min(30)]],
  });

  readonly availableTables = computed(() => {
    const formValue = this.availabilityForm.getRawValue();
    const date = formValue.date;
    const time = formValue.startTime;
    const guests = Number(formValue.guestCount || 0);
    const duration = Number(formValue.durationMinutes || 0);

    if (!date || !time || !guests || !duration) {
      return [];
    }

    return this.tableService.getAvailableTables(date, time, guests, duration);
  });

  checkAvailability(): void {
    this.availabilityForm.markAllAsTouched();
  }
}
