import { Component, OnInit } from '@angular/core';
import { SignalRService } from './services/signal-rservice';
import { RouterOutlet } from '@angular/router';



@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {

   constructor(private signal: SignalRService) {}

  ngOnInit(): void {
    this.signal.iniciar();  // 🔗 Inicia SignalR una sola vez
  }

  
}
