import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'app-skeleton-table',
  standalone: true,
  imports: [CommonModule, MatProgressBarModule],
  template: `
    <div class="skeleton-table">
      <!-- Header skeleton -->
      <div class="skeleton-header">
        <div class="skeleton-title"></div>
      </div>
      
      <!-- Table skeleton -->
      <div class="skeleton-table-container">
        <table class="skeleton-table-element">
          <thead>
            <tr>
              <th *ngFor="let _ of columns; trackBy: trackByIndex" class="skeleton-header-cell">
                <div class="skeleton-header-content"></div>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let _ of skeletonRows; trackBy: trackByIndex" class="skeleton-row">
              <td *ngFor="let _ of columns; trackBy: trackByIndex" class="skeleton-cell">
                <div class="skeleton-content" [class]="getRandomSkeletonClass()"></div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .skeleton-table {
      padding: 16px;
    }
    
    .skeleton-header {
      margin-bottom: 16px;
    }
    
    .skeleton-title {
      height: 24px;
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: loading 1.5s infinite;
      border-radius: 4px;
      width: 200px;
    }
    
    .skeleton-table-container {
      overflow-x: auto;
    }
    
    .skeleton-table-element {
      width: 100%;
      border-collapse: collapse;
      border: 1px solid #e0e0e0;
      border-radius: 4px;
    }
    
    .skeleton-header-cell {
      padding: 16px 12px;
      text-align: left;
      font-weight: 500;
      color: rgba(0, 0, 0, 0.87);
      border-bottom: 1px solid #e0e0e0;
      background-color: #fafafa;
    }
    
    .skeleton-header-content {
      height: 20px;
      background: linear-gradient(90deg, #e0e0e0 25%, #d0d0d0 50%, #e0e0e0 75%);
      background-size: 200% 100%;
      animation: loading 1.5s infinite;
      border-radius: 4px;
      width: 80px;
    }
    
    .skeleton-row {
      border-bottom: 1px solid #e0e0e0;
    }
    
    .skeleton-row:nth-child(even) {
      background-color: #fafafa;
    }
    
    .skeleton-cell {
      padding: 16px 12px;
      vertical-align: middle;
    }
    
    .skeleton-content {
      height: 16px;
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: loading 1.5s infinite;
      border-radius: 4px;
      margin: 0 auto;
    }
    
    .skeleton-short { width: 60%; }
    .skeleton-medium { width: 80%; }
    .skeleton-long { width: 90%; }
    
    @keyframes loading {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
    
    /* Responsive */
    @media (max-width: 768px) {
      .skeleton-table {
        padding: 8px;
      }
      
      .skeleton-header-cell,
      .skeleton-cell {
        padding: 12px 8px;
      }
      
      .skeleton-header-content {
        width: 60px;
      }
    }
  `]
})
export class SkeletonTableComponent {
  @Input() skeletonRows: number[] = Array(5).fill(0);
  @Input() columns: number[] = Array(6).fill(0);
  
  trackByIndex(index: number): number {
    return index;
  }
  
  getRandomSkeletonClass(): string {
    const classes = ['skeleton-short', 'skeleton-medium', 'skeleton-long'];
    return classes[Math.floor(Math.random() * classes.length)];
  }
}
