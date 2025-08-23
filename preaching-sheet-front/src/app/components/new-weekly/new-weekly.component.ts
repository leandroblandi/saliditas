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
import { MatCheckboxModule } from '@angular/material/checkbox';
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
    MatSnackBarModule,
    MatCheckboxModule
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
      territories: ['', Validators.required],
      specialEvent: [false]
    });
  }

  addEvent(): void {
    const newEvent = this.createEventGroup();
    this.preachingEvents.push(newEvent);
    
    // Si el nuevo evento es especial, aplicar validaciones
    if (newEvent.get('specialEvent')?.value) {
      this.applySpecialEventValidation(newEvent, true);
    }
  }

  removeEvent(index: number): void {
    if (this.preachingEvents.length > 1) {
      this.preachingEvents.removeAt(index);
    }
  }

  onSpecialEventChange(event: any, index: number): void {
    console.log('Checkbox cambiado:', event.checked, 'para índice:', index);
    
    const eventGroup = this.preachingEvents.at(index) as FormGroup;
    const isSpecial = event.checked;
    
    // Actualizar el valor del checkbox primero
    eventGroup.get('specialEvent')?.setValue(isSpecial);
    
    // Luego aplicar la validación
    this.applySpecialEventValidation(eventGroup, isSpecial);
  }

  private applySpecialEventValidation(eventGroup: FormGroup, isSpecial: boolean): void {
    console.log('Aplicando validación para evento especial:', isSpecial);
    
    if (isSpecial) {
      // Para eventos especiales, solo fecha y descripción son requeridos
      eventGroup.get('time')?.clearValidators();
      eventGroup.get('conductorId')?.clearValidators();
      eventGroup.get('group')?.clearValidators();
      eventGroup.get('territories')?.clearValidators();
      
      // Limpiar valores y marcar como válidos
      eventGroup.get('time')?.setValue('');
      eventGroup.get('conductorId')?.setValue(null);
      eventGroup.get('group')?.setValue('');
      eventGroup.get('territories')?.setValue('');
      
      console.log('Validadores limpiados para evento especial');
    } else {
      // Para eventos normales, todos los campos son requeridos
      eventGroup.get('time')?.setValidators(Validators.required);
      eventGroup.get('conductorId')?.setValidators(Validators.required);
      eventGroup.get('group')?.setValidators(Validators.required);
      eventGroup.get('territories')?.setValidators(Validators.required);
      
      console.log('Validadores establecidos para evento normal');
    }
    
    // Actualizar validaciones
    eventGroup.get('time')?.updateValueAndValidity();
    eventGroup.get('conductorId')?.updateValueAndValidity();
    eventGroup.get('group')?.updateValueAndValidity();
    eventGroup.get('territories')?.updateValueAndValidity();
    
    console.log('Estado de validación después de actualizar:', {
      time: eventGroup.get('time')?.valid,
      conductorId: eventGroup.get('conductorId')?.valid,
      group: eventGroup.get('group')?.valid,
      territories: eventGroup.get('territories')?.valid
    });
    
    // Forzar la actualización de la validación del formulario completo
    this.form.updateValueAndValidity();
  }

  isSpecialEvent(index: number): boolean {
    const eventGroup = this.preachingEvents.at(index) as FormGroup;
    return eventGroup.get('specialEvent')?.value || false;
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
    console.log('Formulario enviado, estado:', this.form.value);
    console.log('Formulario válido:', this.form.valid);
    console.log('Formulario inválido:', this.form.invalid);
    
    // Verificar validación manualmente
    this.validateFormManually();
    
    // Verificar validación del formulario
    if (this.form.invalid) {
      // Mostrar información más detallada sobre los errores
      this.showValidationErrors();
      return;
    }

    const payload = this.form.value;
    console.log('Payload a enviar:', payload);
    
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

  private validateFormManually(): void {
    console.log('=== VALIDACIÓN MANUAL DEL FORMULARIO ===');
    
    this.preachingEvents.controls.forEach((control, index) => {
      const eventGroup = control as FormGroup;
      const isSpecial = eventGroup.get('specialEvent')?.value;
      
      console.log(`Evento ${index + 1} - Especial: ${isSpecial}`);
      console.log('  - Fecha válida:', eventGroup.get('date')?.valid);
      console.log('  - Hora válida:', eventGroup.get('time')?.valid);
      console.log('  - Lugar válido:', eventGroup.get('appointmentPlace')?.valid);
      console.log('  - Conductor válido:', eventGroup.get('conductorId')?.valid);
      console.log('  - Grupo válido:', eventGroup.get('group')?.valid);
      console.log('  - Territorios válidos:', eventGroup.get('territories')?.valid);
      
      if (isSpecial) {
        console.log(`  - Evento ${index + 1} es especial, solo fecha y descripción son requeridos`);
      } else {
        console.log(`  - Evento ${index + 1} es normal, todos los campos son requeridos`);
      }
    });
    
    console.log('=== FIN VALIDACIÓN MANUAL ===');
  }

  private showValidationErrors(): void {
    let errorMessage = 'Complete los campos requeridos:';
    let hasErrors = false;

    this.preachingEvents.controls.forEach((control, index) => {
      const eventGroup = control as FormGroup;
      const isSpecial = eventGroup.get('specialEvent')?.value;
      
      if (!isSpecial) {
        // Para eventos normales, verificar todos los campos
        if (eventGroup.get('date')?.invalid) {
          errorMessage += `\n- Evento ${index + 1}: Fecha requerida`;
          hasErrors = true;
        }
        if (eventGroup.get('time')?.invalid) {
          errorMessage += `\n- Evento ${index + 1}: Hora requerida`;
          hasErrors = true;
        }
        if (eventGroup.get('appointmentPlace')?.invalid) {
          errorMessage += `\n- Evento ${index + 1}: Punto de encuentro requerido`;
          hasErrors = true;
        }
        if (eventGroup.get('conductorId')?.invalid) {
          errorMessage += `\n- Evento ${index + 1}: Conductor requerido`;
          hasErrors = true;
        }
        if (eventGroup.get('group')?.invalid) {
          errorMessage += `\n- Evento ${index + 1}: Grupo requerido`;
          hasErrors = true;
        }
        if (eventGroup.get('territories')?.invalid) {
          errorMessage += `\n- Evento ${index + 1}: Territorios requeridos`;
          hasErrors = true;
        }
      } else {
        // Para eventos especiales, solo verificar fecha y descripción
        if (eventGroup.get('date')?.invalid) {
          errorMessage += `\n- Evento ${index + 1} (Especial): Fecha requerida`;
          hasErrors = true;
        }
        if (eventGroup.get('appointmentPlace')?.invalid) {
          errorMessage += `\n- Evento ${index + 1} (Especial): Descripción requerida`;
          hasErrors = true;
        }
      }
    });

    if (hasErrors) {
      this.snackBar.open(errorMessage, 'Cerrar', { duration: 5000, panelClass: ['error-snackbar'] });
    }
  }
}
