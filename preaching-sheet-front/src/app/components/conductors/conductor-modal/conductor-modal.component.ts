import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Person, MinistryRole, MinistryRoleLabels } from '../../../models/person.model';

export interface ConductorModalData {
  conductor?: Person;
  isEditing: boolean;
}

@Component({
  selector: 'app-conductor-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule
  ],
  templateUrl: './conductor-modal.component.html',
  styleUrls: ['./conductor-modal.component.scss']
})
export class ConductorModalComponent implements OnInit {
  conductorForm!: FormGroup;
  isEditing: boolean;
  ministryRoles = Object.values(MinistryRole);
  ministryRoleLabels = MinistryRoleLabels;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ConductorModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConductorModalData
  ) {
    this.isEditing = data.isEditing;
  }

  ngOnInit(): void {
    this.initForm();
    if (this.isEditing && this.data.conductor) {
      this.conductorForm.patchValue(this.data.conductor);
    }
  }

  private initForm(): void {
    this.conductorForm = this.fb.group({
      full_name: ['', [Validators.required, Validators.minLength(2)]],
      role: ['', Validators.required],
      active: [true]
    });
  }

  onSubmit(): void {
    if (this.conductorForm.valid) {
      const formData = this.conductorForm.value;
      this.dialogRef.close({
        success: true,
        data: formData
      });
    }
  }
}
