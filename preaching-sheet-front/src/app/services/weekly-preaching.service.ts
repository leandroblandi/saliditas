import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from './api.service';
import { WeeklyPreaching, CreateWeeklyPreachingDto } from '../models/weekly-preaching.model';

@Injectable({
  providedIn: 'root'
})
export class WeeklyPreachingService {
  private endpoint = '/api/v1/weekly_preachings';

  constructor(private apiService: ApiService) { }

  getAll(page: number = 0, size: number = 10): Observable<any> {
    return this.apiService.get<any>(`${this.endpoint}?page=${page}&size=${size}`).pipe(
      map(response => {
        if (response.success && response.data && response.data.content) {
          response.data.content = response.data.content.map((weekly: any) => ({
            id: weekly.id,
            preachingEvents: weekly.preaching_events?.map((event: any) => ({
              id: event.id,
              date: event.date,
              time: event.time,
              appointmentPlace: event.place,
              assignee: event.conductor ? {
                id: event.conductor.id,
                fullName: event.conductor.full_name,
                role: event.conductor.role,
                active: event.conductor.active
              } : null,
              preachingGroup: event.group,
              territories: event.territories,
              createdAt: event.created_at,
              updatedAt: event.updated_at
            })) || [],
            startDate: weekly.start,
            endDate: weekly.end_date,
            monthName: weekly.month_name,
            createdAt: weekly.created_at,
            updatedAt: weekly.updated_at
          }));
        }
        return response;
      })
    );
  }
  

  getById(id: number): Observable<any> {
    return this.apiService.get<any>(`${this.endpoint}/${id}`).pipe(
      map(response => {
        if (response.success && response.data) {
          const weekly: any = response.data;
          response.data = {
            id: weekly.id,
            preachingEvents: weekly.preaching_events?.map((event: any) => ({
              id: event.id,
              date: event.date,
              time: event.time,
              appointmentPlace: event.place,
              assignee: event.conductor ? {
                id: event.conductor.id,
                fullName: event.conductor.full_name,
                role: event.conductor.role,
                active: event.conductor.active
              } : null,
              preachingGroup: event.group,
              territories: event.territories,
              createdAt: event.created_at,
              updatedAt: event.updated_at
            })) || [],
            startDate: weekly.start,
            endDate: weekly.end_date,
            monthName: weekly.month_name,
            createdAt: weekly.created_at,
            updatedAt: weekly.updated_at
          };
        }
        return response;
      })
    );
  }
  

  create(weeklyPreaching: CreateWeeklyPreachingDto): Observable<any> {
    // Mapear campos del frontend al backend según el DTO CreatePreachingDto
    const backendData = {
      preaching_events: weeklyPreaching.preachingEvents.map(event => ({
        date: event.date,
        time: event.specialEvent ? null : event.time,
        appointment_place: event.appointmentPlace,
        conductor_id: event.specialEvent ? null : event.conductorId,
        group: event.specialEvent ? null : event.group,
        territories: event.specialEvent ? null : event.territories,
        special_event: event.specialEvent || false
      }))
    };
    return this.apiService.post<WeeklyPreaching>(this.endpoint, backendData);
  }

  exportToExcel(id: number): Observable<Blob> {
    return this.apiService.downloadFile(`${this.endpoint}/${id}/xls`);
  }

  getCurrentWeek(): Observable<any> {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
  
    return this.apiService.get<any>(`${this.endpoint}?startDate=${startOfWeek.toISOString()}`).pipe(
      map(response => {
        if (response.success && response.data?.content) {
          // mapeo sobre content
          response.data.content = response.data.content.map((weekly: any) => ({
            id: weekly.id,
            preachingEvents: weekly.preaching_events?.map((event: any) => ({
              id: event.id,
              date: event.date,
              time: event.time,
              appointmentPlace: event.place,
              assignee: event.conductor ? {
                id: event.conductor.id,
                fullName: event.conductor.full_name,
                role: event.conductor.role,
                active: event.conductor.active
              } : null,
              preachingGroup: event.group,
              territories: event.territories,
              createdAt: event.created_at,
              updatedAt: event.updated_at
            })) || [],
            startDate: weekly.start,
            endDate: weekly.end_date,
            monthName: weekly.month_name,
            createdAt: weekly.created_at,
            updatedAt: weekly.updated_at
          }));
        }
        return response;
      })
    );
  }
}