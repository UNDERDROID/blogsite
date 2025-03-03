import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SharedModule } from '../../shared.module';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatInputModule, MatLabel } from '@angular/material/input';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-update-user-dialog',
  standalone: true,
  imports: [
    SharedModule,
    MatDialogModule,
    MatInputModule,
    MatOptionModule,
    MatLabel,
    MatFormFieldModule
  ],
  templateUrl: './update-user-dialog.component.html',
  styleUrls: ['./update-user-dialog.component.css']
})
export class UpdateUserDialogComponent {
updateForm: FormGroup;

constructor(
  public dialogRef: MatDialogRef<UpdateUserDialogComponent>,
  @Inject(MAT_DIALOG_DATA) public data: { user: any },
    private fb: FormBuilder
){
   // Initialize the form with current user data
   this.updateForm = this.fb.group({
    username: [data.user.username, Validators.required],
    email: [data.user.email, [Validators.required, Validators.email]],
    role: [data.user.role, Validators.required]
  });
}
onCancel(): void {
  this.dialogRef.close();
}

onSave(): void {
  if (this.updateForm.valid) {
    this.dialogRef.close(this.updateForm.value);
  }
}
}
