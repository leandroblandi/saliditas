import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { PersonService } from '../../services/person.service';
import { WeeklyPreachingService } from '../../services/weekly-preaching.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    RouterModule,
    NgChartsModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  totalConductors = 0;
  activeConductors = 0;
  totalWeeks = 0;
  currentWeekEvents = 0;
  
  // Configuración del gráfico de roles ministeriales
  public pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
      },
      title: {
        display: true,
        text: ''
      }
    }
  };
  
  public pieChartLabels: string[] = [];
  public pieChartType: ChartType = 'pie';
  public pieChartData: ChartData<'pie', number[], string> = {
    labels: [],
    datasets: []
  };

  constructor(
    private personService: PersonService,
    private weeklyPreachingService: WeeklyPreachingService
  ) { }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    // Cargar estadísticas de conductores
    this.personService.getAll().subscribe(response => {
      if (response.success && response.data) {
        this.totalConductors = response.data.page.totalElements || 0;
        // Ya no contamos activos en memoria, sino desde backend
        this.personService.getActiveCount().subscribe(activeRes => {
          this.activeConductors = activeRes.data.active_count || 0;
        });
  
        this.personService.getCountByRole().subscribe(roleRes => {
          this.loadRoleDistributionFromBackend(roleRes.data);
        });
      }
    });
  
    // Estadísticas de predicaciones semanales
    this.weeklyPreachingService.getAll().subscribe(response => {
      if (response.success && response.data) {
        this.totalWeeks = response.data.page.totalElements || 0;
      }
    });
  
    // Eventos de la semana actual
    this.weeklyPreachingService.getCurrentWeek().subscribe(response => {
      if (response.success && response.data) {
        this.currentWeekEvents = response.data.page.totalElements || 0;
      }
    });
  }

  private loadRoleDistributionFromBackend(roleCount: { [key: string]: number }): void {
    const roleLabels: { [key: string]: string } = {
      'AUXILIARY_PIONEER': 'Precursor Auxiliar',
      'REGULAR_PIONEER': 'Precursor Regular',
      'PUBLISHER': 'Publicador',
      'MINISTERIAL_SERVANT': 'Siervo Ministerial',
      'ELDER': 'Anciano'
    };
  
    this.pieChartData = {
      labels: Object.keys(roleCount).map(role => roleLabels[role] || role),
      datasets: [
        {
          data: Object.values(roleCount),
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF']
        }
      ]
    };
  }  
}
