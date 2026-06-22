import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-badge-component',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-badge-component.html',
  styleUrl: './user-badge-component.css',
})
export class UserBadgeComponent {
  @Input() usuario: any = null; 
}
