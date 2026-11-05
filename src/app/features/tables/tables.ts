import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';

import { ReservationService } from '../../core/services/reservation.service';
import { TableService } from '../../core/services/table.service';
import { RestaurantTable, TableStatus } from '../../models/table.model';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge';

@Component({
  selector: 'app-tables',
  standalone: true,
  imports: [CommonModule, StatusBadgeComponent],
  templateUrl: './tables.html',
  styleUrl: './tables.css',
})
export class TablesComponent {
  private readonly tableService = inject(TableService);
  private readonly reservationService = inject(ReservationService);

  readonly tables = this.tableService.tables;
  readonly selectedTableId = signal<string | null>(null);

  readonly selectedTable = computed(() => {
    const tableId = this.selectedTableId();
    return tableId ? this.tableService.getTableById(tableId) ?? null : this.tables()[0] ?? null;
  });

  readonly tableStatusOptions: TableStatus[] = ['Available', 'Reserved', 'Occupied', 'Cleaning', 'Maintenance'];

  constructor() {
    if (!this.selectedTableId()) {
      this.selectedTableId.set(this.tables()[0]?.id ?? null);
    }
  }

  selectTable(table: RestaurantTable): void {
    this.selectedTableId.set(table.id);
  }

  updateSelectedStatus(status: TableStatus): void {
    const tableId = this.selectedTableId();
    if (!tableId) {
      return;
    }

    this.tableService.updateTableStatus(tableId, status);
  }

  getCurrentReservation(table: RestaurantTable): string {
    if (!table.currentReservationId) {
      return 'No active reservation';
    }

    const reservation = this.reservationService.getReservationById(table.currentReservationId);
    return reservation ? `${reservation.customerName} · ${reservation.startTime}` : 'No active reservation';
  }
}
