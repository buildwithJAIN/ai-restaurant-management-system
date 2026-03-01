import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'restaurant';
  private router = inject(Router);

  ngOnInit() {
    // Detect if the visitor is using a mobile device
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    // Redirect mobile users to guest-reserve
    if (isMobile) {
      this.router.navigateByUrl('/guest-reserve');
    }
  }
}
