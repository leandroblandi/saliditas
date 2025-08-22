import { PreachingEvent } from './preaching-event.model';

export interface WeeklyPreaching {
  id?: number;
  preachingEvents: PreachingEvent[];
  startDate: Date;
  endDate: Date;
  monthName: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateWeeklyPreachingDto {
  preachingEvents: CreatePreachingEventDto[];
}

export interface CreatePreachingEventDto {
  date: Date;
  time: string;
  appointmentPlace: string;
  conductorId: number;
  group: string;
  territories: string;
}
