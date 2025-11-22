import { Component } from '@angular/core';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/auth-service';


import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-layout-component',  
  standalone:true,
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
  templateUrl: './admin-layout-component.html',
  styleUrl: './admin-layout-component.scss'
})
export class AdminLayoutComponent {

  opened = true;
  userEmail = '';

  constructor(
    private router: Router, 
    private auth: AuthService
  ) {
    // this.userEmail = auth.getUserEmail() ?? '';
  }

  
   logout(): void {    
    this.auth.logout(); 
        
    this.router.navigate(['/login']);
  }


  navigate(path: string) {
    this.router.navigate([`/admin/${path}`]);
  }

}
