import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { SettingsService } from '../../core/services/settings.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './settings.html',
  styleUrl: './settings.css',
})
export class SettingsComponent {
  private readonly fb = inject(FormBuilder);
  private readonly settingsService = inject(SettingsService);

  readonly settings = this.settingsService.settings;
  readonly settingsForm = this.fb.group({
    restaurantName: [this.settings().restaurantName, Validators.required],
    contactNumber: [this.settings().contactNumber, Validators.required],
    email: [this.settings().email, [Validators.required, Validators.email]],
    openingTime: [this.settings().openingTime, Validators.required],
    closingTime: [this.settings().closingTime, Validators.required],
    defaultReservationDuration: [this.settings().defaultReservationDuration, [Validators.required, Validators.min(30)]],
    cleaningBufferMinutes: [this.settings().cleaningBufferMinutes, [Validators.required, Validators.min(0)]],
  });

  readonly statusMessage = this.settingsService.settings;

  saveSettings(): void {
    if (this.settingsForm.invalid) {
      this.settingsForm.markAllAsTouched();
      return;
    }

    const formValue = this.settingsForm.getRawValue();
    const restaurantName = formValue.restaurantName?.trim() ?? '';
    const contactNumber = formValue.contactNumber?.trim() ?? '';
    const email = formValue.email?.trim() ?? '';
    const openingTime = formValue.openingTime ?? '';
    const closingTime = formValue.closingTime ?? '';

    if (!restaurantName || !contactNumber || !email || !openingTime || !closingTime) {
      return;
    }

    this.settingsService.updateSettings({
      restaurantName,
      contactNumber,
      email,
      openingTime,
      closingTime,
      defaultReservationDuration: Number(formValue.defaultReservationDuration ?? 120),
      cleaningBufferMinutes: Number(formValue.cleaningBufferMinutes ?? 30),
    });
  }
}
