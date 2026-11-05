export type TableStatus = 'Available' | 'Reserved' | 'Occupied' | 'Cleaning' | 'Maintenance';

export interface RestaurantTable {
  id: string;
  tableNumber: number;
  capacity: number;
  status: TableStatus;
  currentReservationId?: string;
}
