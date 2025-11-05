import { Component } from '@angular/core';

@Component({
  selector: 'app-host',
  templateUrl: './host.component.html',
  styleUrls: ['./host.component.scss'],
})
export class HostComponent {
  tables = [
    { number: 1, occupied: false },
    { number: 2, occupied: true },
    { number: 3, occupied: false },
  ];

  seatCustomer(table: any) {
    table.occupied = true;
  }
}
