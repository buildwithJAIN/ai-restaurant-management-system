import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirm-modal.component.html',
  styleUrls: ['./confirm-modal.component.scss']
})
export class ConfirmModalComponent {

  @Input() visible: boolean = false;
  @Input() title: string = "Confirm Action";
  @Input() message: string = "Are you sure you want to continue?";

  @Output() onConfirm = new EventEmitter<boolean>();

  confirm() {
    this.onConfirm.emit(true);
    this.visible = false;
  }

  cancel() {
    this.onConfirm.emit(false);
    this.visible = false;
  }
}