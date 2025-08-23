import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';
import { WeeklyPreachingService } from '../../services/weekly-preaching.service';
import { WeeklyPreaching } from '../../models/weekly-preaching.model';
import { EmptyStateComponent, SkeletonTableComponent } from '../../shared';
import { ExcelToImageService } from '../../services/excel-to-image.service';

@Component({
  selector: 'app-previous-weeks',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    RouterModule,
    EmptyStateComponent,
    SkeletonTableComponent
  ],
  templateUrl: './previous-weeks.component.html',
  styleUrls: ['./previous-weeks.component.scss']
})
export class PreviousWeeksComponent implements OnInit {
  displayedColumns: string[] = ['period', 'month', 'events', 'actions'];
  dataSource = new MatTableDataSource<WeeklyPreaching>();
  total = 0;
  page = 0;
  pageSize = 10;

  isLoading = false;
  skeletonRows = Array(5).fill(0);

  // Loading states para cada fila
  exportingExcel = new Set<number>();
  exportingImage = new Set<number>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private weeklyService: WeeklyPreachingService,
    private snackBar: MatSnackBar,
    private excelToImageService: ExcelToImageService
  ) {}

  ngOnInit(): void {
    this.load();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  load(): void {
    this.isLoading = true;
    
    this.weeklyService.getAll(this.page, this.pageSize).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.dataSource.data = res.data.content || [];
          this.total = res.data.totalElements || 0;
          this.page = res.data.number || 0;
        }
        this.isLoading = false;
      },
      error: () => {
        this.snackBar.open('Error al cargar planillas', 'Cerrar', { duration: 2500 });
        this.isLoading = false;
      }
    });
  }

  changePage(event: any): void {
    this.page = event.pageIndex;
    this.pageSize = event.pageSize;
    this.load();
  }

  export(week: WeeklyPreaching): void {
    if (!week.id || this.exportingExcel.has(week.id)) return;
    
    this.exportingExcel.add(week.id);
    
    this.weeklyService.exportToExcel(week.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const first = new Date(week.startDate).getDate();
        const last = new Date(week.endDate).getDate();
        const name = `Hoja de salidas - ${first} al ${last} de ${week.monthName}.xlsx`;
        a.download = name;
        a.click();
        window.URL.revokeObjectURL(url);
        this.snackBar.open('Excel descargado exitosamente', 'Cerrar', { duration: 2500 });
      },
      error: () => {
        this.snackBar.open('Error al exportar Excel', 'Cerrar', { duration: 2500 });
      },
      complete: () => {
        this.exportingExcel.delete(week.id!);
      }
    });
  }

  exportToImage(week: WeeklyPreaching): void {
    if (!week.id || this.exportingImage.has(week.id)) return;
    
    this.exportingImage.add(week.id);
    
    // Primero exportar el Excel
    this.weeklyService.exportToExcel(week.id).subscribe({
      next: (excelBlob) => {
        // Convertir el blob del Excel a File
        const excelFile = new File([excelBlob], 'planilla.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        
        // Usar la misma lógica que el backend Java para construir el nombre de la hoja
        const firstEventDate = week.preachingEvents?.[0]?.date;
        const lastEventDate = week.preachingEvents?.[week.preachingEvents.length - 1]?.date;
        
        const firstDay = firstEventDate ? new Date(firstEventDate).getDate() : new Date(week.startDate).getDate();
        const lastDay = lastEventDate ? new Date(lastEventDate).getDate() : new Date(week.endDate).getDate();
        const sheetName = `Semana del ${firstDay} al ${lastDay} de ${week.monthName}`;
        
        // Configurar la solicitud para el servicio Python sin especificar hoja
        // El servicio Python se encargará de encontrar la hoja correcta
        const request = {
          file: excelFile,
          range: 'B2:G16'
          // No especificamos sheet, el servicio Python usará la primera hoja disponible
        };

        // Convertir a imagen usando el servicio Python
        this.excelToImageService.convertExcelToImage(request).subscribe({
          next: (imageBlob: Blob) => {
            // Generar nombre del archivo
            const filename = `Planilla_${firstDay}-${lastDay}_${week.monthName}.png`;
            
            // Descargar la imagen
            this.excelToImageService.downloadImage(imageBlob, filename);
            
            this.snackBar.open('Imagen exportada exitosamente', 'Cerrar', { duration: 2500 });
          },
          error: (error: any) => {
            console.error('Error al convertir a imagen:', error);
            this.snackBar.open('Error al exportar imagen', 'Cerrar', { duration: 2500 });
          },
          complete: () => {
            this.exportingImage.delete(week.id!);
          }
        });
      },
      error: () => {
        this.snackBar.open('Error al exportar Excel', 'Cerrar', { duration: 2500 });
        this.exportingImage.delete(week.id!);
      }
    });
  }

  // Helper methods para verificar estados de loading
  isExportingExcel(weekId: number | undefined): boolean {
    return weekId ? this.exportingExcel.has(weekId) : false;
  }

  isExportingImage(weekId: number | undefined): boolean {
    return weekId ? this.exportingImage.has(weekId) : false;
  }
}
