import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';

export interface ExcelToImageRequest {
  file: File;
  range: string;
  sheet?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ExcelToImageService {

  private readonly API_URL = 'http://localhost:5001';

  constructor(private http: HttpClient) { }

  /**
   * Convierte un rango de Excel a imagen PNG
   */
  convertExcelToImage(request: ExcelToImageRequest): Observable<Blob> {
    const formData = new FormData();
    formData.append('file', request.file);
    formData.append('range', request.range);
    
    if (request.sheet) {
      formData.append('sheet', request.sheet);
    }

    return this.http.post(`${this.API_URL}/excel-to-image`, formData, {
      responseType: 'blob'
    });
  }

  /**
   * Lista las hojas disponibles en el archivo Excel
   */
  listSheets(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.http.post(`${this.API_URL}/list-sheets`, formData);
  }

  /**
   * Verifica el estado del servicio Python
   */
  checkHealth(): Observable<any> {
    return this.http.get(`${this.API_URL}/health`);
  }

  /**
   * Descarga la imagen generada
   */
  downloadImage(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  }
}
