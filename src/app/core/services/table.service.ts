import { Injectable, signal } from '@angular/core';

import { RestaurantTable, TableStatus } from '../../models/table.model';
import { ReservationService } from './reservation.service';
import { StorageService } from './storage.service';

const TABLE_KEY = 'restaurant-tables';

@Injectable({ providedIn: 'root' })
export class TableService {
  readonly tables = signal<RestaurantTable[]>([]);

  constructor(
    private readonly reservationService: ReservationService,
    private readonly storageService: StorageService,
  ) {
    this.loadTables();
  }

  private loadTables(): void {
    const savedTables = this.storageService.get<RestaurantTable[]>(TABLE_KEY, []);
    this.tables.set(savedTables.length > 0 ? savedTables : this.buildDefaultTables());
    this.syncTableState();
  }

  private syncTableState(): void {
    const nextTables = this.tables().map((table) => {
      const latestReservation = this.reservationService
        .reservations()
        .find((reservation) => reservation.tableId === table.id && reservation.status !== 'Cancelled');

      const nextStatus: TableStatus =
        table.status === 'Maintenance' || table.status === 'Cleaning'
          ? table.status
          : latestReservation
            ? 'Reserved'
            : 'Available';

      return {
        ...table,
        currentReservationId: latestReservation?.id,
        status: nextStatus,
      };
    });

    this.tables.set(nextTables as RestaurantTable[]);
    this.storageService.set(TABLE_KEY, nextTables as RestaurantTable[]);
  }

  buildDefaultTables(): RestaurantTable[] {
    return Array.from({ length: 10 }, (_, index) => {
      const tableNumber = index + 1;
      const capacity = [2, 2, 4, 4, 6, 6, 8, 2, 4, 6][index] ?? 4;

      return {
        id: `T-${tableNumber.toString().padStart(2, '0')}`,
        tableNumber,
        capacity,
        status: tableNumber % 7 === 0 ? 'Cleaning' : 'Available',
      };
    });
  }

  getTableById(tableId: string): RestaurantTable | undefined {
    return this.tables().find((table) => table.id === tableId);
  }

  updateTableStatus(tableId: string, status: TableStatus): void {
    this.tables.update((currentTables) => {
      const nextTables = currentTables.map((table) =>
        table.id === tableId
          ? {
              ...table,
              status,
            }
          : table,
      );

      this.storageService.set(TABLE_KEY, nextTables);
      return nextTables;
    });
  }

  getAvailableTables(date: string, startTime: string, guestCount: number, durationMinutes = 120): RestaurantTable[] {
    const reservations = this.reservationService.reservations();

    return this.tables().filter((table) => {
      if (table.capacity < guestCount) {
        return false;
      }

      if (table.status === 'Maintenance' || table.status === 'Cleaning' || table.status === 'Occupied' || table.status === 'Reserved') {
        return false;
      }

      const overlaps = reservations.some((reservation) => {
        if (reservation.tableId !== table.id || reservation.status === 'Cancelled') {
          return false;
        }

        if (reservation.date !== date) {
          return false;
        }

        return this.reservationService.checkOverlap(
          reservation.startTime,
          reservation.durationMinutes,
          startTime,
          durationMinutes,
        );
      });

      return !overlaps;
    });
  }
}
