import { Person } from './person.model';

export interface PreachingEvent {
  id?: number;
  date: Date;
  time: string;
  appointmentPlace: string;
  assignee: Person;
  preachingGroup: string;
  territories: string;
  createdAt?: Date;
  updatedAt?: Date;
  specialEvent?: boolean;
}

export interface CreatePreachingEventDto {
  date: Date;
  time?: string;
  appointmentPlace: string;
  conductorId?: number;
  group?: string;
  territories?: string;
  specialEvent?: boolean;
}
