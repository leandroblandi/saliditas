import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Person } from '../models/person.model';

@Injectable({
  providedIn: 'root'
})
export class PersonService {
  private endpoint = '/api/v1/persons';

  constructor(private apiService: ApiService) { }

  getAll(page: number = 0, size: number = 10, sort: string = 'fullName', direction: string = 'asc'): Observable<any> {
    let url = `${this.endpoint}?page=${page}&size=${size}`;
    
    // Agregar parámetros de sorting si están definidos
    if (sort) {
      url += `&sort=${sort}`;
      if (direction) {
        url += `&direction=${direction}`;
      }
    }
    
    return this.apiService.get<any>(url);
  }

  getAllWithoutPaginate(sort: string = 'fullName'): Observable<any> {
    let url = `${this.endpoint}/all`;
    
    // Agregar parámetros de sorting si están definidos
    if (sort) {
      url += `?sort=${sort}`;
    }
    
    return this.apiService.get<any>(url);
  }

  create(person: Partial<Person>): Observable<any> {
    // Los datos ya están en el formato correcto del backend
    return this.apiService.post<Person>(this.endpoint, person);
  }

  update(id: number, person: Partial<Person>): Observable<any> {
    // Los datos ya están en el formato correcto del backend
    return this.apiService.put<Person>(`${this.endpoint}/${id}`, person);
  }

  delete(id: number): Observable<any> {
    return this.apiService.delete<any>(`${this.endpoint}/${id}`);
  }

  disable(id: number): Observable<any> {
    return this.apiService.delete<any>(`${this.endpoint}/${id}`);
  }

  getActiveConductors(): Observable<any> {
    return this.apiService.get<Person[]>(`${this.endpoint}?active=true`);
  }

  getCountByRole(): Observable<any> {
    return this.apiService.get<{ [key: string]: number }>(`${this.endpoint}/count-by-roles`);
  }


  getActiveCount(): Observable<any> {
    return this.apiService.get<{ active_count: number }>(`${this.endpoint}/count-active`);
  }
}
