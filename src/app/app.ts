import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SignalService } from './services/signal-service';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet,
    
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {

   constructor(private signalRService: SignalService) {}

   ngOnInit() {
    this.signalRService.startConnection(); 
  }
}
