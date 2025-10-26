import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth-service';
import { Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSpinner } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-login',  
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatSnackBarModule,
    MatSpinner
    
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {

  loginForm: FormGroup;
  loading = false;
  hide = true;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(4)]],
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.loading = true;
    const { email, password } = this.loginForm.value;

    this.authService.login({ email, password }).subscribe({
      next: (res) => {
        const rol = this.authService.getUserRole();
        this.snackBar.open('Inicio de sesión exitoso ✅', 'Cerrar', { duration: 2000 });
        
        switch (rol) {
          case 'Admin':
            this.router.navigate(['/admin']);
            break;
          case 'Operador':
            this.router.navigate(['/operador']);
            break;
          case 'Consulta':
            this.router.navigate(['/consulta']);
            break;
          default:
            this.router.navigate(['/login']);
        }
      },
      error: (err) => {
        this.loading = false;
        console.error('❌ Error de login:', err);
        const mensaje = err.error?.mensaje || 'Credenciales incorrectas';
        this.snackBar.open(mensaje, 'Cerrar', { duration: 3000 });
      },
      complete: () => (this.loading = false),
    });
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }

}
