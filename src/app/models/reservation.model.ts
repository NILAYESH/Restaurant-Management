export type ReservationStatus = 'Pending' | 'Confirmed' | 'Seated' | 'Completed' | 'Cancelled';

export interface Reservation {
  id: string;
  customerName: string;
  phone: string;
  email: string;
  date: string;
  startTime: string;
  durationMinutes: number;
  guestCount: number;
  tableId: string;
  specialRequests?: string;
  status: ReservationStatus;
}
