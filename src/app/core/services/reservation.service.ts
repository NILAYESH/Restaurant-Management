import { Injectable, signal } from '@angular/core';

import { Reservation, ReservationStatus } from '../../models/reservation.model';
import { StorageService } from './storage.service';

const RESERVATION_KEY = 'restaurant-reservations';

@Injectable({ providedIn: 'root' })
export class ReservationService {
  readonly reservations = signal<Reservation[]>([]);

  constructor(private readonly storageService: StorageService) {
    this.loadReservations();
  }

  private loadReservations(): void {
    const savedReservations = this.storageService.get<Reservation[]>(RESERVATION_KEY, []);
    const reservations = savedReservations.length > 0 ? savedReservations : this.createSampleReservations();
    this.reservations.set(reservations);
    this.storageService.set(RESERVATION_KEY, reservations);
  }

  private createSampleReservations(): Reservation[] {
    const today = new Date();
    const toDateString = (offset: number, hour: string, minute: string) => {
      const date = new Date(today);
      date.setDate(today.getDate() + offset);
      return {
        date: date.toISOString().slice(0, 10),
        time: `${hour}:${minute}`,
      };
    };

    return [
      {
        id: 'RES-1001',
        customerName: 'Olivia Chen',
        phone: '+1 (415) 555-0101',
        email: 'olivia.chen@example.com',
        date: toDateString(0, '18', '30').date,
        startTime: toDateString(0, '18', '30').time,
        durationMinutes: 120,
        guestCount: 2,
        tableId: 'T-01',
        specialRequests: 'Window seat preferred',
        status: 'Confirmed',
      },
      {
        id: 'RES-1002',
        customerName: 'Marcus Johnson',
        phone: '+1 (415) 555-0102',
        email: 'marcus.johnson@example.com',
        date: toDateString(0, '19', '00').date,
        startTime: toDateString(0, '19', '00').time,
        durationMinutes: 120,
        guestCount: 4,
        tableId: 'T-02',
        specialRequests: 'Birthday dessert requested',
        status: 'Seated',
      },
      {
        id: 'RES-1003',
        customerName: 'Sofia Martinez',
        phone: '+1 (415) 555-0103',
        email: 'sofia.martinez@example.com',
        date: toDateString(1, '18', '15').date,
        startTime: toDateString(1, '18', '15').time,
        durationMinutes: 90,
        guestCount: 2,
        tableId: 'T-03',
        specialRequests: 'Vegetarian menu',
        status: 'Pending',
      },
      {
        id: 'RES-1004',
        customerName: 'James Wilson',
        phone: '+1 (415) 555-0104',
        email: 'james.wilson@example.com',
        date: toDateString(1, '20', '00').date,
        startTime: toDateString(1, '20', '00').time,
        durationMinutes: 120,
        guestCount: 3,
        tableId: 'T-04',
        status: 'Confirmed',
      },
      {
        id: 'RES-1005',
        customerName: 'Amara Okafor',
        phone: '+1 (415) 555-0105',
        email: 'amara.okafor@example.com',
        date: toDateString(2, '19', '30').date,
        startTime: toDateString(2, '19', '30').time,
        durationMinutes: 150,
        guestCount: 2,
        tableId: 'T-05',
        specialRequests: 'Quiet booth',
        status: 'Completed',
      },
      {
        id: 'RES-1006',
        customerName: 'Ethan Brooks',
        phone: '+1 (415) 555-0106',
        email: 'ethan.brooks@example.com',
        date: toDateString(2, '20', '45').date,
        startTime: toDateString(2, '20', '45').time,
        durationMinutes: 120,
        guestCount: 5,
        tableId: 'T-06',
        status: 'Cancelled',
      },
      {
        id: 'RES-1007',
        customerName: 'Priya Singh',
        phone: '+1 (415) 555-0107',
        email: 'priya.singh@example.com',
        date: toDateString(3, '18', '45').date,
        startTime: toDateString(3, '18', '45').time,
        durationMinutes: 120,
        guestCount: 6,
        tableId: 'T-07',
        specialRequests: 'Anniversary dinner',
        status: 'Confirmed',
      },
      {
        id: 'RES-1008',
        customerName: 'Noah Walker',
        phone: '+1 (415) 555-0108',
        email: 'noah.walker@example.com',
        date: toDateString(-1, '19', '15').date,
        startTime: toDateString(-1, '19', '15').time,
        durationMinutes: 120,
        guestCount: 4,
        tableId: 'T-08',
        status: 'Completed',
      },
    ];
  }

  saveReservations(reservations: Reservation[]): void {
    this.reservations.set(reservations);
    this.storageService.set(RESERVATION_KEY, reservations);
  }

  createReservation(reservation: Reservation): void {
    this.saveReservations([...this.reservations(), reservation]);
  }

  updateReservation(updatedReservation: Reservation): void {
    this.saveReservations(
      this.reservations().map((reservation) =>
        reservation.id === updatedReservation.id ? updatedReservation : reservation,
      ),
    );
  }

  deleteReservation(reservationId: string): void {
    this.saveReservations(this.reservations().filter((reservation) => reservation.id !== reservationId));
  }

  cancelReservation(reservationId: string): void {
    this.saveReservations(
      this.reservations().map((reservation) =>
        reservation.id === reservationId ? { ...reservation, status: 'Cancelled' } : reservation,
      ),
    );
  }

  getReservationById(reservationId: string): Reservation | undefined {
    return this.reservations().find((reservation) => reservation.id === reservationId);
  }

  checkOverlap(startTimeA: string, durationMinutesA: number, startTimeB: string, durationMinutesB: number): boolean {
    const startA = this.toMinutes(startTimeA);
    const endA = startA + durationMinutesA;
    const startB = this.toMinutes(startTimeB);
    const endB = startB + durationMinutesB;

    return startA < endB && startB < endA;
  }

  hasConflict(tableId: string, date: string, startTime: string, durationMinutes: number, excludeReservationId?: string): boolean {
    return this.reservations().some((reservation) => {
      if (reservation.id === excludeReservationId) {
        return false;
      }

      if (reservation.tableId !== tableId || reservation.date !== date) {
        return false;
      }

      if (reservation.status === 'Cancelled') {
        return false;
      }

      return this.checkOverlap(reservation.startTime, reservation.durationMinutes, startTime, durationMinutes);
    });
  }

  toMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  getUpcomingReservations(limit = 5): Reservation[] {
    return [...this.reservations()]
      .filter((reservation) => reservation.status !== 'Cancelled')
      .sort((first, second) => {
        const firstDateTime = `${first.date}T${first.startTime}`;
        const secondDateTime = `${second.date}T${second.startTime}`;
        return new Date(firstDateTime).getTime() - new Date(secondDateTime).getTime();
      })
      .slice(0, limit);
  }

  getStatusBreakdown(): Record<ReservationStatus, number> {
    return this.reservations().reduce(
      (summary, reservation) => {
        summary[reservation.status] += 1;
        return summary;
      },
      {
        Pending: 0,
        Confirmed: 0,
        Seated: 0,
        Completed: 0,
        Cancelled: 0,
      } as Record<ReservationStatus, number>,
    );
  }

  getFilteredReservations(
    searchTerm: string,
    date: string,
    status: ReservationStatus | 'All',
    tableId: string,
  ): Reservation[] {
    const normalizedTerm = searchTerm.trim().toLowerCase();

    return this.reservations().filter((reservation) => {
      const matchesTerm =
        !normalizedTerm ||
        reservation.customerName.toLowerCase().includes(normalizedTerm) ||
        reservation.id.toLowerCase().includes(normalizedTerm);

      const matchesDate = !date || reservation.date === date;
      const matchesStatus = status === 'All' || reservation.status === status;
      const matchesTable = !tableId || reservation.tableId === tableId;

      return matchesTerm && matchesDate && matchesStatus && matchesTable;
    });
  }
}
