import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-operador-layout-component',
  imports: [
    CommonModule,
    RouterOutlet,
    RouterModule,

    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatListModule,
    MatButtonModule,
  ],
  templateUrl: './operador-layout-component.html',
  styleUrl: './operador-layout-component.scss'
})
export class OperadorLayoutComponent {

  opened = true;
  userEmail = '';

  constructor(
    private router: Router, 
    private auth: AuthService
  ) {
    this.userEmail = auth.getUserEmail() ?? '';
  }

  
   logout(): void {    
    this.auth.logout(); 
        
    this.router.navigate(['/login']);
  }


  navigate(path: string) {
    this.router.navigate([`/operador/${path}`]);
  }

}
