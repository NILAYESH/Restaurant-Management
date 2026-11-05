import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './status-badge.html',
  styleUrl: './status-badge.css',
})
export class StatusBadgeComponent {
  @Input() status: string = 'Pending';

  get badgeClass(): string {
    const mapping: Record<string, string> = {
      Confirmed: 'confirmed',
      Pending: 'pending',
      Seated: 'seated',
      Completed: 'completed',
      Cancelled: 'cancelled',
      Available: 'available',
      Reserved: 'reserved',
      Occupied: 'occupied',
      Cleaning: 'cleaning',
      Maintenance: 'maintenance',
    };

    return mapping[this.status] ?? 'neutral';
  }
}
