import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PersonService } from '../../services/person.service';
import { WeeklyPreachingService } from '../../services/weekly-preaching.service';
import { Person } from '../../models/person.model';

@Component({
  selector: 'app-new-weekly',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './new-weekly.component.html',
  styleUrls: ['./new-weekly.component.scss']
})
export class NewWeeklyComponent {
  conductors: Person[] = [];
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private personService: PersonService,
    private weeklyService: WeeklyPreachingService,
    private snackBar: MatSnackBar
  ) {
    this.form = this.fb.group({
      preachingEvents: this.fb.array([this.createEventGroup()])
    });

    this.loadConductors();
  }

  get preachingEvents(): FormArray { return this.form.get('preachingEvents') as FormArray; }

  createEventGroup(): FormGroup {
    return this.fb.group({
      date: [null, Validators.required],
      time: ['', Validators.required],
      appointmentPlace: ['', Validators.required],
      conductorId: [null, Validators.required],
      group: ['', Validators.required],
      territories: ['', Validators.required]
    });
  }

  addEvent(): void {
    this.preachingEvents.push(this.createEventGroup());
  }

  removeEvent(index: number): void {
    if (this.preachingEvents.length > 1) {
      this.preachingEvents.removeAt(index);
    }
  }

  loadConductors(): void {
    this.personService.getAllWithoutPaginate().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.conductors = res.data.filter((p: Person) => p.active) || [];
        }
      }
    });
  }



  submit(): void {
    if (this.form.invalid) {
      this.snackBar.open('Complete los campos requeridos', 'Cerrar', { duration: 2500 });
      return;
    }

    const payload = this.form.value;
    this.weeklyService.create(payload).subscribe({
      next: (res) => {
        if (res.success) {
          this.snackBar.open('Planilla semanal creada', 'Cerrar', { duration: 2500 });
          this.form.reset();
          this.preachingEvents.clear();
          this.addEvent();
        }
      },
      error: () => this.snackBar.open('Error al crear planilla', 'Cerrar', { duration: 2500 })
    });
  }
}
