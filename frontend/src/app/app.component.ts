import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router'; // ✅ import this

@Component({
  selector: 'app-root',
  standalone: true, // ✅ this is now a standalone component
  imports: [RouterOutlet], // ✅ tell Angular we’re using <router-outlet>
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'restaurant';
}
