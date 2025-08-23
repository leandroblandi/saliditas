import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Person, MinistryRole, MinistryRoleLabels } from '../../models/person.model';
import { PersonService } from '../../services/person.service';
import { EmptyStateComponent, SkeletonTableComponent } from '../../shared';
import { ConductorModalComponent, ConductorModalData } from './conductor-modal';


@Component({
  selector: 'app-conductors',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatPaginatorModule,
    MatSortModule,
    MatSnackBarModule,
    MatProgressBarModule,
    EmptyStateComponent,
    SkeletonTableComponent
  ],
  templateUrl: './conductors.component.html',
  styleUrls: ['./conductors.component.scss']
})
export class ConductorsComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  displayedColumns: string[] = ['fullName', 'role', 'active', 'preachingCount', 'createdAt', 'actions'];
  dataSource = new MatTableDataSource<Person>();
  
  totalElements = 0;
  currentPage = 0;
  pageSize = 5;

  statusCode: number = 200;
  isLoading = false;
  
  // Array para generar filas de skeleton
  skeletonRows = Array(5).fill(0);
  
  // Propiedades para sorting del servidor
  currentSort: string = 'fullName';
  currentSortDirection: 'asc' | 'desc' = 'asc';
  
  // Rate limiting para sorting
  sortRequestTimes: number[] = [];
  maxSortRequests = 10;
  sortTimeWindow = 30000; // 30 segundos en millisegundos
  isSortingDisabled = false;

  constructor(
    private personService: PersonService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadConductors();
  }

  ngAfterViewInit() {
    // No asignamos this.dataSource.paginator porque usamos paginación del servidor
    // this.dataSource.paginator = this.paginator;
    
    // Sincronizar el paginador con los valores actuales
    if (this.paginator) {
      this.paginator.pageIndex = this.currentPage;
      this.paginator.pageSize = this.pageSize;
      this.paginator.length = this.totalElements;
    }
  }

  loadConductors(): void {
    this.isLoading = true;
    this.statusCode = 200;
    
    this.personService.getAll(this.currentPage, this.pageSize, this.currentSort, this.currentSortDirection).subscribe({
      next: (response) => {
        if (response.success && response.data) {

          const activeConductors = response.data.content.filter((p: Person) => p.active == true) || [];
          this.dataSource.data = activeConductors;

          this.totalElements = response.data.page.totalElements || 0;
          this.currentPage = response.data.page.number || 0;
          
          // Actualizar el paginador con los nuevos valores
          if (this.paginator) {
            this.paginator.pageIndex = this.currentPage;
            this.paginator.length = this.totalElements;
          }
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.statusCode = error.status;
        this.showMessage('Error al cargar conductores', 'error');
        this.isLoading = false;
      }
    });
  }

  openAddConductorModal(): void {
    const dialogRef = this.dialog.open(ConductorModalComponent, {
      width: '700px',
      maxWidth: '95vw',
      height: 'auto',
      maxHeight: '90vh',
      data: { isEditing: false }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.success) {
        this.personService.create(result.data).subscribe({
          next: (response) => {
            if (response.success) {
              this.showMessage('Conductor creado exitosamente', 'success');
              this.loadConductors();
            } else {
              this.showMessage('Error al crear conductor', 'error');
            }
          },
          error: () => {
            this.showMessage('Error al crear conductor', 'error');
          }
        });
      }
    });
  }

  editConductor(conductor: Person): void {
    const dialogRef = this.dialog.open(ConductorModalComponent, {
      width: '700px',
      maxWidth: '95vw',
      height: 'auto',
      maxHeight: '90vh',
      data: { 
        conductor: conductor,
        isEditing: true 
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.success) {
        this.showMessage('Edición no disponible en la API (solo alta).', 'error');
      }
    });
  }

  deleteConductor(id: number): void {
    // Confirmar antes de eliminar
    if (confirm('¿Estás seguro de que quieres deshabilitar este conductor?')) {
      this.personService.disable(id).subscribe({
        next: (response) => {
          if (response.success) {
            this.showMessage('Conductor deshabilitado exitosamente', 'success');
            // Recargar la lista de conductores
            this.loadConductors();
          } else {
            this.showMessage(response.message || 'Error al deshabilitar el conductor', 'error');
          }
        },
        error: (error) => {
          console.error('Error al deshabilitar conductor:', error);
          this.showMessage('Error al deshabilitar el conductor', 'error');
        }
      });
    }
  }

  onPageChange(event: any): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadConductors();
  }

  sortByColumn(column: string): void {
    // Verificar rate limiting antes de proceder
    if (this.isSortingDisabled || !this.canMakeSortRequest()) {
      this.showMessage('Has alcanzado el límite de ordenamientos. Espera unos segundos.', 'error');
      return;
    }

    // Registrar el tiempo de la petición
    this.registerSortRequest();

    if (this.currentSort === column) {
      // Si es la misma columna, cambiar dirección
      this.currentSortDirection = this.currentSortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      // Si es una columna diferente, resetear a ascendente
      this.currentSort = column;
      this.currentSortDirection = 'asc';
    }
    
    // Resetear a la primera página cuando cambia el sorting
    this.currentPage = 0;
    
    // Cargar conductores con el nuevo sorting
    this.loadConductors();
  }

  getSortIcon(column: string): string {
    if (this.currentSort === column) {
      return this.currentSortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward';
    }
    return 'unfold_more';
  }

  private canMakeSortRequest(): boolean {
    const now = Date.now();
    
    // Filtrar peticiones que están dentro de la ventana de tiempo
    this.sortRequestTimes = this.sortRequestTimes.filter(
      time => now - time < this.sortTimeWindow
    );
    
    // Verificar si podemos hacer otra petición
    return this.sortRequestTimes.length < this.maxSortRequests;
  }

  private registerSortRequest(): void {
    const now = Date.now();
    this.sortRequestTimes.push(now);
    
    // Verificar si debemos deshabilitar temporalmente el sorting
    if (this.sortRequestTimes.length >= this.maxSortRequests) {
      this.isSortingDisabled = true;
      
      // Rehabilitar después de la ventana de tiempo
      setTimeout(() => {
        this.isSortingDisabled = false;
      }, this.sortTimeWindow);
    }
  }

  isSortingAllowed(): boolean {
    return !this.isSortingDisabled && this.canMakeSortRequest();
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  private showMessage(message: string, type: 'success' | 'error'): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
      panelClass: type === 'success' ? ['success-snackbar'] : ['error-snackbar']
    });
  }

  getRoleLabel(role: string): string {
    return MinistryRoleLabels[role as MinistryRole] || role;
  }

  getRoleClass(role: string): string {
    switch (role as MinistryRole) {
      case MinistryRole.ELDER:
        return 'role-elder';
      case MinistryRole.MINISTERIAL_SERVANT:
        return 'role-ministerial-servant';
      case MinistryRole.REGULAR_PIONEER:
        return 'role-regular-pioneer';
      case MinistryRole.AUXILIARY_PIONEER:
        return 'role-auxiliary-pioneer';
      case MinistryRole.PUBLISHER:
        return 'role-publisher';
      default:
        return 'role-default';
    }
  }
}
