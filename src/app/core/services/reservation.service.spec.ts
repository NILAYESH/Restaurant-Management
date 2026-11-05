import { beforeEach, describe, expect, it } from 'vitest';

import { ReservationService } from './reservation.service';
import { StorageService } from './storage.service';
import { TableService } from './table.service';

describe('Reservation service', () => {
  let reservationService: ReservationService;
  let tableService: TableService;

  beforeEach(() => {
    localStorage.clear();
    const storageService = new StorageService();
    reservationService = new ReservationService(storageService);
    tableService = new TableService(reservationService, storageService);
  });

  it('should detect overlapping reservations on the same table', () => {
    reservationService.createReservation({
      id: 'RES-2001',
      customerName: 'Alicia Gates',
      phone: '+1 415 555 1010',
      email: 'alicia@example.com',
      date: '2026-11-05',
      startTime: '19:00',
      durationMinutes: 120,
      guestCount: 2,
      tableId: 'T-01',
      status: 'Confirmed',
    });

    expect(reservationService.hasConflict('T-01', '2026-11-05', '20:30', 90)).toBeTruthy();
    expect(reservationService.hasConflict('T-01', '2026-11-05', '21:30', 60)).toBeFalsy();
  });

  it('should ignore cancelled reservations when checking availability', () => {
    reservationService.createReservation({
      id: 'RES-2002',
      customerName: 'Milo Reed',
      phone: '+1 415 555 1011',
      email: 'milo@example.com',
      date: '2026-11-06',
      startTime: '18:30',
      durationMinutes: 120,
      guestCount: 4,
      tableId: 'T-02',
      status: 'Cancelled',
    });

    expect(reservationService.hasConflict('T-02', '2026-11-06', '18:45', 60)).toBeFalsy();
  });

  it('should return only tables that fit capacity and do not conflict', () => {
    const tables = tableService.tables();
    tableService.tables.set([
      { id: 'T-01', tableNumber: 1, capacity: 4, status: 'Available' },
      { id: 'T-02', tableNumber: 2, capacity: 2, status: 'Available' },
      { id: 'T-03', tableNumber: 3, capacity: 6, status: 'Maintenance' },
    ]);

    reservationService.createReservation({
      id: 'RES-2003',
      customerName: 'Karla West',
      phone: '+1 415 555 1012',
      email: 'karla@example.com',
      date: '2026-11-07',
      startTime: '19:00',
      durationMinutes: 120,
      guestCount: 3,
      tableId: 'T-01',
      status: 'Confirmed',
    });

    const availableTables = tableService.getAvailableTables('2026-11-07', '18:30', 3, 120);

    expect(availableTables.some((table) => table.id === 'T-01')).toBeFalsy();
    expect(availableTables.some((table) => table.id === 'T-02')).toBeFalsy();
    expect(availableTables.some((table) => table.id === 'T-03')).toBeFalsy();
  });
});
