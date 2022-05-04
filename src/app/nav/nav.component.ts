import { Component, OnInit } from '@angular/core';
import { ModalService } from '../services/modal.service';
import { AuthService } from '../services/auth.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css'],
})
export class NavComponent implements OnInit {
  constructor(
    public modal: ModalService,
    public authService: AuthService,
    private auth: AngularFireAuth
  ) {}

  ngOnInit(): void {}

  openModal(e: Event): void {
    e.preventDefault();
    this.modal.toggleModal('auth');
  }

  async logout(event: MouseEvent) {
    event.preventDefault();
    await this.auth.signOut();
  }
}
