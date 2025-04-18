import {ReservationInterface} from "./reservation-interface";
import {MonthCalendarInterface} from "./date-interface";

export interface PropertyInterface {
  id: number,
  name: string,
  image: string,
  weekdaysPrice: number,
  weekendPrice: number,
  isResort: true,
  reservationId: number,
  guestName: string,
  guestEmail: string,
  isPool: boolean,
  numberOfRooms: number,
  address: string,
  reservations?: ReservationInterface[],

  monthsCalendar: MonthCalendarInterface[]
}
