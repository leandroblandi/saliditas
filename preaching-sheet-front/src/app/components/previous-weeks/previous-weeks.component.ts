import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterModule } from '@angular/router';
import { WeeklyPreachingService } from '../../services/weekly-preaching.service';
import { WeeklyPreaching } from '../../models/weekly-preaching.model';
import { EmptyStateComponent } from '../../shared/components/empty-state';

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
    RouterModule,
    EmptyStateComponent
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

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private weeklyService: WeeklyPreachingService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.load();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  load(): void {
    this.weeklyService.getAll(this.page, this.pageSize).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.dataSource.data = res.data.content || [];
          this.total = res.data.totalElements || 0;
          this.page = res.data.number || 0;
        }
      },
      error: () => this.snackBar.open('Error al cargar planillas', 'Cerrar', { duration: 2500 })
    });
  }

  changePage(event: any): void {
    this.page = event.pageIndex;
    this.pageSize = event.pageSize;
    this.load();
  }

  export(week: WeeklyPreaching): void {
    if (!week.id) return;
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
      },
      error: () => this.snackBar.open('Error al exportar Excel', 'Cerrar', { duration: 2500 })
    });
  }
}
