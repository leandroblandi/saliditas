import { PreachingEvent, CreatePreachingEventDto } from './preaching-event.model';

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
