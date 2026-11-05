import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { ReservationService } from '../../core/services/reservation.service';
import { SettingsService } from '../../core/services/settings.service';
import { TableService } from '../../core/services/table.service';
import { Reservation, ReservationStatus } from '../../models/reservation.model';
import { ConfirmationModalComponent } from '../../shared/components/confirmation-modal/confirmation-modal';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge';

@Component({
  selector: 'app-reservations',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, StatusBadgeComponent, ConfirmationModalComponent],
  templateUrl: './reservations.html',
  styleUrl: './reservations.css',
})
export class ReservationsComponent {
  private readonly fb = inject(FormBuilder);
  private readonly reservationService = inject(ReservationService);
  private readonly tableService = inject(TableService);
  private readonly settingsService = inject(SettingsService);

  readonly reservations = this.reservationService.reservations;
  readonly tables = this.tableService.tables;
  readonly settings = this.settingsService.settings;

  readonly searchTerm = signal('');
  readonly dateFilter = signal('');
  readonly statusFilter = signal<'All' | ReservationStatus>('All');
  readonly tableFilter = signal('');
  readonly selectedReservationId = signal<string | null>(null);
  readonly modalVisible = signal(false);
  readonly modalTitle = signal('Confirm action');
  readonly modalMessage = signal('');
  readonly formError = signal('');

  readonly reservationForm = this.fb.group({
    customerName: ['', [Validators.required, Validators.minLength(2)]],
    phone: ['', [Validators.required, Validators.pattern(/^\+?[0-9\s()-]{7,}$/)]],
    email: ['', [Validators.required, Validators.email]],
    date: ['', Validators.required],
    startTime: ['', Validators.required],
    guestCount: [2, [Validators.required, Validators.min(1)]],
    tableId: ['', Validators.required],
    specialRequests: [''],
    status: ['Confirmed' as ReservationStatus, Validators.required],
  });

  readonly filteredReservations = computed(() =>
    this.reservationService.getFilteredReservations(
      this.searchTerm(),
      this.dateFilter(),
      this.statusFilter(),
      this.tableFilter(),
    ),
  );

  readonly availableTablesForSelection = computed(() => {
    const date = this.reservationForm.get('date')?.value;
    const time = this.reservationForm.get('startTime')?.value;
    const guests = Number(this.reservationForm.get('guestCount')?.value ?? 0);

    if (!date || !time || !guests) {
      return this.tables();
    }

    return this.tableService.getAvailableTables(date, time, guests, this.settings().defaultReservationDuration);
  });

  readonly tableOptions = computed(() => this.tables().slice().sort((first, second) => first.tableNumber - second.tableNumber));
  readonly statusOptions: ReservationStatus[] = ['Pending', 'Confirmed', 'Seated', 'Completed', 'Cancelled'];

  openCreateModal(): void {
    this.selectedReservationId.set(null);
    this.reservationForm.reset({
      customerName: '',
      phone: '',
      email: '',
      date: new Date().toISOString().slice(0, 10),
      startTime: '18:00',
      guestCount: 2,
      tableId: 'T-01',
      specialRequests: '',
      status: 'Confirmed',
    });
    this.formError.set('');
  }

  openEditModal(reservation: Reservation): void {
    this.selectedReservationId.set(reservation.id);
    this.reservationForm.reset({
      customerName: reservation.customerName,
      phone: reservation.phone,
      email: reservation.email,
      date: reservation.date,
      startTime: reservation.startTime,
      guestCount: reservation.guestCount,
      tableId: reservation.tableId,
      specialRequests: reservation.specialRequests ?? '',
      status: reservation.status,
    });
    this.formError.set('');
  }

  onSubmit(): void {
    if (this.reservationForm.invalid) {
      this.formError.set('Please complete all required reservation details with valid values.');
      this.reservationForm.markAllAsTouched();
      return;
    }

    const formValue = this.reservationForm.getRawValue();
    const durationMinutes = this.settings().defaultReservationDuration;
    const tableIdValue = formValue.tableId ?? '';

    if (!tableIdValue) {
      this.formError.set('Please select an available table for this reservation.');
      return;
    }

    const date = formValue.date ?? '';
    const startTime = formValue.startTime ?? '';
    const hasConflict = this.reservationService.hasConflict(
      tableIdValue,
      date,
      startTime,
      durationMinutes,
      this.selectedReservationId() ?? undefined,
    );

    if (hasConflict) {
      this.formError.set('This table overlaps with an existing reservation. Please choose another table or time.');
      return;
    }

    const customerName = formValue.customerName?.trim() ?? '';
    const phone = formValue.phone?.trim() ?? '';
    const email = formValue.email?.trim() ?? '';
    const status = (formValue.status ?? 'Confirmed') as ReservationStatus;

    const reservationPayload: Reservation = {
      id: this.selectedReservationId() ?? `RES-${Date.now()}`,
      customerName,
      phone,
      email,
      date,
      startTime,
      durationMinutes,
      guestCount: Number(formValue.guestCount ?? 1),
      tableId: tableIdValue,
      specialRequests: formValue.specialRequests?.trim() || undefined,
      status,
    };

    if (this.selectedReservationId()) {
      this.reservationService.updateReservation(reservationPayload);
      this.formError.set('Reservation updated successfully.');
    } else {
      this.reservationService.createReservation(reservationPayload);
      this.formError.set('Reservation created successfully.');
    }

    this.selectedReservationId.set(null);
    this.reservationForm.reset();
  }

  requestDelete(reservation: Reservation): void {
    this.selectedReservationId.set(reservation.id);
    this.modalTitle.set('Delete reservation');
    this.modalMessage.set(`Delete reservation for ${reservation.customerName}? This action cannot be undone.`);
    this.modalVisible.set(true);
  }

  requestCancel(reservation: Reservation): void {
    this.selectedReservationId.set(reservation.id);
    this.modalTitle.set('Cancel reservation');
    this.modalMessage.set(`Cancel reservation for ${reservation.customerName}?`);
    this.modalVisible.set(true);
  }

  confirmModalAction(): void {
    const reservationId = this.selectedReservationId();
    if (!reservationId) {
      this.modalVisible.set(false);
      return;
    }

    const reservation = this.reservationService.getReservationById(reservationId);
    if (!reservation) {
      this.modalVisible.set(false);
      return;
    }

    if (this.modalTitle() === 'Delete reservation') {
      this.reservationService.deleteReservation(reservationId);
      this.formError.set('Reservation deleted successfully.');
    }

    if (this.modalTitle() === 'Cancel reservation') {
      this.reservationService.cancelReservation(reservationId);
      this.formError.set('Reservation cancelled successfully.');
    }

    this.modalVisible.set(false);
    this.selectedReservationId.set(null);
  }

  closeModal(): void {
    this.modalVisible.set(false);
    this.selectedReservationId.set(null);
  }

  resetFilters(): void {
    this.searchTerm.set('');
    this.dateFilter.set('');
    this.statusFilter.set('All');
    this.tableFilter.set('');
  }

  formatDate(value: string): string {
    return new Date(`${value}T12:00:00`).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  }
}
